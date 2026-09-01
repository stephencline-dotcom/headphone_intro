"use strict";

const classroom = window.HeadphoneClassroom;
const lessonEngine = window.HeadphoneLessonEngine;

const lessonStage =
  document.getElementById("presentation-lesson-stage");

const teacherButton =
  document.getElementById("presentation-teacher");

const backButton =
  document.getElementById("presentation-back");

const nextButton =
  document.getElementById("presentation-next");


const freezeButton =
  document.getElementById("presentation-freeze");

const stopCatchingButton =
  document.getElementById("presentation-stop-catching");

const unlockAllButton =
  document.getElementById("presentation-unlock-all");

const freezeStatus =
  document.getElementById("presentation-freeze-status");

let currentState = classroom.getState();

function renderPresentation(state) {
  currentState = state;

  lessonEngine.renderStudentStep(
    lessonStage,
    state.currentStep,
    state.lessonId || "full"
  );

  backButton.disabled =
    state.currentStep <= 0;

  nextButton.disabled =
    state.currentStep >=
    lessonEngine.getStepCount(state.lessonId || "full") - 1;

  if (
    state.freezeScreenArmed &&
    state.freezeCatchEnabled
  ) {
    freezeStatus.textContent = "FREEZE READY";

    freezeButton.disabled = true;
    stopCatchingButton.disabled = false;
    unlockAllButton.disabled = false;

    document.body.dataset.presentationFreezeState =
      "catching";

    return;
  }

  if (
    state.freezeScreenArmed &&
    !state.freezeCatchEnabled
  ) {
    freezeStatus.textContent =
      "FROZEN STUDENTS ONLY";

    freezeButton.disabled = false;
    stopCatchingButton.disabled = true;
    unlockAllButton.disabled = false;

    document.body.dataset.presentationFreezeState =
      "frozen-only";

    return;
  }

  freezeStatus.textContent = "UNLOCKED";

  freezeButton.disabled = false;
  stopCatchingButton.disabled = true;
  unlockAllButton.disabled = true;

  document.body.dataset.presentationFreezeState =
    "unlocked";
}

async function updateStep(nextStep) {
  const response = await fetch("/api/classroom-state", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      currentStep: nextStep
    })
  });

  if (response.status === 401) {
    window.location.href = "/teacher-login";
    return;
  }

  if (!response.ok) {
    throw new Error("Unable to change lesson step.");
  }
}

async function updateFreezeState(changes) {
  const response = await fetch("/api/classroom-state", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(changes)
  });

  if (response.status === 401) {
    window.location.href = "/teacher-login";
    return;
  }

  if (!response.ok) {
    throw new Error(
      "Unable to update Freeze state."
    );
  }
}

freezeButton.addEventListener("click", async () => {
  try {
    await updateFreezeState({
      freezeScreenArmed: true,
      freezeCatchEnabled: true
    });
  } catch (error) {
    console.error(error);
  }
});

stopCatchingButton.addEventListener(
  "click",
  async () => {
    try {
      await updateFreezeState({
        freezeCatchEnabled: false
      });
    } catch (error) {
      console.error(error);
    }
  }
);

unlockAllButton.addEventListener(
  "click",
  async () => {
    try {
      await updateFreezeState({
        freezeScreenArmed: false,
        freezeCatchEnabled: false
      });
    } catch (error) {
      console.error(error);
    }
  }
);

teacherButton.addEventListener("click", () => {
  window.location.href = "/teacher";
});

backButton.addEventListener("click", async () => {
  if (currentState.currentStep <= 0) {
    return;
  }

  try {
    await updateStep(
      currentState.currentStep - 1
    );
  } catch (error) {
    console.error(error);
  }
});

nextButton.addEventListener("click", async () => {
  if (
    currentState.currentStep >=
    lessonEngine.getStepCount(
      currentState.lessonId || "full"
    ) - 1
  ) {
    return;
  }

  try {
    await updateStep(
      currentState.currentStep + 1
    );
  } catch (error) {
    console.error(error);
  }
});

window.HeadphoneClassroomBootstrap.initialize()
  .then(() => {
    classroom.subscribe(renderPresentation);
  })
  .catch((error) => {
    console.error(
      "Presentation connection failed.",
      error
    );

    lessonStage.innerHTML = `
      <section class="presentation-waiting">
        <strong>Waiting for Teacher</strong>
      </section>
    `;
  });

/* ===== Presentation teacher heartbeat ===== */

let presentationHeartbeatTimer = null;

async function sendPresentationHeartbeat() {
  try {
    const response = await fetch("/api/teacher-heartbeat", {
      method: "POST"
    });

    if (response.status === 401) {
      return;
    }
  } catch (error) {
    console.warn("Presentation heartbeat failed.", error);
  }
}

function startPresentationHeartbeat() {
  sendPresentationHeartbeat();

  if (presentationHeartbeatTimer) {
    clearInterval(presentationHeartbeatTimer);
  }

  presentationHeartbeatTimer = setInterval(
    sendPresentationHeartbeat,
    10000
  );
}

startPresentationHeartbeat();
