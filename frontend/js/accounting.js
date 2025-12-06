// frontend/js/accounting.js

document.addEventListener('DOMContentLoaded', () => {
    // Inject Input Fields (Wallet Address AND API Key)
    const controlBar = document.querySelector('.control-bar');
    
    if (!document.getElementById('audit-inputs')) {
        const inputContainer = document.createElement('div');
        inputContainer.id = 'audit-inputs';
        inputContainer.style.display = 'flex';
        inputContainer.style.gap = '10px';
        inputContainer.style.alignItems = 'center';
        inputContainer.style.flexWrap = 'wrap';

        // 1. Wallet Input
        inputContainer.innerHTML = `
            <input type="text" id="audit-address-input" placeholder="Target Wallet Address (0x...)" class="glass-input" style="padding:8px; width:250px;">
            
            <input type="password" id="audit-api-key" placeholder="Paste API Key (sk_...)" class="glass-input" style="padding:8px; width:180px; border-color: #f59e0b;">
            
            <button id="btn-run-audit" class="btn btn-primary btn-small">Verify Holdings</button>
        `;
        
        // Insert at start of control bar
        controlBar.insertBefore(inputContainer, controlBar.firstChild);
        
        // Hide the old dropdown
        const oldSelect = document.getElementById('asset-select');
        if(oldSelect) oldSelect.style.display = 'none';
    }

    const auditBtn = document.getElementById('btn-run-audit');
    const addressInput = document.getElementById('audit-address-input');
    const apiKeyInput = document.getElementById('audit-api-key');
    const chartCanvas = document.getElementById('audit-trail-chart');
    const chartPlaceholder = document.querySelector('.chart-placeholder');
    let auditChart = null;

    // Chart Init Function
    function initChart(historyData) {
        if(chartPlaceholder) chartPlaceholder.style.display = 'none';
        chartCanvas.style.display = 'block';
        
        if (auditChart) auditChart.destroy();

        const ctx = chartCanvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.5)'); 
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

        const labels = historyData.map((_, i) => `Day -${7-i}`);

        auditChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Wallet Balance (C2FLR)',
                    data: historyData,
                    borderColor: '#10b981',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.1)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    function renderTxTable(transactions) {
        const container = document.getElementById('audit-log-panel');
        if (!transactions || transactions.length === 0) return;

        // Remove old table if exists
        const existingTable = document.getElementById('tx-table-container');
        if(existingTable) existingTable.remove();

        let rows = transactions.map(tx => `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.1)">
                <td style="padding:10px; color:#00F0FF; font-family:monospace;">${tx.hash.substring(0,10)}...</td>
                <td style="padding:10px; color:#ccc;">${tx.timestamp}</td>
                <td style="padding:10px; color:#fff; font-weight:bold;">${tx.value} FLR</td>
                <td style="padding:10px; color:#888;">${tx.from.substring(0,6)}... → ${tx.to.substring(0,6)}...</td>
            </tr>
        `).join('');

        const div = document.createElement('div');
        div.id = 'tx-table-container';
        div.innerHTML = `
            <h3 class="section-heading" style="margin-top:30px;">Recent On-Chain Activity</h3>
            <table style="width:100%; border-collapse:collapse; text-align:left; background:rgba(0,0,0,0.2); border-radius:10px; overflow:hidden;">
                <thead style="background:rgba(255,255,255,0.05); color:#00F0FF;">
                    <tr><th style="padding:10px;">Tx</th><th style="padding:10px;">Time</th><th style="padding:10px;">Value</th><th style="padding:10px;">From/To</th></tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
        container.appendChild(div);
    }

    // Run Audit
    auditBtn.addEventListener('click', async () => {
        const address = addressInput.value.trim();
        const apiKey = apiKeyInput.value.trim();

        if (!address) return showToast("Please enter a wallet address", "error");

        // --- THE DEMO MAGIC: Check if key is empty ---
        if (!apiKey) {
            showToast("⛔ ACCESS DENIED: 402 Payment Required. Please generate an API Key in the Cockpit.", "error");
            return;
        }

        auditBtn.textContent = "Auditing Chain...";
        auditBtn.disabled = true;

        try {
            // 1. Fetch Balance (With Key)
            const resBalance = await fetch('/api/audit/solvency', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey // <--- SENDING THE KEY
                },
                body: JSON.stringify({ address, network: 'COSTON2' })
            });
            
            const dataBalance = await resBalance.json();
            
            // Handle the real 402 Error if key is wrong
            if (resBalance.status === 402) {
                throw new Error("Payment Required: Invalid API Key");
            }

            // 2. Fetch Transactions (With Key)
            const resTx = await fetch('/api/audit/transactions', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey
                },
                body: JSON.stringify({ address })
            });
            const dataTx = await resTx.json();

            if (dataBalance.success) {
                const valEl = document.querySelector('.metric-value');
                if(valEl) valEl.textContent = `${parseFloat(dataBalance.balance).toFixed(4)} C2FLR`;
                
                initChart(dataBalance.history);
                renderTxTable(dataTx.transactions);
                
                const logOutput = document.getElementById('audit-log-output');
                const p = document.createElement('p');
                p.className = 'status-success';
                p.textContent = `[${new Date().toLocaleTimeString()}] AUDIT COMPLETE: ${address.substring(0,6)}... has verified balance.`;
                logOutput.prepend(p);
                
                showToast("Solvency Verified on-chain!", "success");
            } else {
                throw new Error(dataBalance.error || "Unknown Error");
            }

        } catch (e) {
            console.error(e);
            showToast("Audit Failed: " + e.message, "error");
        } finally {
            auditBtn.textContent = "Verify Holdings";
            auditBtn.disabled = false;
        }
    });
});