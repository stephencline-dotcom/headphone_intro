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
let lastRenderedStep = null;

function renderStudent(state) {
  const stepChanged =
    lastRenderedStep !== null &&
    state.currentStep !== lastRenderedStep;

  if (
    stepChanged &&
    typeof stopVolumePartySound === "function"
  ) {
    stopVolumePartySound();
  }

  currentState = state;
  lastRenderedStep = state.currentStep;

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

/* ===== Headphone sound test ===== */

async function playHeadphoneTestSound() {
  const AudioContext =
    window.AudioContext ||
    window.webkitAudioContext;

  if (!AudioContext) {
    console.warn("Web Audio is not available.");
    return;
  }

  const audioContext = new AudioContext();

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  const masterGain = audioContext.createGain();
  masterGain.connect(audioContext.destination);

  const now = audioContext.currentTime;

  masterGain.gain.setValueAtTime(0.0001, now);
  masterGain.gain.exponentialRampToValueAtTime(
    0.35,
    now + 0.03
  );
  masterGain.gain.exponentialRampToValueAtTime(
    0.0001,
    now + 1.15
  );

  const firstTone = audioContext.createOscillator();
  firstTone.type = "sine";
  firstTone.frequency.setValueAtTime(523.25, now);
  firstTone.connect(masterGain);
  firstTone.start(now);
  firstTone.stop(now + 0.5);

  const secondTone = audioContext.createOscillator();
  secondTone.type = "sine";
  secondTone.frequency.setValueAtTime(659.25, now + 0.52);
  secondTone.connect(masterGain);
  secondTone.start(now + 0.52);
  secondTone.stop(now + 1.05);

  setTimeout(() => {
    audioContext.close().catch(() => {});
  }, 1400);
}

lessonStage.addEventListener("click", (event) => {
  if (currentState.freezeScreenArmed) {
    return;
  }

  const currentStep =
    lessonEngine.getStep(currentState.currentStep);

  if (
    currentStep?.interactionType !== "sound-test"
  ) {
    return;
  }

  const check =
    event.target.closest(".plug-check-svg");

  if (!check) {
    return;
  }

  playHeadphoneTestSound();

  check.classList.remove("sound-test-played");

  void check.getBoundingClientRect();

  check.classList.add("sound-test-played");
});

/* ===== Volume-key practice sound ===== */

async function playVolumePracticeSound() {
  const AudioContext =
    window.AudioContext ||
    window.webkitAudioContext;

  if (!AudioContext) {
    return;
  }

  const audioContext = new AudioContext();

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = 440;

  gain.gain.setValueAtTime(
    0.16,
    audioContext.currentTime
  );

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start();

  const startTime = audioContext.currentTime;
  const endTime = startTime + 12;

  /*
    Gentle repeating pulse so students have time
    to practice the physical Chromebook volume keys.
  */
  for (let t = startTime; t < endTime; t += 1.2) {
    gain.gain.setValueAtTime(0.12, t);

    gain.gain.linearRampToValueAtTime(
      0.18,
      Math.min(t + 0.45, endTime)
    );

    gain.gain.linearRampToValueAtTime(
      0.12,
      Math.min(t + 1.0, endTime)
    );
  }

  oscillator.stop(endTime);

  setTimeout(() => {
    audioContext.close().catch(() => {});
  }, 12300);
}

lessonStage.addEventListener("click", (event) => {
  if (currentState.freezeScreenArmed) {
    return;
  }

  const button =
    event.target.closest(".volume-test-button");

  if (!button) {
    return;
  }

  const step =
    lessonEngine.getStep(currentState.currentStep);

  if (step?.interactionType !== "volume-test") {
    return;
  }

  playVolumePracticeSound();
});

/* ===== Volume Party music ===== */

let partyMusic = null;

function stopVolumePartySound() {
  if (!partyMusic) {
    return;
  }

  partyMusic.pause();
  partyMusic.currentTime = 0;
  partyMusic = null;
}

async function playVolumePartySound() {
  stopVolumePartySound();

  partyMusic = new Audio("/assets/music/music.mp3");
  partyMusic.loop = true;
  partyMusic.volume = 0.45;

  try {
    await partyMusic.play();
  } catch (error) {
    console.error("Unable to play Volume Party music.", error);
  }
}

lessonStage.addEventListener("click", (event) => {
  if (currentState.freezeScreenArmed) {
    return;
  }

  const button =
    event.target.closest(".party-play-button");

  if (!button) {
    return;
  }

  const step =
    lessonEngine.getStep(currentState.currentStep);

  if (step?.interactionType !== "party-sound") {
    return;
  }

  if (partyMusic && !partyMusic.paused) {
    stopVolumePartySound();

    button.classList.remove("is-playing");
    button.querySelector("strong").textContent = "PLAY";

    return;
  }

  playVolumePartySound();

  button.classList.add("is-playing");
  button.querySelector("strong").textContent = "STOP";
});
