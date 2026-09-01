"use strict";

window.HeadphoneClassroom = (() => {
  let state = {
    currentStep: 0,
    teacherControlEnabled: true,
    freezeScreenArmed: false,
    freezeCatchEnabled: false
  };

  const listeners = new Set();
  let eventSource = null;

  function getState() {
    return { ...state };
  }

  function notify() {
    const snapshot = getState();

    for (const listener of listeners) {
      listener(snapshot);
    }
  }

  function replaceState(nextState) {
    state = {
      ...state,
      ...nextState
    };

    notify();
  }

  function subscribe(listener) {
    listeners.add(listener);
    listener(getState());

    return () => {
      listeners.delete(listener);
    };
  }

  async function fetchState() {
    const response = await fetch("/api/classroom-state");

    if (!response.ok) {
      throw new Error("Unable to load classroom state.");
    }

    const nextState = await response.json();
    replaceState(nextState);

    return getState();
  }

  async function updateState(changes) {
    const response = await fetch("/api/classroom-state", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(changes)
    });

    if (!response.ok) {
      throw new Error("Unable to update classroom state.");
    }

    const nextState = await response.json();
    replaceState(nextState);

    return getState();
  }

  function connect() {
    if (eventSource) {
      eventSource.close();
    }

    eventSource = new EventSource("/api/classroom-events");

    eventSource.onmessage = (event) => {
      try {
        replaceState(JSON.parse(event.data));
      } catch (error) {
        console.error("Invalid classroom state update.", error);
      }
    };

    eventSource.onerror = () => {
      console.warn("Classroom live connection interrupted.");
    };
  }

  function disconnect() {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  }

  return {
    getState,
    subscribe,
    fetchState,
    updateState,
    connect,
    disconnect
  };
})();
