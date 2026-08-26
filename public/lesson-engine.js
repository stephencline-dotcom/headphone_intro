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

    if (step.visual.startsWith("party-")) {
      const mode = step.visual.replace("party-", "");

      visual.innerHTML = `
        <div class="volume-party" data-party="${mode}">
          <div class="party-stage">
            <div class="party-character party-character-one">★</div>
            <div class="party-character party-character-two">●</div>
            <div class="party-character party-character-three">♪</div>
            <div class="party-character party-character-four">★</div>
            <div class="party-character party-character-five">♫</div>
          </div>

          <button class="party-play-button" type="button">
            <span class="party-speaker">🔊</span>
            <strong>PLAY</strong>
          </button>
        </div>
      `;

      return visual;
    }

    if (step.visual.startsWith("volume-")) {
      const mode = step.visual.replace("volume-", "");

      visual.innerHTML = `
        <div class="volume-photo-stage" data-volume="${mode}">
          <svg
            class="volume-keyboard-svg"
            viewBox="0 0 1011 377"
            role="img"
            aria-label="Classroom Chromebook keyboard"
            preserveAspectRatio="xMidYMid meet"
          >
            <image
              href="/assets/images/mute.png"
              x="0"
              y="0"
              width="1011"
              height="377"
            ></image>

            <rect
              class="volume-highlight volume-highlight-mute"
              x="663"
              y="19"
              width="80"
              height="39"
              rx="9"
            ></rect>

            <rect
              class="volume-highlight volume-highlight-down"
              x="748"
              y="19"
              width="80"
              height="39"
              rx="9"
            ></rect>

            <rect
              class="volume-highlight volume-highlight-up"
              x="833"
              y="19"
              width="80"
              height="39"
              rx="9"
            ></rect>
          </svg>

          <button class="volume-test-button" type="button">
            🔊
            <span>PLAY</span>
          </button>
        </div>
      `;

      return visual;
    }

    if (step.visual.startsWith("position-")) {
      const mode = step.visual.replace("position-", "");

      visual.innerHTML = `
        <div class="position-visual" data-position="${mode}">
          <div class="position-head" aria-hidden="true">
            <div class="position-face">
              <div class="position-eyes">● ●</div>
            </div>

            <div class="position-headphones position-headphones-ears">
              <span class="position-band"></span>
              <span class="position-pad position-pad-left"></span>
              <span class="position-pad position-pad-right"></span>
            </div>

            <div class="position-headphones position-headphones-neck">
              <span class="position-neck-band"></span>
              <span class="position-neck-pad position-neck-pad-left"></span>
              <span class="position-neck-pad position-neck-pad-right"></span>
            </div>
          </div>

          <div class="position-symbol position-teacher-symbol" aria-hidden="true">
            👩‍🏫
          </div>

          <div class="position-symbol position-chromebook-symbol" aria-hidden="true">
            💻
          </div>

          <div class="position-symbol position-stop-symbol" aria-hidden="true">
            STOP
          </div>

          <div class="position-symbol position-go-symbol" aria-hidden="true">
            GO
          </div>

          <div class="neck-routine" aria-hidden="true">
            <div class="neck-routine-item">
              <span class="neck-routine-icon">👀</span>
              <strong>LOOK</strong>
            </div>

            <div class="neck-routine-item">
              <span class="neck-routine-icon">👂</span>
              <strong>LISTEN</strong>
            </div>

            <div class="neck-routine-item">
              <span class="neck-routine-icon">🙌</span>
              <strong>HANDS DOWN</strong>
            </div>
          </div>

          <div class="ears-routine" aria-hidden="true">
            <span class="ears-routine-icon">💻</span>
            <strong>WORK</strong>
          </div>

          <div class="position-practice-symbols" aria-hidden="true">
            <span>🎧</span>
            <span>↕</span>
            <span>👩‍🏫</span>
            <span>💻</span>
          </div>
        </div>
      `;

      return visual;
    }

    if (step.visual.startsWith("plug-")) {
      const mode = step.visual.replace("plug-", "");

      if (mode === "look-left") {
        visual.innerHTML = `
          <div class="plug-photo-stage plug-look-left-stage">
            <img
              class="plug-photo"
              src="/assets/images/left_plug.jpg"
              alt="Chromebook keyboard showing the left side"
            >
            <div class="plug-left-arrow" aria-hidden="true">←</div>
          </div>
        `;

        return visual;
      }

      if (mode === "find") {
        visual.innerHTML = `
          <div class="plug-photo-stage plug-side-stage">
            <svg
              class="plug-side-svg"
              viewBox="0 0 4080 3060"
              role="img"
              aria-label="Left side of classroom Chromebook"
              preserveAspectRatio="xMidYMid meet"
            >
              <image
                href="/assets/images/side.jpg"
                x="0"
                y="0"
                width="4080"
                height="3060"
              ></image>

              <ellipse
                class="plug-port-svg-ring"
                cx="3150"
                cy="1875"
                rx="145"
                ry="120"
              ></ellipse>
            </svg>
          </div>
        `;

        return visual;
      }

      if (mode === "hold") {
        visual.innerHTML = `
          <div class="plug-photo-stage">
            <img
              class="plug-photo"
              src="/assets/images/classroom-headphones.png"
              alt="Classroom headphones"
            >
            <div class="plug-headphone-highlight" aria-hidden="true"></div>
          </div>
        `;

        return visual;
      }

      if (mode === "push" || mode === "check") {
        visual.innerHTML = `
          <div class="plug-photo-stage plug-side-stage" data-plug="${mode}">
            <svg
              class="plug-side-svg"
              viewBox="0 0 4080 3060"
              role="img"
              aria-label="Left side of classroom Chromebook"
              preserveAspectRatio="xMidYMid meet"
            >
              <image
                href="/assets/images/side.jpg"
                x="0"
                y="0"
                width="4080"
                height="3060"
              ></image>

              <ellipse
                class="plug-port-svg-ring"
                cx="3150"
                cy="1875"
                rx="145"
                ry="120"
              ></ellipse>

              <text
                class="plug-direction-svg"
                x="2550"
                y="1930"
                text-anchor="middle"
              >→</text>

              <text
                class="plug-check-svg"
                x="3500"
                y="1150"
                text-anchor="middle"
              >✓</text>
            </svg>
          </div>
        `;

        return visual;
      }
    }

    if (step.visual.startsWith("fit-")) {
      const mode = step.visual.replace("fit-", "");

      visual.innerHTML = `
        <div class="fit-photo-stage" data-fit="${mode}">
          <img
            class="fit-headphone-photo"
            src="/assets/images/classroom-headphones.png"
            alt="Blue classroom headphones"
          >

          <div class="fit-rail fit-rail-left" aria-hidden="true"></div>
          <div class="fit-rail fit-rail-right" aria-hidden="true"></div>

          <div class="fit-arrow fit-arrow-left" aria-hidden="true">
            <span></span>
          </div>

          <div class="fit-arrow fit-arrow-right" aria-hidden="true">
            <span></span>
          </div>

          <div class="fit-ear-cue fit-ear-cue-left" aria-hidden="true"></div>
          <div class="fit-ear-cue fit-ear-cue-right" aria-hidden="true"></div>

          <div class="fit-ready-check" aria-hidden="true">✓</div>
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
