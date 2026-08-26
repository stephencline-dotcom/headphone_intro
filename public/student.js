"use strict";

const classroom = window.HeadphoneClassroom;
const lessonEngine = window.HeadphoneLessonEngine;

const lessonStage =
  document.getElementById("student-lesson-stage");

const statusBar =
  document.querySelector(".status-bar");

const freezeOverlay = document.createElement("div");
freezeOverlay.className = "freeze-overlay";
freezeOverlay.setAttribute("aria-hidden", "true");
freezeOverlay.innerHTML = `
  <div class="freeze-message">
    <div class="freeze-stop" aria-hidden="true">✋</div>
    <strong>WAIT</strong>
    <span>Teacher Time</span>
  </div>
`;

document.body.appendChild(freezeOverlay);

let currentState = classroom.getState();

function renderStudent(state) {
  currentState = state;

  lessonEngine.renderStudentStep(
    lessonStage,
    state.currentStep
  );

  document.body.classList.toggle(
    "student-freeze-armed",
    state.freezeScreenArmed
  );

  if (!state.freezeScreenArmed) {
    freezeOverlay.classList.remove("is-visible");
    freezeOverlay.setAttribute("aria-hidden", "true");
  }

  if (state.teacherPresent) {
    statusBar.innerHTML = `
      <span class="status-dot"></span>
      Teacher Connected
    `;
  } else {
    statusBar.innerHTML = `
      <span class="status-dot status-dot-offline"></span>
      Waiting for Teacher
    `;
  }
}

function interceptFrozenInteraction(event) {
  if (!currentState.freezeScreenArmed) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  freezeOverlay.classList.add("is-visible");
  freezeOverlay.setAttribute("aria-hidden", "false");
}

[
  "pointermove",
  "mousemove",
  "pointerdown",
  "mousedown",
  "click",
  "touchstart",
  "keydown",
  "wheel"
].forEach((eventName) => {
  window.addEventListener(
    eventName,
    interceptFrozenInteraction,
    {
      capture: true,
      passive: false
    }
  );
});

statusBar.innerHTML = `
  <span class="status-dot status-dot-offline"></span>
  Connecting to Teacher
`;

window.HeadphoneClassroomBootstrap.initialize()
  .then(() => {
    classroom.subscribe(renderStudent);
  })
  .catch((error) => {
    console.error(error);

    statusBar.innerHTML = `
      <span class="status-dot status-dot-offline"></span>
      Waiting for Teacher
    `;
  });
