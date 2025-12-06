// frontend/js/dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    const activeKeySpan = document.getElementById('active-api-key');
    const keyDisplay = activeKeySpan.parentNode;
    const [showBtn, copyBtn] = keyDisplay.querySelectorAll('.btn-small');
    
    // Simulate a full API Key
    const fullKey = 'sk_live_v2_f1d2c3e4b5a6c7d8e9f0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z61b7c';
    const hiddenKey = 'sk_live_••••••••1b7c';
    let isKeyVisible = false;

    // Toggle Show/Hide Key
    showBtn.addEventListener('click', () => {
        isKeyVisible = !isKeyVisible;
        if (isKeyVisible) {
            activeKeySpan.textContent = fullKey;
            showBtn.textContent = '🙈 Hide';
        } else {
            activeKeySpan.textContent = hiddenKey;
            showBtn.textContent = '👁️ Show';
        }
    });

    // Copy Key Logic
    copyBtn.addEventListener('click', () => {
        const keyToCopy = fullKey; // Always copy the full key
        
        navigator.clipboard.writeText(keyToCopy).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            showToast('Full API key copied to clipboard.', 'success');
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 1500);
        }).catch(err => {
            showToast('Failed to copy key.', 'error');
        });
    });
});