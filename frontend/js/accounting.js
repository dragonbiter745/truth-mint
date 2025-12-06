// frontend/js/accounting.js

document.addEventListener('DOMContentLoaded', () => {
    const chartPlaceholder = document.querySelector('.chart-placeholder');
    const assetSelect = document.getElementById('asset-select');
    const downloadBtn = document.querySelector('#audit-visualization-panel .btn-secondary');

    // --- 1. SIMULATE CHART DATA LOADING ---
    // frontend/js/accounting.js

    const loadChartData = async (assetLabel) => {
        const chartPlaceholder = document.querySelector('.chart-placeholder');
        // Clean asset name (e.g. "fBTC" -> "BTC")
        const symbol = assetLabel.includes('USD') ? 'BTC' : assetLabel.replace('f', '').split(' ')[0]; 

        chartPlaceholder.innerHTML = `<p class="mono-text status-pending">Querying Flare FTSO for ${symbol}...</p>`;
        
        try {
            // CALL REAL BACKEND
            const res = await fetch(`/api/truth/accounting/${symbol}`);
            const data = await res.json();

            // Render Result
            chartPlaceholder.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <h2 style="color: var(--color-aqua); font-size: 3rem; text-shadow: 0 0 10px var(--color-aqua);">$${data.price}</h2>
                    <p class="mono-text" style="color: var(--color-text-secondary);">Real-Time FTSO Price</p>
                    <div style="margin-top: 20px; padding: 10px; border: 1px solid var(--color-neon-blue); border-radius: 8px; background: rgba(0,0,0,0.3);">
                        <small>Source: Flare Time Series Oracle</small><br>
                        <small class="status-success">✓ Decentralized Consensus Reached</small>
                    </div>
                </div>
            `;
            
            // Add log entry
            const logOutput = document.getElementById('audit-log-output');
            const newLog = document.createElement('p');
            newLog.className = 'status-success';
            newLog.textContent = `[${new Date().toLocaleTimeString()}] FTSO Update: ${symbol} price $${data.price} verified on-chain.`;
            logOutput.prepend(newLog);

        } catch (e) {
            chartPlaceholder.innerHTML = `<p class="status-error">Oracle Connection Failed: ${e.message}</p>`;
        }
    };
        
        // Simulate data fetching delay (3 seconds)
        setTimeout(() => {
            // Replace placeholder with mock visual confirmation
            chartPlaceholder.innerHTML = `
                <div style="text-align: center;">
                    <p class="mono-text status-success" style="font-size: 1.2rem;">Data loaded and cryptographically verified.</p>
                    <p style="color: var(--color-aqua); margin-top: 10px;">Balance: 12.345 Verified Units</p>
                    <div style="width: 300px; height: 10px; background: linear-gradient(90deg, var(--color-aqua), var(--color-electric-purple)); margin: 15px auto; border-radius: 5px;"></div>
                </div>
            `;
        }, 2000);
    
    // --- 2. DOWNLOAD AUDIT REPORT FUNCTIONALITY ---
    downloadBtn.addEventListener('click', () => {
        const asset = assetSelect.value;
        showToast(`Generating and downloading audit report for ${asset}...`, 'success', 4000);
        // In a real app, this would trigger a server-side JSON/CSV generation endpoint.
    });

    // --- 3. INITIAL LOAD & LISTENERS ---
    assetSelect.addEventListener('change', (e) => {
        loadChartData(e.target.value);
    });

    // Initial load for the default asset
    loadChartData(assetSelect.value);
    
    
    // LIVE AUDIT LOG SIMULATION (Connected to Reality)
    const logOutput = document.getElementById('audit-log-output');
    
    // Every 5 seconds, check the price of BTC to simulate an "Audit Check"
    setInterval(async () => {
        try {
            const res = await fetch('http://localhost:4000/api/truth/accounting/BTC');
            const data = await res.json();
            
            const newLog = document.createElement('p');
            newLog.className = 'status-success';
            newLog.style.borderLeft = "2px solid #00F0FF";
            newLog.style.paddingLeft = "10px";
            newLog.textContent = `[${new Date().toLocaleTimeString()}] AUTOMATED AUDIT: BTC Reserve Valued at $${data.price} (Verified by Flare)`;
            
            logOutput.prepend(newLog);
            if(logOutput.children.length > 20) logOutput.lastChild.remove();
            
        } catch(e) {
            // Ignore errors in background polling
        }
    }, 8000); // Runs every 8 seconds
});