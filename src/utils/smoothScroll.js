const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const smoothScrollToY = (targetY, duration = 700) => {
  if (typeof window === 'undefined') {
    return;
  }

  const finalY = Math.max(0, targetY);

  if (prefersReducedMotion()) {
    window.scrollTo(0, finalY);
    return;
  }

  const startY = window.scrollY;
  const distance = finalY - startY;

  if (Math.abs(distance) < 2) {
    window.scrollTo(0, finalY);
    return;
  }

  const startTime = window.performance.now();

  const step = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutCubic(progress);

    window.scrollTo(0, startY + distance * eased);

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
};

export const smoothScrollToElement = (element, offset = 96, duration = 700) => {
  if (!element || typeof window === 'undefined') {
    return;
  }

  const targetY = element.getBoundingClientRect().top + window.scrollY - offset;
  smoothScrollToY(targetY, duration);
};
