"use strict";

const lesson = window.HEADPHONE_HEROES_LESSON;
const classroom = window.HeadphoneClassroom;

const statusCard = document.querySelector(".teacher-status");
const controls = document.querySelector(".teacher-controls");
const backButton = controls.querySelector("button:first-child");
const nextButton = controls.querySelector("button:last-child");

const controlPanel = document.createElement("div");
controlPanel.className = "classroom-controls";
controlPanel.innerHTML = `
  <label class="control-toggle">
    <span>
      <strong>Teacher Control</strong>
      <small>Teacher controls the lesson pace</small>
    </span>
    <input id="teacher-control-toggle" type="checkbox">
  </label>

  <label class="control-toggle freeze-toggle">
    <span>
      <strong>Freeze Screen</strong>
      <small>Student screens wait for teacher</small>
    </span>
    <input id="freeze-toggle" type="checkbox">
  </label>
`;

statusCard.insertAdjacentElement("afterend", controlPanel);

const teacherControlToggle =
  document.getElementById("teacher-control-toggle");

const freezeToggle =
  document.getElementById("freeze-toggle");

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

window.addEventListener("pagehide", releaseTeacherSession);

classroom.subscribe(renderTeacher);

classroom.fetchState()
  .then(() => {
    classroom.connect();
  })
  .catch((error) => {
    console.error(error);

    statusCard.innerHTML = `
      <strong>Connection Problem</strong>
      <span>Unable to reach classroom state.</span>
    `;
  });
