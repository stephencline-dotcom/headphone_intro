"use strict";

window.HeadphoneLessonEngine = (() => {
  const lesson = window.HEADPHONE_HEROES_LESSON || [];

  function getStep(index) {
    return lesson[index] || lesson[0] || null;
  }

  function getStepCount() {
    return lesson.length;
  }

  function createVisual(step) {
    const visual = document.createElement("div");
    visual.className = "lesson-visual";
    visual.dataset.visual = step.visual || "placeholder";

    if (step.visual === "welcome") {
      visual.innerHTML = `
        <div class="welcome-visual">
          <div class="welcome-headphones" aria-hidden="true">🎧</div>
          <div class="welcome-stars" aria-hidden="true">★ ★ ★</div>
        </div>
      `;

      return visual;
    }

    if (step.visual.startsWith("headphones-")) {
      const highlight =
        step.visual.replace("headphones-", "");

      visual.innerHTML = `
        <div class="headphone-photo-stage"
             data-highlight="${highlight}">

          <img
            class="headphone-photo"
            src="/assets/images/classroom-headphones.png"
            alt="Blue classroom headphones"
          >

          <div class="part-highlight part-headband"
               aria-hidden="true"></div>

          <div class="part-highlight part-earpad-left"
               aria-hidden="true"></div>

          <div class="part-highlight part-earpad-right"
               aria-hidden="true"></div>

          <div class="part-highlight part-cord"
               aria-hidden="true"></div>

          <div class="part-highlight part-plug"
               aria-hidden="true"></div>
        </div>
      `;

      return visual;
    }

    visual.innerHTML = `
      <div class="lesson-visual-placeholder"
           aria-hidden="true">🎧</div>
    `;

    return visual;
  }

  function renderStudentStep(container, index) {
    const step = getStep(index);

    if (!step || !container) {
      return;
    }

    container.innerHTML = "";

    const wrapper = document.createElement("section");
    wrapper.className = "lesson-screen";
    wrapper.dataset.stepId = step.id;

    const visual = createVisual(step);

    const label = document.createElement("h2");
    label.className = "lesson-label";
    label.textContent = step.shortLabel;

    wrapper.appendChild(visual);
    wrapper.appendChild(label);

    container.appendChild(wrapper);
  }

  function renderTeacherPreview(container, index) {
    const step = getStep(index);

    if (!step || !container) {
      return;
    }

    container.innerHTML = `
      <div class="teacher-step-preview">
        <strong>${step.shortLabel}</strong>
        <span>${step.spokenInstruction}</span>
        <small>${index + 1} of ${getStepCount()}</small>
      </div>
    `;
  }

  return {
    getStep,
    getStepCount,
    renderStudentStep,
    renderTeacherPreview
  };
})();
