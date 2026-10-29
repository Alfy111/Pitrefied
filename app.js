const sections = [...document.querySelectorAll("main .page-section")];
const navigation = document.querySelector(".site-nav");
const navigationLinks = [...navigation.querySelectorAll("a[href^='#']")];
const navActiveIndicator = navigation.querySelector(".nav-active-indicator");
let currentActiveNavigationLink;
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
updateActiveSection();