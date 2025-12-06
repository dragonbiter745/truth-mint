// frontend/js/mint.js

document.addEventListener('DOMContentLoaded', () => {
    const mintButton = document.getElementById('mint-button');
    const logContainer = document.getElementById('mint-status-log');
    const successModalTrigger = document.getElementById('mint-success-modal');

    function logMessage(message, className = '') {
        const logLine = document.createElement('p');
        logLine.classList.add(className);
        logLine.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        logContainer.appendChild(logLine);
        logContainer.scrollTop = logContainer.scrollHeight;
    }

  // frontend/js/mint.js - Inside mintButton.addEventListener('click', ...)

mintButton.addEventListener('click', async () => {
    if (!window.userWalletAddress) {
        showToast('Wallet not connected. Please connect to mint.', 'error');
        await connectWallet();
        return; 
    }
    
    mintButton.disabled = true;
    logContainer.innerHTML = '';
    
    try {
        logMessage('Transaction initiated. Connecting wallet and checking fee (0.5 FLR)...', 'log-info');

        // Step 1: Simulate Deduction Transaction for Minting Fee
        await new Promise(resolve => setTimeout(resolve, 2000));
        logMessage('[GAS FEE] Minting fee transaction signed and broadcasted.', 'log-info');

        // Step 2: Minting Contract Call
        await new Promise(resolve => setTimeout(resolve, 3000));
        logMessage('Contract call sent: MINT_TRUTH_CERTIFICATE(proofHash, userWallet)...', 'log-warning');

        // Step 3: Final Confirmation
        await new Promise(resolve => setTimeout(resolve, 3000));
        logMessage('NFT MINTED! Truth Certificate #0012 confirmed on chain.', 'log-success');

        // --- FINAL WOW EFFECT ---
        mintButton.disabled = false;
        showConfettiEffect();
        showToast('Minting Successful! Your Truth Certificate NFT is ready.', 'success', 8000);
        
        // ... (rest of the modal display code) ...
        
    } catch (error) {
        logMessage(`[TRANSACTION ERROR] Minting failed. ${error.message}`, 'log-error');
        mintButton.disabled = false;
        showToast('Minting transaction failed.', 'error');
    }
});

    // --- SIMPLE CONFETTI EFFECT (Vanilla JS Particle Simulation) ---
    function showConfettiEffect() {
        const colors = ['#00F0FF', '#B250FF', '#4AFEBE', '#FFFFFF'];
        const confettiCount = 50;
        const duration = 3000;
        const container = document.body;

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti-piece');
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.top = `${-20}px`;
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            confetti.style.opacity = Math.random() + 0.5;

            // Apply animation keyframes directly via style
            const animationDuration = Math.random() * 2 + 3; // 3 to 5 seconds
            const animationDelay = Math.random() * 1;

            confetti.style.animation = `confetti-fall ${animationDuration}s linear ${animationDelay}s forwards`;
            confetti.style.position = 'fixed';
            confetti.style.zIndex = 10001;
            confetti.style.width = '10px';
            confetti.style.height = '10px';

            container.appendChild(confetti);

            // Clean up after animation finishes
            setTimeout(() => confetti.remove(), (animationDuration + animationDelay) * 1000);
        }
    }
    
    // Inject confetti keyframes into the CSS (dynamic injection)
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
        @keyframes confetti-fall {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
    `;
    document.head.appendChild(styleSheet);
});