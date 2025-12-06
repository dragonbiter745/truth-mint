// frontend/js/proofViewer.js

document.addEventListener('DOMContentLoaded', () => {
    const fetchBtn = document.getElementById('fetch-proof-btn');
    const hashInput = document.getElementById('tx-hash-input'); // Users will enter ID here for now
    const proofOutput = document.getElementById('proof-viewer-output');
    const loader = document.getElementById('verification-loader');

    if(fetchBtn) {
        fetchBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const inputVal = hashInput.value.trim();
            if (!inputVal) return alert('Please enter a Proof ID (e.g. 13)');

            proofOutput.innerHTML = '';
            loader.style.display = 'flex';
            fetchBtn.disabled = true;

            try {
                // CALL REAL BACKEND
                const res = await fetch(`http://localhost:4000/api/truth/proof/${inputVal}`);
                const data = await res.json();

                if (data.success) {
                    const p = data.proof;
                    // Render Real Data
                    const proofData = {
                        status: p.isVerified ? 'success' : 'error',
                        anchorStatus: p.isVerified ? 'ANCHORED ON-CHAIN' : 'FAILED',
                        value: p.claim,
                        timestamp: p.timestamp,
                        signature: p.dataSource, // Showing Source instead of signature for clarity
                        txHash: "Stored in TruthHub",
                        confidenceScore: p.confidenceScore, 
                        fdcData: p.fdcData // This contains the "Reason" from AI
                    };
                    if(window.renderProofCard) window.renderProofCard(proofData);
                } else {
                    throw new Error("Proof not found");
                }
            } catch (err) {
                proofOutput.innerHTML = `<p style="color:red; text-align:center;">❌ Error: ${err.message}</p>`;
            } finally {
                loader.style.display = 'none';
                fetchBtn.disabled = false;
            }
        });
    }
});