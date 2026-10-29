const sections = [...document.querySelectorAll("main .page-section")];
const navigationLinks = [...document.querySelectorAll(".site-nav a[href^='#']")];
const photoDialog = document.querySelector(".photo-dialog");
const photoDialogImage = photoDialog.querySelector(".photo-dialog-image");
const photoDialogClose = photoDialog.querySelector(".photo-dialog-close");

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

function updateActiveSection() {
  const activationPoint = Math.min(window.innerHeight * 0.38, 300);
  const activeSection =
    sections.find((section) => {
      const bounds = section.getBoundingClientRect();
      return bounds.top <= activationPoint && bounds.bottom > activationPoint;
    }) ?? sections[0];

  for (const link of navigationLinks) {
    if (link.hash === `#${activeSection.id}`) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
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
updateActiveSection();