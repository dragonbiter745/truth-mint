// frontend/js/playground.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('live-query-form');
    const runButton = document.getElementById('run-query-btn');
    const input = document.getElementById('query-input');
    const queryType = document.getElementById('query-type');
    const logContainer = document.getElementById('verification-log');

    // 1. Enable Button Logic
    if (input && runButton) {
        input.addEventListener('input', () => {
            runButton.disabled = input.value.trim() === '';
        });
    }

    if (!form) {
        console.error("❌ Error: 'live-query-form' not found in HTML.");
        return;
    }

    // 2. The Main Submission Logic
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log("🚀 Playground Button Clicked!");

        // A. Wallet Check
        if (!window.userWalletAddress) {
            console.log("⚠️ Wallet not detected. Attempting connection...");
            try {
                // Call global connect function from app.js
                await window.connectWallet(); 
            } catch (err) {
                console.error("Wallet connection error:", err);
                alert("Please connect your wallet first.");
                return;
            }
        }

        // Double check after connection attempt
        if (!window.userWalletAddress) {
            alert("Wallet not connected. Aborting.");
            return;
        }

        const query = input.value.trim();
        if (!query) return;

        runButton.disabled = true;
        resetLog();
        
        try {
            // --- STEP 1: AI GENERATION ---
            logMessage(`[API] sending query to Backend: ${query}...`, 'log-info');
            
            // Force URL to localhost:4000
            const genRes = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: query })
            });
            
            if (!genRes.ok) throw new Error(`AI Backend Error: ${genRes.status}`);
            const genData = await genRes.json();
            
            const claim = genData.claim;
            logMessage(`[AI] Generated Claim: "${claim.substring(0,40)}..."`, 'log-success');

            // --- STEP 2: VERIFICATION & PROOF ---
            logMessage(`[CHAIN] Requesting Proof from TruthHub...`, 'log-warning');

            const verifyRes = await fetch('/api/truth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    claim: claim, 
                    category: genData.category || 'GENERAL' 
                })
            });

            if (!verifyRes.ok) throw new Error(`Verify Backend Error: ${verifyRes.status}`);
            const verifyData = await verifyRes.json();
            
            if (!verifyData.success) throw new Error("Verification failed on backend.");

            const proofId = verifyData.verification.proofId;
            logMessage(`[CHAIN] ✅ Proof Anchored! ID: ${proofId}`, 'log-success');

            // --- STEP 3: MINTING (The Transaction) ---
            logMessage(`[WALLET] Preparing Mint Transaction...`, 'log-info');
            
            // Generate Metadata Link
            const metaRes = await fetch('/api/nft/metadata', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    proofId: proofId, 
                    claim: claim, 
                    verification: verifyData.verification 
                })
            });
            const metaData = await metaRes.json();

            // Trigger Metamask
            const txHash = await window.mintKnowledgeNFT(proofId, claim, metaData.tokenURI);
            
            logMessage(`[COMPLETE] NFT Minted! Tx: ${txHash}`, 'log-success');
            alert("Success! NFT Minted.");

        } catch (error) {
            console.error(error);
            logMessage(`[ERROR] ${error.message}`, 'log-error');
        } finally {
            runButton.disabled = false;
        }
    });

    function logMessage(msg, cls) {
        const p = document.createElement('div');
        p.className = `log-line ${cls}`;
        p.innerText = `> ${msg}`;
        if(logContainer) logContainer.appendChild(p);
    }

    function resetLog() {
        if(logContainer) logContainer.innerHTML = '';
    }
});