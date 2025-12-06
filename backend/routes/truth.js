const express = require('express');
const router = express.Router();
const truthService = require('../services/truth');
// FDC Configuration
const FDC_VERIFIER_URL = "https://fdc-verifiers-testnet.flare.network/verifier/eth/EVMTransaction/prepareRequest";
const FDC_API_KEY = "00000000-0000-0000-0000-000000000000"; // Public Testnet Key

class TruthService {
    // ... (keep constructor and existing methods) ...

    // --- HELPER: Hex Encoding for FDC ---
    toHex(data) {
        let result = "";
        for (let i = 0; i < data.length; i++) {
            result += data.charCodeAt(i).toString(16);
        }
        return result.padEnd(64, "0");
    }

    /**
     * REAL FDC VERIFICATION
     * Checks if a Transaction Hash actually exists on the chain
     */
    async verifyFinancialClaim(claim) {
        console.log(`🔗 FDC Verification started for: ${claim}`);

        // 1. Extract TxHash from the claim (User must input a hash)
        // Expected Input: "Verify transaction 0x123..."
        const txMatch = claim.match(/0x[a-fA-F0-9]{64}/);
        
        if (!txMatch) {
             return this.createVerification(claim, false, 0, "FDC", "", "No valid Transaction Hash found.");
        }

        const txHash = txMatch[0];

        try {
            // 2. Prepare FDC Request
            const attestationType = "0x" + this.toHex("EVMTransaction");
            const sourceType = "0x" + this.toHex("testETH"); // Or 'ETH' / 'FLR' depending on network

            const requestBody = {
                attestationType: attestationType,
                sourceId: sourceType,
                requestBody: {
                    transactionHash: txHash,
                    requiredConfirmations: "1",
                    provideInput: true,
                    listEvents: true,
                    logIndices: [],
                },
            };

            // 3. Call Flare Verifier API
            const response = await fetch(FDC_VERIFIER_URL, {
                method: "POST",
                headers: {
                    "X-API-KEY": FDC_API_KEY,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();
            console.log("🔍 FDC Verifier Response:", data);

            // 4. Check Results
            // If the verifier returns a 'response' object, the Tx exists and is valid.
            if (data && data.response) {
                const blockNumber = data.response.blockNumber;
                
                return this.createVerification(
                    claim,
                    true, // Verified!
                    100,  // High confidence because it's on-chain
                    "Flare Data Connector (FDC)",
                    "", // No FTSO data
                    `Tx Verified in Block #${blockNumber}. Integrity Check Passed.`
                );
            } else {
                throw new Error("Transaction not found or unconfirmed.");
            }

        } catch (error) {
            console.error("FDC Error:", error.message);
                return this.createVerification(
                    claim,
                    false,
                    0,
                    "FDC",
                    "",
                    `FDC Verification Failed: ${error.message}`
                );
            }
        }
    }
/**
 * POST /api/truth/verify
 * Verify a claim using Flare oracles
 */
router.post('/verify', async (req, res) => {
  try {
    const { claim, category } = req.body;

    if (!claim) {
      return res.status(400).json({ 
        error: 'Claim is required' 
      });
    }

    console.log(`Verifying claim: "${claim}" [${category || 'GENERAL'}]`);

    const verification = await truthService.verifyClaim(
      claim,
      category || 'GENERAL'
    );

    res.json({
      success: true,
      verification
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ 
      error: 'Verification failed',
      message: error.message 
    });
  }
});

/**
 * GET /api/truth/sources
 * Get available data sources
 */
router.get('/sources', (req, res) => {
  res.json({
    success: true,
    sources: [
      {
        name: 'FTSO',
        description: 'Flare Time Series Oracle - Crypto price feeds',
        available: true
      },
      {
        name: 'FDC',
        description: 'Flare Data Connector - External data verification',
        available: true
      },
      {
        name: 'HYBRID',
        description: 'Combined FTSO + FDC verification',
        available: true
      }
    ]
  });
});

module.exports = router;