/*
  Holds the page's Lenis instance so popups (enquiry modal, lightbox) can pause
  smooth scrolling while they are open. Only this landing page creates one.
*/
let lenis = null;

export function setLenis(instance) {
  lenis = instance;
}

export function getLenis() {
  return lenis;
}

/** Pause page scrolling (modal open). */
export function stopPageScroll() {
  lenis?.stop();
}

/** Resume page scrolling (modal closed). */
export function startPageScroll() {
  lenis?.start();
}
