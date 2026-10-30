const dateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});
const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});
const parameters = new URLSearchParams(window.location.search);
const dateValue = parameters.get("date") ?? "";
const timeValue = Number(parameters.get("time"));
const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
const selectedDate = dateParts
  ? new Date(Number(dateParts[1]), Number(dateParts[2]) - 1, Number(dateParts[3]))
  : null;
const today = new Date();
today.setHours(0, 0, 0, 0);
const hasValidDate = selectedDate
  && selectedDate.getFullYear() === Number(dateParts[1])
  && selectedDate.getMonth() === Number(dateParts[2]) - 1
  && selectedDate.getDate() === Number(dateParts[3])
  && selectedDate >= today;
const hasValidTime = Number.isInteger(timeValue) && timeValue >= 12 && timeValue <= 17;
const form = document.querySelector(".booking-details-form");
const errorMessage = document.querySelector(".booking-page-error");
const summary = document.querySelector(".booking-summary");

form.querySelectorAll(".hair-history-question").forEach((question) => {
  const previousSelection = new WeakMap();

  question.addEventListener("pointerdown", (event) => {
    const radio = event.target.closest('input[type="radio"]');
    if (radio) previousSelection.set(radio, radio.checked);
  });

  question.addEventListener("keydown", (event) => {
    if (event.key !== " ") return;
    const radio = event.target.closest('input[type="radio"]');
    if (radio) previousSelection.set(radio, radio.checked);
  });

  question.addEventListener("click", (event) => {
    const radio = event.target.closest('input[type="radio"]');
    if (!radio || !previousSelection.get(radio)) return;

    event.preventDefault();
    window.setTimeout(() => {
      radio.checked = false;
      radio.dispatchEvent(new Event("input", { bubbles: true }));
      radio.dispatchEvent(new Event("change", { bubbles: true }));
    });
  });
});

if (hasValidDate && hasValidTime) {
  summary.textContent = `${dateFormatter.format(selectedDate)} · ${timeFormatter.format(
    new Date(2000, 0, 1, timeValue),
  )}`;

  try {
    const savedBooking = sessionStorage.getItem("pitrefiedBookingDraft");
    const bookingData = savedBooking ? JSON.parse(savedBooking) : null;

    if (bookingData?.date === dateValue && Number(bookingData.time) === timeValue) {
      for (const field of form.querySelectorAll("input")) {
        if (!(field.name in bookingData)) continue;
        if (field.type === "radio") {
          field.checked = field.value === bookingData[field.name];
        } else {
          field.value = bookingData[field.name];
        }
      }
    }
  } catch (error) {
    document.querySelector(".booking-submit-status").textContent =
      "We couldn't restore your saved booking details. Please review the form before continuing.";
    console.error("Unable to restore booking draft from session storage.", error);
  }
} else {
  errorMessage.hidden = false;
  form.hidden = true;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const bookingData = Object.fromEntries(new FormData(form));
  bookingData.date = dateValue;
  bookingData.time = timeValue;

  try {
    sessionStorage.setItem("pitrefiedBookingDraft", JSON.stringify(bookingData));
  } catch (error) {
    document.querySelector(".booking-submit-status").textContent =
      "We couldn't save your booking details in this browser. Please check your browser's storage settings and try again.";
    console.error("Unable to save booking draft to session storage.", error);
    return;
  }

  const paymentUrl = new URL("payment.html", window.location.href);
  paymentUrl.searchParams.set("date", dateValue);
  paymentUrl.searchParams.set("time", String(timeValue));
  window.location.assign(paymentUrl);
});
