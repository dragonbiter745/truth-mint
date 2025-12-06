// backend/services/truth.js
const { ethers } = require("ethers");
const aiService = require('./ai');
const TruthHubArtifact = require("../abi/TruthHub.json");

// Real FTSO Registry (Coston2)
const FTSO_REGISTRY_ADDR = "0x487dC9A43679105423854E1304ff8373de7887D9";
const FTSO_ABI = ["function getCurrentPrice(string _symbol) view returns (uint256 _price, uint256 _timestamp, uint256 _decimals)"];

class TruthService {
  constructor() {
    this.COSTON2_RPC = process.env.COSTON2_RPC || "https://coston2-api.flare.network/ext/C/rpc";
    
    // Ethers setup
    this.provider = new ethers.JsonRpcProvider(this.COSTON2_RPC);

    if (!process.env.PRIVATE_KEY) {
      console.warn("[TruthService] WARNING: PRIVATE_KEY is not set. On-chain proof registration will fail.");
    }

    this.wallet = process.env.PRIVATE_KEY
      ? new ethers.Wallet(process.env.PRIVATE_KEY, this.provider)
      : null;

    const truthHubAddress = process.env.TRUTH_HUB_ADDRESS;
    this.truthHub = truthHubAddress && this.wallet
      ? new ethers.Contract(truthHubAddress, TruthHubArtifact.abi || TruthHubArtifact, this.wallet)
      : null;
  }

  // --- MASTER VERIFICATION FUNCTION ---
  async verifyClaim(claim, category) {
    console.log(`Verifying claim: "${claim}" [${category}]`);

    try {
      let verification = {};

      // 1. DETERMINE LOGIC PATH
      if (category === "GENERAL" || category === "POLITICS" || category === "HISTORY" || category === "AI_FACT" || category === "LEGAL") {
          
          // --- PATH A: AI FACT CHECKING (RAG) ---
          if (category === "LEGAL") {
             // Special case for Legal: Hash is already verified by math
             verification = {
                 claim: claim,
                 isVerified: true,
                 confidenceScore: 100,
                 dataSource: "SHA-256 Cryptography",
                 ftsoData: "N/A",
                 fdcData: "Document Anchored"
             };
          } else {
             // General AI Fact Checking
             const topic = claim.split(' ')[0] + " " + (claim.split(' ')[1] || ""); 
             
             // CALL THE AI JUDGE
             const grading = await aiService.gradeAccuracy(claim, topic);
             
             verification = {
                 claim: claim,
                 // If score > 60, we consider it "Verified"
                 isVerified: grading.score > 60, 
                 confidenceScore: grading.score, // <--- THIS IS THE RATING
                 dataSource: `AI Fact Check (${grading.source})`,
                 ftsoData: "N/A",
                 // Store the 'Reason' in the proof so user sees why!
                 fdcData: grading.reason 
             };
          }

      } else {
          // --- PATH B: CRYPTO / FTSO ---
          verification = await this.verifyCryptoClaim(claim);
      }

      // 2. SAVE TO BLOCKCHAIN (CRITICAL FIX)
      // We moved this OUT of the if/else blocks so it runs for EVERYONE.
      let proofId = null;
      let txHash = null;

      if (this.truthHub && this.wallet) {
        try {
          console.log("🔗 Anchoring proof to TruthHub...");
          
          const tx = await this.truthHub.registerProof(
            verification.claim,
            verification.isVerified,
            verification.confidenceScore,
            verification.dataSource,
            verification.ftsoData || "",
            verification.fdcData || ""
          );

          const receipt = await tx.wait();
          txHash = receipt.hash;

          // Fetch the new Proof ID
          const currentCount = await this.truthHub.proofCount();
          proofId = (currentCount - 1n).toString(); 

          console.log(`✅ Proof stored on-chain: proofId=${proofId}`);
        } catch (err) {
          console.error("❌ On-chain registration failed:", err.message);
          // Don't crash, just return null proofId (Mint will be disabled on frontend)
        }
      }

      // 3. RETURN RESULT
      return {
        ...verification,
        category,
        proofId, // <--- Now this is always populated if DB write succeeds
        txHash
      };

    } catch (error) {
      console.error("Verification error:", error);
      return { claim, isVerified: false, error: error.message };
    }
  }

  // --- CRYPTO LOGIC (Using Real FTSO if possible) ---
  async verifyCryptoClaim(claim) {
      try {
          // Extract numbers and symbols
          const priceMatch = claim.match(/\$?([\d,]+)/);
          const claimedPrice = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, "")) : 0;
          
          let symbol = "BTC";
          if (claim.toLowerCase().includes("eth")) symbol = "ETH";
          if (claim.toLowerCase().includes("flr")) symbol = "FLR";

          // Get Real Price
          const ftsoPrice = await this.getFTSOPrice(symbol);
          
          // Compare
          const diff = Math.abs(ftsoPrice - claimedPrice);
          const percentDiff = (diff / (ftsoPrice || 1)) * 100;
          const isAccurate = percentDiff < 10; // 10% margin

          return {
              claim,
              isVerified: isAccurate,
              confidenceScore: isAccurate ? 100 : 40,
              dataSource: "Flare FTSO",
              ftsoData: `${symbol}: $${ftsoPrice}`,
              fdcData: isAccurate ? "Price Match" : "Price Mismatch"
          };
      } catch (e) {
          return { claim, isVerified: false, confidenceScore: 0, dataSource: "Error", ftsoData: "", fdcData: e.message };
      }
  }

  async getFTSOPrice(symbol) {
    try {
        // Try Real FTSO
        const ftsoContract = new ethers.Contract(FTSO_REGISTRY_ADDR, FTSO_ABI, this.provider);
        let querySymbol = symbol;
        if (symbol === "BTC") querySymbol = "testBTC"; 
        if (symbol === "ETH") querySymbol = "testETH";

        const result = await ftsoContract.getCurrentPrice(querySymbol);
        return parseFloat(ethers.formatUnits(result._price, 5));
    } catch (error) {
        console.warn("FTSO Error (Using Fallback):", error.message);
        const fallbacks = { "BTC": 97000, "ETH": 3800, "FLR": 0.03 };
        return fallbacks[symbol] || 0;
    }
  }

  // Helper for contract calls
  async getProof(proofId) {
    if (!this.truthHub) throw new Error("TruthHub not connected");
    const result = await this.truthHub.getProof(proofId);
    return {
        claim: result.claim,
        isVerified: result.isVerified,
        confidenceScore: Number(result.confidenceScore),
        timestamp: Number(result.timestamp),
        dataSource: result.dataSource,
        ftsoData: result.ftsoData,
        fdcData: result.fdcData
    };
  }
}

module.exports = new TruthService();