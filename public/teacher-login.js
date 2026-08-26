"use strict";

const form =
  document.getElementById("teacher-login-form");

const passwordInput =
  document.getElementById("teacher-password");

const message =
  document.getElementById("login-message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  message.textContent = "";

  try {
    const response = await fetch("/api/teacher-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        password: passwordInput.value
      })
    });

    if (!response.ok) {
      passwordInput.value = "";
      passwordInput.focus();
      message.textContent = "Try again";
      return;
    }

    window.location.href = "/teacher";
  } catch (error) {
    console.error(error);
    message.textContent = "Unable to sign in";
  }
});
