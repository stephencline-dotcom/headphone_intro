"use strict";

const lesson = window.HEADPHONE_HEROES_LESSON;
const classroom = window.HeadphoneClassroom;

const cardTitle = document.querySelector(".placeholder-card h2");
const statusBar = document.querySelector(".status-bar");

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

  const step = lesson[state.currentStep] || lesson[0];
  cardTitle.textContent = step.shortLabel;

  document.body.classList.toggle(
    "student-freeze-armed",
    state.freezeScreenArmed
  );

  if (!state.freezeScreenArmed) {
    freezeOverlay.classList.remove("is-visible");
    freezeOverlay.setAttribute("aria-hidden", "true");
  }

  statusBar.innerHTML = `
    <span class="status-dot"></span>
    Connected to Teacher
  `;
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
