// backend/routes/api.js
const { ethers } = require("ethers"); // Critical import
const express = require('express');
const router = express.Router();
const aiService = require('../services/ai');
const truthService = require('../services/truth');

// --- 1. MEMORY STORAGE FOR API KEYS ---
const apiKeys = new Set(); 

// --- 2. THE x402 "PAYMENT" GATEKEEPER ---
const x402Middleware = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    
    console.log(`🔒 Checking Key: ${apiKey || "None"}`);

    // If no key OR key is not in our list -> BLOCK IT
    if (!apiKey || !apiKeys.has(apiKey)) {
        console.log("⛔ Access Denied: 402 Payment Required");
        return res.status(402).json({
            error: "Payment Required",
            message: "Access denied. Please provide a valid 'x-api-key' or fund your Agent Wallet via x402 protocol.",
            payment_url: "https://truthmint.io/pay"
        });
    }
    
    console.log("✅ Access Granted");
    next(); // Allow request to pass
};

// ==========================================
// 3. PUBLIC ROUTES (Free for everyone)
// ==========================================

// AI Generation
router.post('/ai/generate', async (req, res) => {
    try {
        const result = await aiService.generateClaim(req.body.topic);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "AI Failed" });
    }
});

// Truth Verification
router.post('/truth/verify', async (req, res) => {
    try {
        const { claim, category } = req.body;
        const verification = await truthService.verifyClaim(claim, category);
        // Stringify proofId for JSON safety
        if (verification.proofId) verification.proofId = verification.proofId.toString();
        res.json({ success: true, verification });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// NFT Metadata
router.post('/nft/metadata', (req, res) => {
    const { proofId, claim, verification, topic } = req.body;
    const metadata = {
        name: `TruthMint #${proofId}`,
        description: claim,
        image: "ipfs://placeholder",
        attributes: [
            { trait_type: "Topic", value: topic || "General" },
            { trait_type: "Verified", value: verification.isVerified ? "True" : "False" },
            { trait_type: "Score", value: verification.confidenceScore },
            { trait_type: "Proof ID", value: proofId.toString() }
        ]
    };
    const jsonString = JSON.stringify(metadata);
    const tokenURI = `data:application/json;base64,${Buffer.from(jsonString).toString('base64')}`;
    res.json({ tokenURI });
});

// Legal Verification
router.post('/truth/legal', async (req, res) => {
    try {
        const { documentHash, fileName } = req.body;
        const verification = await truthService.verifyClaim(`Document Integrity: ${fileName}`, "LEGAL");
        verification.fdcData = documentHash; 
        res.json({ success: true, verification });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Proof by ID
router.get('/truth/proof/:id', async (req, res) => {
    try {
        const proof = await truthService.getProof(req.params.id);
        res.json({ success: true, proof });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get History
router.get('/truth/history', async (req, res) => {
    try {
        if (!truthService.truthHub) throw new Error("TruthHub not connected");
        const count = await truthService.truthHub.proofCount();
        const total = Number(count);
        const history = [];
        const start = Math.max(0, total - 10);
        for (let i = total - 1; i >= start; i--) {
            const p = await truthService.getProof(i);
            history.push({
                id: i,
                query: p.claim.substring(0, 50) + "...",
                value: p.isVerified ? "Verified" : "Failed",
                timestamp: new Date(p.timestamp * 1000).toISOString(),
                status: p.isVerified ? 'success' : 'failed'
            });
        }
        res.json({ success: true, history });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generate API Key (The "Payment" Simulation)
router.post('/auth/generate-key', (req, res) => {
    const newKey = `sk_live_${Math.random().toString(36).substring(7)}`;
    apiKeys.add(newKey);
    res.json({ success: true, apiKey: newKey });
});

// ==========================================
// 4. PROTECTED ROUTES (Requires Payment/Key)
// ==========================================

// NOTICE: We added 'x402Middleware' here!
router.post('/audit/solvency', x402Middleware, async (req, res) => {
    try {
        const { address } = req.body;
        const balanceWei = await truthService.provider.getBalance(address);
        const balance = ethers.formatEther(balanceWei);
        
        // Mock history for graph
        const history = Array(7).fill(0).map(() => parseFloat(balance) * (0.9 + Math.random() * 0.2));
        history.push(parseFloat(balance));

        res.json({ 
            success: true, 
            balance, 
            symbol: "C2FLR", 
            history,
            verified: true,
            source: "Flare Layer 1"
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Also protect transaction fetching
router.post('/audit/transactions', x402Middleware, async (req, res) => {
    try {
        const { address } = req.body;
        const apiUrl = `https://coston2-explorer.flare.network/api?module=account&action=txlist&address=${address}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        const txs = (data.result || []).slice(0, 5).map(tx => ({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: (parseFloat(tx.value) / 1e18).toFixed(4),
            timestamp: new Date(tx.timeStamp * 1000).toLocaleString()
        }));
        res.json({ success: true, transactions: txs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;