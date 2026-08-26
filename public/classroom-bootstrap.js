"use strict";

window.HeadphoneClassroomBootstrap = (() => {
  let initialized = false;
  let initializePromise = null;

  async function initialize() {
    if (initialized) {
      return window.HeadphoneClassroom.getState();
    }

    if (initializePromise) {
      return initializePromise;
    }

    initializePromise = (async () => {
      const classroom = window.HeadphoneClassroom;

      await classroom.fetchState();
      classroom.connect();

      initialized = true;

      window.dispatchEvent(
        new CustomEvent("headphone-classroom-ready", {
          detail: classroom.getState()
        })
      );

      return classroom.getState();
    })();

    try {
      return await initializePromise;
    } catch (error) {
      initializePromise = null;

      window.dispatchEvent(
        new CustomEvent("headphone-classroom-error", {
          detail: error
        })
      );

      throw error;
    }
  }

  function isInitialized() {
    return initialized;
  }

  return {
    initialize,
    isInitialized
  };
})();
