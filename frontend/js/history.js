// frontend/js/history.js

document.addEventListener('DOMContentLoaded', async () => {
    const historyBody = document.getElementById('history-table-body');
    
    // 1. Fetch Real Data
    try {
        const res = await fetch('/api/truth/history');
        const data = await res.json();
        
        if (data.success && data.history.length > 0) {
            renderTable(data.history);
        } else {
            historyBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:2rem;">No History Found on Chain</td></tr>';
        }
    } catch (e) {
        console.error(e);
        historyBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red; padding:2rem;">Failed to load history</td></tr>';
    }

    function renderTable(data) {
        historyBody.innerHTML = '';
        data.forEach(item => {
            const row = document.createElement('tr');
            row.classList.add('history-item', `${item.status}-row`);
            
            row.innerHTML = `
                <td class="item-query" style="color:white;">${item.query}</td>
                <td class="item-value mono-text">${item.value}</td>
                <td class="item-timestamp">${new Date(item.timestamp).toLocaleString()}</td>
                <td class="item-status status-${item.status}">${item.status.toUpperCase()}</td>
                <td>
                    <button class="btn btn-secondary btn-view-proof" onclick="window.location.href='verify.html'">
                        View
                    </button>
                </td>
            `;
            historyBody.appendChild(row);
        });
    }
});