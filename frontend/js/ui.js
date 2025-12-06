// frontend/js/ui.js - APPEND TO FILE

// --- 1. DATA STREAM TICKER LOOP SETUP ---
document.addEventListener('DOMContentLoaded', () => {
    const content1 = document.getElementById('data-ticker-content-1');
    const content2 = document.getElementById('data-ticker-content-2');

    if (content1 && content2) {
        // Clone the content of block 1 into block 2 to ensure seamless loop
        content2.innerHTML = content1.innerHTML;
    }
});

// NOTE: We'll add the theme switcher logic here later too.
// frontend/js/ui.js - APPEND THIS TO THE END

// --- GLOBAL: Render Proof Card ---
// frontend/js/ui.js

window.renderProofCard = function(data) {
    const container = document.getElementById('proof-viewer-output');
    if (!container) return;

    // 1. Logic to determine color based on Score
    // If data.confidenceScore is undefined, fallback to 100 if status is success
    const score = data.confidenceScore !== undefined ? data.confidenceScore : (data.status === 'success' ? 100 : 0);
    
    let scoreColor = 'var(--color-success)'; // Green
    if (score < 70) scoreColor = 'var(--color-warning)'; // Yellow
    if (score < 40) scoreColor = 'var(--color-error)';   // Red

    let statusIcon = '<path d="M4 12.6111L8.92308 17.5L20 6.5" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
    
    container.innerHTML = `
        <div class="proof-card-container glass-card" id="canonical-proof-card" style="border-top: 4px solid ${scoreColor}">
            
            <div class="proof-header">
                <h3 class="proof-title mono-text">CANONICAL PROOF OBJECT</h3>
                <div style="text-align: right;">
                    <span class="proof-status-indicator" style="color: ${scoreColor}; font-size: 1.2rem;">
                        <svg class="status-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color:${scoreColor}">${statusIcon}</svg>
                        ACCURACY SCORE: ${score}%
                    </span>
                </div>
            </div>

            <div class="proof-data-grid">
                <div class="proof-item item-full">
                    <span class="item-label">VERIFIED CLAIM</span>
                    <span class="item-value item-highlight-aqua mono-text" style="font-size: 1.1rem; line-height: 1.5;">
                        "${data.value}"
                    </span>
                </div>

                <div class="proof-item">
                    <span class="item-label">JUDGEMENT REASON</span>
                    <span class="item-value mono-text" style="color: #ddd;">
                        ${data.fdcData || "Verified against trusted source."}
                    </span>
                </div>

                <div class="proof-item">
                    <span class="item-label">SOURCE TRUTH</span>
                    <span class="item-value mono-text">${data.signature || "Wikipedia / FTSO"}</span>
                </div>

                <div class="proof-item item-full">
                    <span class="item-label">BLOCKCHAIN ANCHOR (ID: ${data.txHash.replace('Stored in TruthHub', '')})</span>
                    <span class="item-value item-highlight-purple mono-text item-break">
                        Proof #${data.txHash} anchored on Flare Coston2
                    </span>
                </div>
            </div>
        </div>
    `;
    
    container.scrollIntoView({ behavior: 'smooth' });
};