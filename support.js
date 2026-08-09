(() => {
  "use strict";

  const endpoint =
    "https://anxious-cat-support-api-883555919592.us-central1.run.app/v1/support";
  const form = document.querySelector("#contact");
  const status = document.querySelector("#support-status");
  const submit = form?.querySelector("button[type='submit']");

  if (!form || !status || !submit) {
    return;
  }

  let startedAt = Date.now();
  let nonce = createNonce();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.className = "support-status";

    if (!form.reportValidity()) {
      return;
    }

    submit.disabled = true;
    submit.textContent = "sending...";
    status.textContent = "Sending your message.";

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    payload.started_at = startedAt;
    payload.nonce = nonce;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        throw new Error(
          result.error || "The form could not be sent. Please try again."
        );
      }

      form.reset();
      startedAt = Date.now();
      nonce = createNonce();
      status.className = "support-status support-status-success";
      status.textContent =
        "Sent. We will reply if you included a reply email.";
    } catch (error) {
      status.className = "support-status support-status-error";
      status.textContent =
        error instanceof Error
          ? error.message
          : "The form could not be sent. Please try again.";
    } finally {
      submit.disabled = false;
      submit.textContent = "send to support";
    }
  });

  function createNonce() {
    if (typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }

    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) =>
      byte.toString(16).padStart(2, "0")
    ).join("");
  }
})();
