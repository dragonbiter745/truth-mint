// backend/routes/api.js
const express = require('express');
const router = express.Router();
const aiService = require('../services/ai');
const truthService = require('../services/truth');

// ==========================================
// 1. AI GENERATION (The "Brain")
// ==========================================
router.post('/ai/generate', async (req, res) => {
    try {
        const { topic } = req.body;
        console.log(`🤖 AI generating claim for topic: ${topic}`);
        
        // Call your AI Service
        const result = await aiService.generateClaim(topic);
        
        res.json(result);
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "AI Generation Failed" });
    }
});

// ==========================================
// 2. TRUTH VERIFICATION (The "Judge")
// ==========================================
router.post('/truth/verify', async (req, res) => {
    try {
        const { claim, category } = req.body;
        console.log(`🔍 Verifying: "${claim}" [${category}]`);

        const verification = await truthService.verifyClaim(claim, category);
        
        // Helper: Ensure proofId is a string for JSON
        if (verification.proofId && typeof verification.proofId === 'bigint') {
            verification.proofId = verification.proofId.toString();
        }

        res.json({ success: true, verification });
    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 3. NFT METADATA (The "Asset Creator")
// ==========================================
router.post('/nft/metadata', (req, res) => {
    try {
        const { proofId, claim, verification, topic } = req.body;
        
        // Generate the JSON Metadata for the NFT
        const metadata = {
            name: `TruthMint #${proofId}`,
            description: claim,
            image: "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi", // Placeholder Image
            attributes: [
                { trait_type: "Topic", value: topic || "General" },
                { trait_type: "Verified", value: verification.isVerified ? "True" : "False" },
                { trait_type: "Confidence", value: verification.confidenceScore + "%" },
                { trait_type: "Source", value: verification.dataSource },
                { trait_type: "Proof ID", value: proofId.toString() }
            ]
        };

        // Encode as Data URI (so we don't need IPFS right now)
        const jsonString = JSON.stringify(metadata);
        const base64Data = Buffer.from(jsonString).toString('base64');
        const tokenURI = `data:application/json;base64,${base64Data}`;

        res.json({ tokenURI });
    } catch (error) {
        console.error("Metadata Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 4. NEW: LEGAL DOC VERIFICATION
// ==========================================
router.post('/truth/legal', async (req, res) => {
    try {
        const { documentHash, fileName } = req.body;
        console.log(`⚖️  Anchoring Legal Doc: ${fileName} [Hash: ${documentHash}]`);

        // Register the Hash in TruthHub
        // We use the same 'verifyClaim' function but pass the Hash as the claim
        const verification = await truthService.verifyClaim(
            `Document Integrity: ${fileName}`, 
            "LEGAL"
        );
        
        // We append the real hash to the record
        verification.fdcData = documentHash; 

        res.json({ success: true, verification });
    } catch (error) {
        console.error("Legal Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==========================================
// 5. NEW: ACCOUNTING / FTSO PRICES
// ==========================================
router.get('/truth/accounting/:asset', async (req, res) => {
    try {
        const asset = req.params.asset.toUpperCase(); // e.g., "BTC"
        console.log(`💰 FTSO Query for: ${asset}`);
        
        // Call the Real FTSO logic
        const price = await truthService.getFTSOPrice(asset);
        
        res.json({
            asset: asset,
            price: price,
            source: "Flare FTSO (Coston2)",
            timestamp: Date.now()
        });
    } catch (error) {
        console.error("Accounting Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Add to backend/routes/api.js

router.get('/truth/proof/:id', async (req, res) => {
    try {
        const proofId = req.params.id;
        console.log(`🔎 Looking up Proof ID: ${proofId}`);

        // 1. Call TruthHub Contract to get the proof
        // (Assuming you have a getProof function exposed in truthService)
        const proof = await truthService.getProof(proofId);
        
        if (!proof || proof.claim === "") {
            return res.status(404).json({ success: false, error: "Proof not found" });
        }

        res.json({ success: true, proof });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add to backend/routes/api.js

router.get('/truth/history', async (req, res) => {
    try {
        if (!truthService.truthHub) throw new Error("TruthHub not connected");

        // 1. Get total count
        const count = await truthService.truthHub.proofCount();
        const total = Number(count);
        
        // 2. Fetch last 10 proofs (or fewer)
        const history = [];
        const start = Math.max(0, total - 10);
        
        for (let i = total - 1; i >= start; i--) {
            const p = await truthService.getProof(i);
            history.push({
                id: i,
                query: p.claim.substring(0, 50) + (p.claim.length>50?"...":""),
                value: p.isVerified ? "Verified" : "Failed",
                timestamp: new Date(p.timestamp * 1000).toISOString(),
                status: p.isVerified ? 'success' : 'failed',
                hash: `Proof #${i}` // Or fetch TxHash if stored off-chain
            });
        }

        res.json({ success: true, history });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
module.exports = router;