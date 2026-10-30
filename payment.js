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
const hasValidDate = selectedDate
  && selectedDate.getFullYear() === Number(dateParts[1])
  && selectedDate.getMonth() === Number(dateParts[2]) - 1
  && selectedDate.getDate() === Number(dateParts[3]);
const hasValidTime = Number.isInteger(timeValue) && timeValue >= 12 && timeValue <= 17;
const paymentContent = document.querySelector(".payment-content");
const errorMessage = document.querySelector(".booking-page-error");
const bookingBackLink = document.querySelector(".payment-back-link");

if (dateValue && hasValidTime) {
  const bookingUrl = new URL("booking.html", window.location.href);
  bookingUrl.searchParams.set("date", dateValue);
  bookingUrl.searchParams.set("time", String(timeValue));
  bookingBackLink.href = bookingUrl.href;
}

let bookingData;

try {
  const savedBooking = sessionStorage.getItem("pitrefiedBookingDraft");
  bookingData = savedBooking ? JSON.parse(savedBooking) : null;
} catch (error) {
  errorMessage.textContent = "We couldn't read your booking details from this browser session. Please start again from the calendar.";
  errorMessage.hidden = false;
  paymentContent.hidden = true;
  console.error("Unable to read booking draft from session storage.", error);
}

if (bookingData && hasValidDate && hasValidTime) {
  document.querySelector(".payment-appointment").textContent =
    `${dateFormatter.format(selectedDate)} · ${timeFormatter.format(new Date(2000, 0, 1, timeValue))}`;
  document.querySelector(".payment-client").textContent = bookingData.clientName || "Client";
} else if (!errorMessage.hidden) {
  paymentContent.hidden = true;
} else {
  errorMessage.hidden = false;
  paymentContent.hidden = true;
}
