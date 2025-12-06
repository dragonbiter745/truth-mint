// frontend/js/legal.js

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('doc-file-input');
    const uploadZone = document.getElementById('upload-zone');
    const verifyBtn = document.getElementById('verify-doc-btn');
    const fileNameSpan = document.querySelector('.file-name');
    const hashStatusSpan = document.getElementById('hash-status');
    const calculatedHashInput = document.getElementById('calculated-hash');
    const resultArea = document.getElementById('verification-result-area');

    // --- 1. FILE INPUT AND HASHING ---

    // Open file dialog when clicking the upload zone
    uploadZone.addEventListener('click', () => {
        fileInput.click();
    });
    // Visual drag-and-drop feedback (optional, but good UX)
    uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.style.opacity = 0.8; });
    uploadZone.addEventListener('dragleave', () => { uploadZone.style.opacity = 1; });
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.style.opacity = 1;
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelection(fileInput.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFileSelection(e.target.files[0]);
        }
    });
    
    const handleFileSelection = (file) => {
        fileNameSpan.textContent = file.name;
        calculatedHashInput.value = 'Calculating hash...';
        hashStatusSpan.textContent = 'Calculating...';
        hashStatusSpan.classList.remove('status-pending', 'status-error', 'status-success');

        // Use Web Crypto API for efficient SHA-256 hashing
        const reader = new FileReader();
        reader.onload = async (e) => {
            const buffer = e.target.result;
            if (window.crypto && window.crypto.subtle) {
                try {
                    const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
                    const hashArray = Array.from(new Uint8Array(hashBuffer));
                    const hashHex = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                    
                    calculatedHashInput.value = hashHex;
                    hashStatusSpan.textContent = 'Hash Ready';
                    hashStatusSpan.classList.add('status-success');
                    verifyBtn.disabled = false;
                    showToast('SHA-256 hash calculated.', 'info');

                } catch (error) {
                    calculatedHashInput.value = 'Error calculating hash.';
                    hashStatusSpan.textContent = 'Error';
                    hashStatusSpan.classList.add('status-error');
                    verifyBtn.disabled = true;
                    showToast('Hashing failed. Try another file.', 'error');
                }
            } else {
                 showToast('Browser does not support cryptographic hashing.', 'error');
            }
        };
        reader.readAsArrayBuffer(file);
    };

    // --- 2. VERIFICATION AGAINST REGISTRY ---

    // frontend/js/legal.js

    verifyBtn.addEventListener('click', async () => {
        const hash = calculatedHashInput.value.trim();
        if (!hash || hash.startsWith('0xError')) return;

        showToast('Anchoring Document Hash on Flare Network...', 'info');
        verifyBtn.disabled = true;
        resultArea.style.display = 'block';
        
        try {
            // CALL REAL BACKEND
            const response = await fetch('http://localhost:4000/api/truth/legal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documentHash: hash,
                    fileName: fileNameSpan.textContent || "Unknown Doc"
                })
            });

            const data = await response.json();

            if (data.success) {
                // Success! The hash is now in the TruthHub contract
                const proofData = {
                    status: 'success', 
                    anchorStatus: 'ANCHORED ON FLARE',
                    value: 'Integrity Verified',
                    timestamp: Math.floor(Date.now() / 1000),
                    signature: hash,
                    txHash: data.verification.txHash || "0xPending..."
                };
                
                // Render the Proof Card
                if(window.renderProofCard) window.renderProofCard(proofData);
                
                // Update UI Visuals
                const complianceCard = document.getElementById('compliance-status');
                complianceCard.classList.add('verified');
                document.getElementById('compliance-title').textContent = 'INTEGRITY VERIFIED';
                document.getElementById('compliance-message').textContent = `Document hash permanently anchored to TruthHub. Proof ID: ${data.verification.proofId}`;
                
                showToast('Success! Document anchored.', 'success');
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            console.error(err);
            showToast('Verification failed: ' + err.message, 'error');
        }
        
        verifyBtn.disabled = false;
});});