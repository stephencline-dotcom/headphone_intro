"use strict";

window.HeadphoneLessonEngine = (() => {
  function getLesson(lessonId = "full") {
    const lessons =
      window.HEADPHONE_HEROES_LESSONS || {};

    return (
      lessons[lessonId]?.lesson ||
      lessons.full?.lesson ||
      window.HEADPHONE_HEROES_LESSON ||
      []
    );
  }

  function getStep(index, lessonId = "full") {
    const lesson = getLesson(lessonId);

    return lesson[index] || lesson[0] || null;
  }

  function getStepCount(lessonId = "full") {
    return getLesson(lessonId).length;
  }

  function createVisual(step) {
    const visual = document.createElement("div");
    visual.className = "lesson-visual";
    visual.dataset.visual = step.visual || "placeholder";

    if (step.visual === "hero-finish") {
      visual.innerHTML = `
        <div class="hero-finish-visual">
          <div class="hero-finish-stars" aria-hidden="true">
            ⭐ ⭐ ⭐
          </div>

          <div class="hero-finish-main" aria-hidden="true">
            <span class="hero-finish-headphones">🎧</span>
            <span class="hero-finish-trophy">🏆</span>
          </div>

          <div class="hero-finish-check" aria-hidden="true">
            ✓
          </div>
        </div>
      `;

      return visual;
    }

    if (step.visual === "welcome") {
      visual.innerHTML = `
        <div class="welcome-visual">
          <div class="welcome-headphones" aria-hidden="true">🎧</div>
          <div class="welcome-stars" aria-hidden="true">★ ★ ★</div>
        </div>
      `;

      return visual;
    }

    if (step.visual.startsWith("rescue-")) {
      const mode =
        step.visual.replace("rescue-", "");

      if (mode === "intro") {
        visual.innerHTML = `
          <div class="rescue-intro">
            <div class="rescue-rocket" aria-hidden="true">🚀</div>
            <div class="rescue-intro-sound" aria-hidden="true">
              🔇 🔉 🔊
            </div>
            <div class="rescue-stars" aria-hidden="true">
              ☆ ☆ ☆ ☆
            </div>
          </div>
        `;

        return visual;
      }

      if (mode === "finish") {
        visual.innerHTML = `
          <div class="rescue-finish">
            <div class="rescue-finish-stars" aria-hidden="true">
              ⭐ ⭐ ⭐ ⭐
            </div>
            <div class="rescue-trophy" aria-hidden="true">🏆</div>
            <strong>VOLUME HERO!</strong>
          </div>
        `;

        return visual;
      }

      let scene = "";

      if (mode === "quieter") {
        scene = `
          <div class="rescue-scene rescue-too-loud">
            <div class="rescue-character">😣</div>
            <div class="rescue-sound-waves">)))</div>
            <div class="rescue-scene-icon">🔊</div>
          </div>
        `;
      }

      if (mode === "louder") {
        scene = `
          <div class="rescue-scene rescue-too-quiet">
            <div class="rescue-listening-cue">👂</div>
            <div class="rescue-tiny-notes">♪</div>
            <div class="rescue-hear-question">?</div>
          </div>
        `;
      }

      if (mode === "mute") {
        scene = `
          <div class="rescue-scene rescue-sleeping">
            <div class="rescue-sleeper">😴</div>
            <div class="rescue-zzz">Zzz</div>
            <div class="rescue-noisy-note">♫</div>
          </div>
        `;
      }

      if (mode === "sound-on") {
        scene = `
          <div class="rescue-scene rescue-party">
            <div class="rescue-dancer">🕺</div>
            <div class="rescue-party-question">?</div>
            <div class="rescue-party-notes">♪ ♫</div>
          </div>
        `;
      }

      visual.innerHTML = `
        <div
          class="volume-rescue-stage"
          data-rescue="${mode}"
          data-solved="false"
        >
          <div class="rescue-game-header">
            <strong>MISSION ${step.missionNumber || ""}</strong>

            <div class="rescue-mission-meter" aria-hidden="true">
              ${[1, 2, 3, 4]
                .map(number =>
                  `<span class="${
                    number <= (step.missionNumber || 0)
                      ? "current"
                      : ""
                  }">★</span>`
                )
                .join("")}
            </div>
          </div>

          <div class="rescue-game-main">
            ${scene}

            <div class="rescue-keyboard-area">
              <svg
                class="rescue-keyboard-svg"
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
                  class="rescue-key-target"
                  data-rescue-answer="mute"
                  x="663"
                  y="19"
                  width="80"
                  height="39"
                  rx="9"
                ></rect>

                <rect
                  class="rescue-key-target"
                  data-rescue-answer="down"
                  x="748"
                  y="19"
                  width="80"
                  height="39"
                  rx="9"
                ></rect>

                <rect
                  class="rescue-key-target"
                  data-rescue-answer="up"
                  x="833"
                  y="19"
                  width="80"
                  height="39"
                  rx="9"
                ></rect>
              </svg>
            </div>
          </div>

          <div class="rescue-game-footer">
            <div
              class="rescue-feedback"
              aria-live="polite">
            </div>

            <button
              class="rescue-play-button"
              type="button"
            >
              <span>🔊</span>
              <strong>PLAY</strong>
            </button>
          </div>
        </div>
      `;

      return visual;
    }

    if (step.visual.startsWith("plug-detective-")) {
      const mode =
        step.visual.replace("plug-detective-", "");

      if (mode === "intro") {
        visual.innerHTML = `
          <div class="plug-detective-intro">
            <span class="plug-detective-icon">🕵️</span>
            <span class="plug-detective-headphones">🎧</span>
            <span class="plug-detective-question">?</span>
          </div>
        `;

        return visual;
      }

      const reveal = mode === "reveal";

      visual.innerHTML = `
        <div
          class="plug-detective-stage"
          data-reveal="${reveal}"
        >
          <div class="plug-detective-thinking">
            <span>🤔</span>
            <span>→</span>
            <span>👍</span>
            <strong>FIND IT</strong>
          </div>

          <svg
            class="plug-detective-find-svg"
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

            ${
              reveal
                ? `
                  <ellipse
                    class="plug-detective-answer-ring"
                    cx="3150"
                    cy="1875"
                    rx="145"
                    ry="120"
                  ></ellipse>
                `
                : ""
            }
          </svg>

          <div
            class="plug-detective-feedback"
            aria-live="polite">
          </div>
        </div>
      `;

      return visual;
    }

    if (step.visual.startsWith("teacher-says-")) {
      const mode =
        step.visual.replace("teacher-says-", "");

      if (mode === "intro") {
        visual.innerHTML = `
          <div class="teacher-says-intro">
            <div class="teacher-says-teacher">👩‍🏫</div>

            <div class="teacher-says-intro-cards">
              <span>🎧</span>
              <span>👂</span>
              <span>✋</span>
            </div>
          </div>
        `;

        return visual;
      }

      if (mode === "finish") {
        visual.innerHTML = `
          <div class="teacher-says-finish">
            <span>👩‍🏫</span>
            <span>⭐</span>
            <span>🎧</span>
          </div>
        `;

        return visual;
      }

      if (mode === "wait") {
        visual.innerHTML = `
          <div class="teacher-says-wait">
            <div class="teacher-says-stop-hand">✋</div>
            <strong>WAIT!</strong>

            <div class="teacher-says-distractors" aria-hidden="true">
              <span>🎧</span>
              <span>👂</span>
              <span>💻</span>
            </div>
          </div>
        `;

        return visual;
      }

      visual.innerHTML = `
        <div
          class="teacher-says-command"
          data-command="${mode}"
        >
          <div class="teacher-says-badge">
            <span>👩‍🏫</span>
            <strong>TEACHER SAYS</strong>
          </div>

          <div class="teacher-says-command-picture">
            <div
              class="position-visual"
              data-position="${mode}"
            >
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
            </div>
          </div>

          <div class="teacher-says-command-word">
            ${mode === "neck" ? "NECK" : "EARS"}
          </div>
        </div>
      `;

      return visual;
    }

    if (step.visual.startsWith("size-")) {
      const mode = step.visual.replace("size-", "");

      if (mode === "intro") {
        visual.innerHTML = `
          <div class="size-challenge-intro">
            <img
              src="/assets/images/classroom-headphones.png"
              alt="Classroom headphones"
            >

            <div class="size-challenge-symbols" aria-hidden="true">
              <span>↕</span>
              <span>?</span>
            </div>
          </div>
        `;

        return visual;
      }

      if (mode === "try") {
        visual.innerHTML = `
          <div class="size-challenge-try">
            <img
              src="/assets/images/classroom-headphones.png"
              alt="Classroom headphones"
            >

            <div class="size-ready-check" aria-hidden="true">✓</div>
          </div>
        `;

        return visual;
      }

      const isBigger = mode.startsWith("bigger");
      const isAnswer = mode.endsWith("-answer");

      visual.innerHTML = `
        <div
          class="size-challenge-stage"
          data-size="${isBigger ? "bigger" : "smaller"}"
          data-answer="${isAnswer}"
        >
          <div class="size-problem-head" aria-hidden="true">
            <div class="size-problem-face">
              <span class="size-problem-eyes">● ●</span>
            </div>

            <div class="size-problem-headphones">
              <span class="size-problem-band"></span>
              <span class="size-problem-pad size-problem-pad-left"></span>
              <span class="size-problem-pad size-problem-pad-right"></span>
            </div>
          </div>

          <div class="size-thinking-cue" aria-hidden="true">
            <span>🤔</span>
            <span>→</span>
            <span>👍</span>
            <strong>KNOW IT?</strong>
          </div>

          ${
            isAnswer
              ? ""
              : `
                <div class="size-choice-buttons">
                  <button
                    type="button"
                    class="size-choice-button"
                    data-size-answer="bigger"
                  >
                    <span class="size-choice-arrow">↑</span>
                    <strong>BIGGER</strong>
                  </button>

                  <button
                    type="button"
                    class="size-choice-button"
                    data-size-answer="smaller"
                  >
                    <span class="size-choice-arrow">↓</span>
                    <strong>SMALLER</strong>
                  </button>
                </div>

                <div
                  class="size-choice-feedback"
                  aria-live="polite">
                </div>
              `
          }

          <div class="size-answer-cue" aria-hidden="true">
            <span class="size-answer-arrow">
              ${isBigger ? "↑" : "↓"}
            </span>
            <strong>${isBigger ? "BIGGER" : "SMALLER"}</strong>
          </div>
        </div>
      `;

      return visual;
    }

    if (step.visual.startsWith("mystery-")) {
      const mode = step.visual.replace("mystery-", "");

      if (mode === "intro") {
        visual.innerHTML = `
          <div class="mystery-intro-visual">
            <div class="mystery-question" aria-hidden="true">?</div>

            <img
              src="/assets/images/classroom-headphones.png"
              alt="Classroom headphones"
            >

            <div class="mystery-stars" aria-hidden="true">
              ★ ★ ★
            </div>
          </div>
        `;

        return visual;
      }

      const reveal = mode.endsWith("-reveal");

      const part = mode
        .replace("-reveal", "");

      visual.innerHTML = `
        <div
          class="headphone-photo-stage mystery-photo-stage"
          data-highlight="${part}"
          data-reveal="${reveal}"
        >
          <img
            class="headphone-photo"
            src="/assets/images/classroom-headphones.png"
            alt="Classroom headphones"
          >

          <div
            class="part-highlight part-headband"
            aria-hidden="true">
          </div>

          <div
            class="part-highlight part-earpad-left"
            aria-hidden="true">
          </div>

          <div
            class="part-highlight part-earpad-right"
            aria-hidden="true">
          </div>

          <div
            class="part-highlight part-cord"
            aria-hidden="true">
          </div>

          <div
            class="part-highlight part-plug"
            aria-hidden="true">
          </div>

          <div
            class="mystery-question-badge"
            aria-hidden="true">
            ?
          </div>

          <div
            class="mystery-thumbs-cue"
            aria-hidden="true">
            <span class="mystery-think-icon">🤔</span>
            <span class="mystery-cue-arrow">→</span>
            <span class="mystery-thumb-icon">👍</span>
            <strong>KNOW IT?</strong>
          </div>

          <div
            class="mystery-answer-check"
            aria-hidden="true">
            ✓
          </div>
        </div>
      `;

      return visual;
    }

    if (step.visual.startsWith("review-")) {
      const mode = step.visual.replace("review-", "");

      if (mode === "parts") {
        visual.innerHTML = `
          <div class="review-parts-visual">
            <img
              src="/assets/images/classroom-headphones.png"
              alt="Classroom headphones"
            >

            <div class="review-parts-row" aria-hidden="true">
              <span>HEADBAND</span>
              <span>EAR PADS</span>
              <span>CORD</span>
              <span>PLUG</span>
            </div>
          </div>
        `;

        return visual;
      }

      if (mode === "fit") {
        visual.innerHTML = `
          <div class="review-fit-visual">
            <img
              src="/assets/images/classroom-headphones.png"
              alt="Classroom headphones"
            >

            <div class="review-fit-arrows" aria-hidden="true">
              <div>
                <span>↓</span>
                <strong>BIGGER</strong>
              </div>

              <div>
                <span>↑</span>
                <strong>SMALLER</strong>
              </div>
            </div>
          </div>
        `;

        return visual;
      }

      if (mode === "sound") {
        visual.innerHTML = `
          <div class="review-sound-visual">
            <svg
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
                class="review-sound-key"
                x="663"
                y="19"
                width="80"
                height="39"
                rx="9"
              ></rect>

              <rect
                class="review-sound-key"
                x="748"
                y="19"
                width="80"
                height="39"
                rx="9"
              ></rect>

              <rect
                class="review-sound-key"
                x="833"
                y="19"
                width="80"
                height="39"
                rx="9"
              ></rect>
            </svg>

            <div class="review-sound-icons" aria-hidden="true">
              <span>🔇</span>
              <span>🔉</span>
              <span>🔊</span>
            </div>
          </div>
        `;

        return visual;
      }

      if (mode === "ready") {
        visual.innerHTML = `
          <div class="review-ready-visual" aria-hidden="true">
            <div>🎧</div>
            <div class="review-ready-check">✓</div>
          </div>
        `;

        return visual;
      }
    }

    if (step.visual.startsWith("detective-")) {
      const mode = step.visual.replace("detective-", "");

      if (mode === "start") {
        visual.innerHTML = `
          <div class="detective-intro">
            <div class="detective-big-icon" aria-hidden="true">👂</div>
            <div class="detective-clues" aria-hidden="true">
              <span>🔉</span>
              <span>🔊</span>
              <span>🔇</span>
            </div>
          </div>
        `;

        return visual;
      }

      if (mode === "finish") {
        visual.innerHTML = `
          <div class="detective-finish">
            <div aria-hidden="true">👂</div>
            <div aria-hidden="true">✓</div>
          </div>
        `;

        return visual;
      }

      let visualCue = "";
      let highlightClass = "";

      if (mode === "down") {
        visualCue = `
          <span class="detective-cue-big">🔊</span>
          <span class="detective-cue-arrow">→</span>
          <span class="detective-cue-small">🔉</span>
        `;
        highlightClass = "detective-highlight-down";
      }

      if (mode === "up") {
        visualCue = `
          <span class="detective-cue-small">🔉</span>
          <span class="detective-cue-arrow">→</span>
          <span class="detective-cue-big">🔊</span>
        `;
        highlightClass = "detective-highlight-up";
      }

      if (mode === "mute") {
        visualCue = `
          <span class="detective-cue-big">🔊</span>
          <span class="detective-cue-arrow">→</span>
          <span class="detective-cue-big">🤫</span>
        `;
        highlightClass = "detective-highlight-mute";
      }

      if (mode === "unmute") {
        visualCue = `
          <span class="detective-cue-big">🤫</span>
          <span class="detective-cue-arrow">→</span>
          <span class="detective-cue-big">🔊</span>
        `;
        highlightClass = "detective-highlight-mute";
      }

      visual.innerHTML = `
        <div class="detective-stage">
          <svg
            class="detective-keyboard-svg"
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
              class="detective-key-highlight ${highlightClass}"
              x="${
                mode === "down"
                  ? 748
                  : mode === "up"
                    ? 833
                    : 663
              }"
              y="19"
              width="80"
              height="39"
              rx="9"
            ></rect>
          </svg>

          <div class="detective-visual-cue" aria-hidden="true">
            ${visualCue}
          </div>

          <button class="detective-play-button" type="button">
            <span>🔊</span>
            <strong>PLAY</strong>
          </button>
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

  function renderStudentStep(
    container,
    index,
    lessonId = "full"
  ) {
    const step = getStep(index, lessonId);

    if (!step || !container) {
      return;
    }

    container.innerHTML = "";

    const wrapper = document.createElement("section");
    wrapper.className = "lesson-screen";
    wrapper.dataset.stepId = step.id;

    const isVolumeRescue =
      step.visual?.startsWith("rescue-") &&
      !["rescue-intro", "rescue-finish"].includes(step.visual);

    if (isVolumeRescue) {
      wrapper.classList.add("volume-rescue-screen");
    }

    const visual = createVisual(step);

    wrapper.appendChild(visual);

    if (!isVolumeRescue) {
      const label = document.createElement("h2");
      label.className = "lesson-label";
      label.textContent = step.shortLabel;

      wrapper.appendChild(label);
    }

    container.appendChild(wrapper);
  }

  function renderTeacherPreview(
    container,
    index,
    lessonId = "full"
  ) {
    const step = getStep(index, lessonId);

    if (!step || !container) {
      return;
    }

    container.innerHTML = `
      <div class="teacher-step-preview">
        <strong>${step.shortLabel}</strong>
        <span>${step.spokenInstruction}</span>
        <small>${index + 1} of ${getStepCount(lessonId)}</small>
      </div>
    `;
  }

  return {
    getLesson,
    getStep,
    getStepCount,
    renderStudentStep,
    renderTeacherPreview
  };
})();
