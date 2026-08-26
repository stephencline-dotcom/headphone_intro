"use strict";

const lesson = window.HEADPHONE_HEROES_LESSON;
const classroom = window.HeadphoneClassroom;

const cardTitle = document.querySelector(".placeholder-card h2");
const statusBar = document.querySelector(".status-bar");

function renderStudent(state) {
  const step = lesson[state.currentStep] || lesson[0];

  cardTitle.textContent = step.shortLabel;

  statusBar.innerHTML = `
    <span class="status-dot"></span>
    Connected to Teacher
  `;
}

classroom.subscribe(renderStudent);

classroom.fetchState()
  .then(() => {
    classroom.connect();
  })
  .catch((error) => {
    console.error(error);

    statusBar.innerHTML = `
      <span class="status-dot status-dot-offline"></span>
      Waiting for Teacher
    `;
  });
