"use strict";

const lesson = window.HEADPHONE_HEROES_LESSON;
const classroom = window.HeadphoneClassroom;

const statusCard = document.querySelector(".teacher-status");
const controls = document.querySelector(".teacher-controls");
const backButton = controls.querySelector("button:first-child");
const nextButton = controls.querySelector("button:last-child");

backButton.disabled = false;
nextButton.disabled = false;

function renderTeacher(state) {
  const step = lesson[state.currentStep] || lesson[0];

  statusCard.innerHTML = `
    <strong>${step.shortLabel}</strong>
    <span>Current Step: ${state.currentStep + 1} of ${lesson.length}</span>
  `;

  backButton.disabled = state.currentStep <= 0;
  nextButton.disabled = state.currentStep >= lesson.length - 1;
}

backButton.addEventListener("click", async () => {
  const state = classroom.getState();

  if (state.currentStep <= 0) {
    return;
  }

  await classroom.updateState({
    currentStep: state.currentStep - 1
  });
});

nextButton.addEventListener("click", async () => {
  const state = classroom.getState();

  if (state.currentStep >= lesson.length - 1) {
    return;
  }

  await classroom.updateState({
    currentStep: state.currentStep + 1
  });
});

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
