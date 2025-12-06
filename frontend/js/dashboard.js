// frontend/js/dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    const keyDisplay = document.getElementById('active-api-key');
    const generateBtn = document.querySelector('.btn-neon-glow'); // The "Generate New Key" button
    const copyBtn = document.querySelector('.btn-copy-key');
    const showBtn = document.querySelector('.api-key-display .btn-secondary'); // The "Show" button

    let currentKey = "No Key Generated";

    // 1. Generate Key Logic
    if (generateBtn) {
        generateBtn.addEventListener('click', async () => {
            try {
                generateBtn.textContent = "Generating...";
                generateBtn.disabled = true;

                // Call Backend
                const response = await fetch('/api/auth/generate-key', { method: 'POST' });
                const data = await response.json();

                if (data.success) {
                    currentKey = data.apiKey;
                    keyDisplay.textContent = currentKey;
                    keyDisplay.style.color = "#00F0FF"; // Neon Blue
                    
                    showToast("New Agent API Key Generated!", "success");
                    
                    // Simulate "x402 Protocol" activation
                    setTimeout(() => {
                        showToast("x402 Payment Channel: Active", "info");
                    }, 1000);
                }
            } catch (e) {
                console.error(e);
                showToast("Failed to generate key", "error");
            } finally {
                generateBtn.textContent = "Generate New Key";
                generateBtn.disabled = false;
            }
        });
    }

    // 2. Copy Logic
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            if (!currentKey || currentKey === "No Key Generated") return;
            navigator.clipboard.writeText(currentKey);
            showToast("Key copied to clipboard", "success");
        });
    }
    
    // 3. Show/Hide Logic
    if (showBtn) {
        let visible = true;
        showBtn.addEventListener('click', () => {
            visible = !visible;
            if (visible) {
                keyDisplay.textContent = currentKey;
                showBtn.textContent = "👁️ Hide";
            } else {
                keyDisplay.textContent = currentKey.substring(0, 8) + "•••••••••";
                showBtn.textContent = "👁️ Show";
            }
        });
    }
});