// frontend/js/modal.js

// --- TOAST NOTIFICATION HANDLER ---

// Append toast container to the body if it doesn't exist
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('toast-container')) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
});

/**
 * Shows a floating notification toast.
 * @param {string} message - The message to display.
 * @param {string} type - 'success', 'error', 'warning', or 'info'.
 * @param {number} duration - How long to display the toast in ms.
 */
function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.classList.add('toast', `toast-${type}`);
    toast.innerHTML = `<span class="mono-text">${message}</span>`;

    container.appendChild(toast);

    // Show the toast
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Hide and remove after duration
    setTimeout(() => {
        toast.classList.remove('show');
        // Remove element from DOM after transition finishes (0.5s)
        setTimeout(() => {
            toast.remove();
        }, 500); 
    }, duration);
}

// Ensure this function is globally accessible if needed across files
window.showToast = showToast;


// --- EXAMPLE USAGE (REMOVE AFTER TESTING) ---
// setTimeout(() => {
//     showToast('Welcome to the Live Playground!', 'info');
// }, 1000);
// setTimeout(() => {
//     showToast('Proof successfully copied to clipboard.', 'success');
// }, 6000);
// frontend/js/modal.js - APPEND TO FILE

// --- MODAL HANDLER ---

const modalOverlay = document.getElementById('global-modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalActionBtn = document.getElementById('modal-action-btn');

/**
 * Shows the global modal with custom content.
 * @param {string} title - The title of the modal.
 * @param {string} contentHTML - The HTML content to inject into the body.
 * @param {string} actionLabel - Optional label for a footer action button.
 * @param {function} actionCallback - Optional function to run on action button click.
 */
function showModal(title, contentHTML, actionLabel = null, actionCallback = null) {
    modalTitle.textContent = title;
    modalBody.innerHTML = contentHTML;
    
    // Handle action button
    if (actionLabel && actionCallback) {
        modalActionBtn.textContent = actionLabel;
        modalActionBtn.style.display = 'inline-block';
        // Remove previous listener to prevent duplication
        modalActionBtn.onclick = null; 
        modalActionBtn.onclick = () => {
            actionCallback();
            hideModal();
        };
    } else {
        modalActionBtn.style.display = 'none';
        modalActionBtn.onclick = null;
    }

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function hideModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    // Clear dynamic content after hiding
    setTimeout(() => {
        modalBody.innerHTML = '';
        modalTitle.textContent = '';
    }, 300);
}

// Global listeners to hide modal
modalCloseBtn.addEventListener('click', hideModal);
modalOverlay.addEventListener('click', (e) => {
    // Only close if the click is directly on the overlay, not the content
    if (e.target === modalOverlay) {
        hideModal();
    }
});

// Expose functions globally (important for interaction from other scripts like history.js)
window.showModal = showModal;
window.hideModal = hideModal;