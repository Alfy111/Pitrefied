const sections = [...document.querySelectorAll("main .page-section")];
const homeBrandBar = document.querySelector(".home-brand-bar");
const navigation = document.querySelector(".site-nav");
const navigationLinks = [...navigation.querySelectorAll("a[href^='#']")];
const navActiveIndicator = navigation.querySelector(".nav-active-indicator");
let currentActiveNavigationLink;
let brandBarUpdateScheduled = false;
const photoDialog = document.querySelector(".photo-dialog");
const photoDialogImage = photoDialog.querySelector(".photo-dialog-image");
const photoDialogClose = photoDialog.querySelector(".photo-dialog-close");
const bookingDialog = document.querySelector(".booking-dialog");
const bookingDialogClose = bookingDialog.querySelector(".booking-dialog-close");
const bookingButton = document.querySelector(".button-light");
const calendarGrid = bookingDialog.querySelector(".calendar-grid");
const calendarMonth = bookingDialog.querySelector(".calendar-month");
const calendarSelection = bookingDialog.querySelector(".calendar-selection");
const previousMonthButton = bookingDialog.querySelector('[data-month-change="-1"]');
const bookingTimeOptions = bookingDialog.querySelector(".booking-time-options");
const bookingTimeSelection = bookingDialog.querySelector(".booking-time-selection");
const bookingContinue = bookingDialog.querySelector(".booking-continue");
const bookingContinueStatus = bookingDialog.querySelector(".booking-continue-status");
let displayedMonth = new Date();
displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), 1);
let selectedDate;
let selectedTime;

const monthFormatter = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });
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

function updateBookingContinue() {
  bookingContinue.disabled = !selectedDate || !selectedTime;
  bookingContinueStatus.textContent = "";
}

function renderBookingTimes() {
  bookingTimeOptions.replaceChildren();
  bookingTimeSelection.textContent = selectedTime
    ? `Selected time: ${timeFormatter.format(new Date(2000, 0, 1, selectedTime))}.`
    : selectedDate
      ? "Choose an appointment time."
      : "Select a date to see available times.";

  for (let hour = 12; hour <= 17; hour += 1) {
    const time = new Date(2000, 0, 1, hour);
    const timeButton = document.createElement("button");
    timeButton.className = "booking-time";
    timeButton.type = "button";
    timeButton.textContent = timeFormatter.format(time);
    timeButton.disabled = !selectedDate;
    timeButton.setAttribute("aria-pressed", String(selectedTime === hour));
    timeButton.addEventListener("click", () => {
      if (!selectedDate) return;
      selectedTime = hour;
      renderBookingTimes();
      updateBookingContinue();
    });
    bookingTimeOptions.append(timeButton);
  }
}

function renderCalendar() {
  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const fragment = document.createDocumentFragment();

  calendarMonth.textContent = monthFormatter.format(displayedMonth);
  previousMonthButton.disabled = year === today.getFullYear() && month === today.getMonth();
  calendarGrid.replaceChildren();

  for (const weekday of ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]) {
    const label = document.createElement("span");
    label.className = "calendar-weekday";
    label.setAttribute("role", "columnheader");
    label.textContent = weekday;
    fragment.append(label);
  }

  for (let blank = 0; blank < firstWeekday; blank += 1) {
    const emptyCell = document.createElement("span");
    emptyCell.className = "calendar-empty";
    emptyCell.setAttribute("role", "gridcell");
    fragment.append(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const dateButton = document.createElement("button");
    dateButton.className = "calendar-day";
    dateButton.type = "button";
    dateButton.setAttribute("role", "gridcell");
    dateButton.setAttribute("aria-label", dateFormatter.format(date));
    dateButton.setAttribute("aria-pressed", String(
      selectedDate?.getFullYear() === year
      && selectedDate?.getMonth() === month
      && selectedDate?.getDate() === day,
    ));
    dateButton.disabled = date < today;
    dateButton.textContent = String(day);
    dateButton.addEventListener("click", () => {
      if (date < today) return;
      selectedDate = date;
      selectedTime = 12;
      calendarSelection.textContent = `Selected: ${dateFormatter.format(date)}.`;
      renderCalendar();
      renderBookingTimes();
      updateBookingContinue();
    });
    fragment.append(dateButton);
  }

  calendarGrid.append(fragment);
}

for (const photoButton of document.querySelectorAll(".service-photo-button")) {
  photoButton.addEventListener("click", () => {
    const photo = photoButton.querySelector(".service-photo");
    photoDialogImage.src = photo.src;
    photoDialogImage.alt = photo.alt;
    photoDialog.showModal();
  });
}

photoDialogClose.addEventListener("click", () => photoDialog.close());

photoDialog.addEventListener("click", (event) => {
  if (event.target === photoDialog) photoDialog.close();
});

bookingButton.addEventListener("click", () => bookingDialog.showModal());
bookingDialogClose.addEventListener("click", () => bookingDialog.close());
bookingDialog.querySelectorAll("[data-month-change]").forEach((button) => {
  button.addEventListener("click", () => {
    displayedMonth.setMonth(displayedMonth.getMonth() + Number(button.dataset.monthChange));
    renderCalendar();
  });
});
renderCalendar();
renderBookingTimes();
updateBookingContinue();

bookingContinue.addEventListener("click", () => {
  if (!selectedDate || !selectedTime) return;

  const bookingUrl = new URL("booking.html", window.location.href);
  bookingUrl.searchParams.set(
    "date",
    `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`,
  );
  bookingUrl.searchParams.set("time", String(selectedTime));
  window.location.assign(bookingUrl);
});

bookingDialog.addEventListener("click", (event) => {
  if (event.target === bookingDialog) bookingDialog.close();
});

function updateActiveSection() {
  const activationPoint = Math.min(window.innerHeight * 0.38, 300);
  const isAtPageBottom =
    window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
  const activeSection = isAtPageBottom
    ? sections[sections.length - 1]
    : sections.find((section) => {
        const bounds = section.getBoundingClientRect();
        return bounds.top <= activationPoint && bounds.bottom > activationPoint;
      }) ?? sections[0];
  const activeLink = navigationLinks.find((link) => link.hash === `#${activeSection.id}`);

  for (const link of navigationLinks) {
    if (link === activeLink) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  }

  if (!activeLink) return;

  navActiveIndicator.style.width = `${activeLink.offsetWidth}px`;
  navActiveIndicator.style.transform = `translate3d(${activeLink.offsetLeft}px, -50%, 0)`;

  if (activeLink !== currentActiveNavigationLink) {
    currentActiveNavigationLink = activeLink;
    if (navigation.scrollWidth > navigation.clientWidth) {
      const centeredLeft = activeLink.offsetLeft - (navigation.clientWidth - activeLink.offsetWidth) / 2;
      navigation.scrollTo({
        left: Math.max(0, centeredLeft),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    }
  }
}

let updateScheduled = false;

function scheduleActiveSectionUpdate() {
  if (updateScheduled) return;

  updateScheduled = true;
  window.requestAnimationFrame(() => {
    updateActiveSection();
    updateScheduled = false;
  });
}

window.addEventListener("scroll", scheduleActiveSectionUpdate, { passive: true });
window.addEventListener("resize", scheduleActiveSectionUpdate);
window.addEventListener("hashchange", scheduleActiveSectionUpdate);

function scheduleBrandBarUpdate() {
  if (brandBarUpdateScheduled) return;

  brandBarUpdateScheduled = true;
  window.requestAnimationFrame(() => {
    homeBrandBar.classList.toggle("is-hidden", window.scrollY > 24);
    brandBarUpdateScheduled = false;
  });
}

window.addEventListener("scroll", scheduleBrandBarUpdate, { passive: true });
scheduleBrandBarUpdate();
updateActiveSection();