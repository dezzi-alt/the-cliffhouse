(() => {
  const modal = document.getElementById("booking-modal");
  if (!modal) return;

  const form = document.getElementById("booking-form");
  const confirmation = document.getElementById("booking-confirmation");
  const roomSelect = document.getElementById("room");
  const openButtons = document.querySelectorAll("[data-open-modal]");
  const closeButtons = modal.querySelectorAll("[data-close-modal]");
  let lastFocused = null;

  function getFocusable() {
    return modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
  }

  function setBackgroundInert(isInert) {
    Array.from(document.body.children).forEach((el) => {
      if (el === modal) return;
      if (isInert) el.setAttribute("inert", "");
      else el.removeAttribute("inert");
    });
  }

  function openModal(presetRoom) {
    lastFocused = document.activeElement;
    modal.hidden = false;
    form.hidden = false;
    confirmation.hidden = true;
    form.reset();
    if (presetRoom && roomSelect) roomSelect.value = presetRoom;
    setBackgroundInert(true);
    const focusable = getFocusable();
    if (focusable.length) focusable[0].focus();
    document.addEventListener("keydown", onKeydown);
  }

  function closeModal() {
    modal.hidden = true;
    setBackgroundInert(false);
    document.removeEventListener("keydown", onKeydown);
    if (lastFocused) lastFocused.focus();
  }

  function onKeydown(event) {
    if (event.key === "Escape") {
      closeModal();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(getFocusable());
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  openButtons.forEach((button) => {
    button.addEventListener("click", () => openModal(button.dataset.room));
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    form.hidden = true;
    confirmation.hidden = false;
    confirmation.querySelector(".form-submit").focus();
  });
})();
