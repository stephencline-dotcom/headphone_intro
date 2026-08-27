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
