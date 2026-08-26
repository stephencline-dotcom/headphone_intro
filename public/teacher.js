"use strict";

const lesson = window.HEADPHONE_HEROES_LESSON;
const classroom = window.HeadphoneClassroom;

const statusCard = document.querySelector(".teacher-status");
const controls = document.querySelector(".teacher-controls");
const backButton = controls.querySelector("button:first-child");
const nextButton = controls.querySelector("button:last-child");

const teacherControlToggle =
  document.getElementById("teacher-control-toggle");

const freezeToggle =
  document.getElementById("freeze-toggle");

const teacherConnectionText =
  document.getElementById("teacher-connection-text");


backButton.disabled = false;
nextButton.disabled = false;

function renderTeacher(state) {
  const step = lesson[state.currentStep] || lesson[0];

  statusCard.innerHTML = `
    <strong>${step.shortLabel}</strong>
    <span>Current Step: ${state.currentStep + 1} of ${lesson.length}</span>
  `;

  teacherControlToggle.checked = state.teacherControlEnabled;
  freezeToggle.checked = state.freezeScreenArmed;

  backButton.disabled =
    !state.teacherControlEnabled ||
    state.currentStep <= 0;

  nextButton.disabled =
    !state.teacherControlEnabled ||
    state.currentStep >= lesson.length - 1;

  document.body.classList.toggle(
    "teacher-freeze-armed",
    state.freezeScreenArmed
  );

  if (teacherConnectionText) {
    teacherConnectionText.textContent =
      state.teacherPresent
        ? "Teacher Connected"
        : "Connecting...";
  }
}

backButton.addEventListener("click", async () => {
  const state = classroom.getState();

  if (
    !state.teacherControlEnabled ||
    state.currentStep <= 0
  ) {
    return;
  }

  await classroom.updateState({
    currentStep: state.currentStep - 1
  });
});

nextButton.addEventListener("click", async () => {
  const state = classroom.getState();

  if (
    !state.teacherControlEnabled ||
    state.currentStep >= lesson.length - 1
  ) {
    return;
  }

  await classroom.updateState({
    currentStep: state.currentStep + 1
  });
});

teacherControlToggle.addEventListener("change", async () => {
  await classroom.updateState({
    teacherControlEnabled: teacherControlToggle.checked
  });
});

freezeToggle.addEventListener("change", async () => {
  await classroom.updateState({
    freezeScreenArmed: freezeToggle.checked
  });
});

let teacherReleaseStarted = false;

function releaseTeacherSession() {
  if (teacherReleaseStarted) {
    return;
  }

  teacherReleaseStarted = true;

  const state = classroom.getState();

  if (!state.freezeScreenArmed) {
    return;
  }

  const payload = JSON.stringify({
    freezeScreenArmed: false
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      "/api/classroom-release",
      new Blob([payload], { type: "application/json" })
    );
    return;
  }

  fetch("/api/classroom-release", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: payload,
    keepalive: true
  }).catch(() => {});
}

classroom.subscribe(renderTeacher);

window.HeadphoneClassroomBootstrap.initialize()
  .catch((error) => {
    console.error(error);

    statusCard.innerHTML = `
      <strong>Connection Problem</strong>
      <span>Unable to reach classroom state.</span>
    `;
  });

const defaultTeacherControl =
  document.getElementById("default-teacher-control");

const spokenDirectionsSetting =
  document.getElementById("spoken-directions-setting");

const settingsSaveStatus =
  document.getElementById("settings-save-status");

let settingsSaveTimer = null;

async function loadPersistentSettings() {
  try {
    const response = await fetch("/api/settings");

    if (!response.ok) {
      throw new Error("Unable to load saved settings.");
    }

    const result = await response.json();

    defaultTeacherControl.checked =
      result.settings.teacherControlDefault;

    spokenDirectionsSetting.checked =
      result.settings.spokenDirectionsEnabled;

    settingsSaveStatus.textContent =
      result.storageMode === "postgres"
        ? "Saved in persistent database"
        : "Saved locally for development";
  } catch (error) {
    console.error(error);
    settingsSaveStatus.textContent =
      "Unable to load saved settings";
  }
}

async function savePersistentSettings() {
  clearTimeout(settingsSaveTimer);

  settingsSaveStatus.textContent = "Saving...";

  settingsSaveTimer = setTimeout(async () => {
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          teacherControlDefault:
            defaultTeacherControl.checked,

          spokenDirectionsEnabled:
            spokenDirectionsSetting.checked
        })
      });

      if (!response.ok) {
        throw new Error("Unable to save settings.");
      }

      const result = await response.json();

      settingsSaveStatus.textContent =
        result.storageMode === "postgres"
          ? "Saved in persistent database"
          : "Saved locally for development";
    } catch (error) {
      console.error(error);
      settingsSaveStatus.textContent =
        "Save failed";
    }
  }, 250);
}

defaultTeacherControl.addEventListener(
  "change",
  savePersistentSettings
);

spokenDirectionsSetting.addEventListener(
  "change",
  savePersistentSettings
);

loadPersistentSettings();

const startLessonButton =
  document.getElementById("start-lesson-button");

const resetLessonButton =
  document.getElementById("reset-lesson-button");

async function runClassroomAction(endpoint) {
  const response = await fetch(endpoint, {
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(`Classroom action failed: ${endpoint}`);
  }

  return response.json();
}

startLessonButton.addEventListener("click", async () => {
  try {
    startLessonButton.disabled = true;

    await runClassroomAction("/api/classroom-start");
  } catch (error) {
    console.error("Unable to start lesson.", error);
  } finally {
    startLessonButton.disabled = false;
  }
});

resetLessonButton.addEventListener("click", async () => {
  try {
    resetLessonButton.disabled = true;

    await runClassroomAction("/api/classroom-reset");
  } catch (error) {
    console.error("Unable to reset lesson.", error);
  } finally {
    resetLessonButton.disabled = false;
  }
});

let teacherHeartbeatTimer = null;

async function sendTeacherHeartbeat() {
  try {
    await fetch("/api/teacher-heartbeat", {
      method: "POST"
    });
  } catch (error) {
    console.warn("Teacher heartbeat failed.", error);
  }
}

function startTeacherHeartbeat() {
  sendTeacherHeartbeat();

  if (teacherHeartbeatTimer) {
    clearInterval(teacherHeartbeatTimer);
  }

  teacherHeartbeatTimer = setInterval(
    sendTeacherHeartbeat,
    5000
  );
}

function leaveTeacherSession() {
  if (teacherHeartbeatTimer) {
    clearInterval(teacherHeartbeatTimer);
    teacherHeartbeatTimer = null;
  }

  const body = "{}";

  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      "/api/teacher-leave",
      new Blob([body], {
        type: "application/json"
      })
    );
    return;
  }

  fetch("/api/teacher-leave", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body,
    keepalive: true
  }).catch(() => {});
}

window.addEventListener("pagehide", leaveTeacherSession);

startTeacherHeartbeat();
