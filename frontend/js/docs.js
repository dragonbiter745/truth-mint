// frontend/js/docs.js

document.addEventListener('DOMContentLoaded', () => {
    const copyButtons = document.querySelectorAll('.copy-btn');

    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-code-target');
            const codeElement = document.querySelector(targetId);

            if (codeElement) {
                const codeToCopy = codeElement.textContent;
                
                // Use modern Clipboard API
                navigator.clipboard.writeText(codeToCopy).then(() => {
                    // WOW Factor: Change button text temporarily and use toast
                    const originalText = button.textContent;
                    button.textContent = 'Copied!';
                    button.classList.add('btn-neon-glow');
                    showToast('Code block copied to clipboard!', 'success');

                    setTimeout(() => {
                        button.textContent = originalText;
                        button.classList.remove('btn-neon-glow');
                    }, 1500);

                }).catch(err => {
                    console.error('Failed to copy code: ', err);
                    showToast('Failed to copy code.', 'error');
                });
            }
        });
    });
});
