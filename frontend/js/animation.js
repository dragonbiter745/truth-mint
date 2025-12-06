// frontend/js/animation.js

// --- 1. HERO DATA STREAM SPARK GENERATOR ---

const streamContainer = document.getElementById('data-stream-visualization');
const STREAM_DENSITY = 40; // Number of particles/lines to generate
const CONTAINER_WIDTH = 450; // Match the CSS width

if (streamContainer) {
    for (let i = 0; i < STREAM_DENSITY; i++) {
        const line = document.createElement('div');
        line.classList.add('data-line');
        
        // Random position and size for organic flow
        const leftPosition = Math.random() * CONTAINER_WIDTH;
        const animationDelay = Math.random() * 6; // Delay between 0s and 6s
        const height = Math.random() * 40 + 20; // Height between 20px and 60px

        line.style.left = `${leftPosition}px`;
        line.style.animationDelay = `${animationDelay}s`;
        line.style.height = `${height}px`;
        
        // Random color mix for subtle variety (Aqua/Purple)
        line.style.backgroundColor = Math.random() > 0.5 ? 'var(--color-aqua)' : 'var(--color-electric-purple)';
        line.style.boxShadow = `0 0 5px ${line.style.backgroundColor}`;

        streamContainer.appendChild(line);
    }
}


// --- 2. GLOBAL SCROLL-TRIGGERED ANIMATIONS (WOW Feature) ---

const scrollElements = document.querySelectorAll('.scroll-fade-in');

const elementInView = (el, dividend = 1) => {
  const elementTop = el.getBoundingClientRect().top;
  // Check if the element is visible in the viewport, adjusted by the dividend
  return (
    elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend
  );
};

const displayScrollElement = (element) => {
  element.classList.add('is-visible');
};

// Check elements on scroll
const handleScrollAnimation = () => {
  scrollElements.forEach((el) => {
    if (elementInView(el, 1.25)) { // Trigger when 80% of element is visible
      displayScrollElement(el);
    }
  });
};

// Listen for scroll and load (initial check)
window.addEventListener('scroll', handleScrollAnimation);
window.addEventListener('load', handleScrollAnimation);