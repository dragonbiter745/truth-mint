const express = require('express');
const router = express.Router();

// In-memory NFT storage (for demo - use database in production)
const nftDatabase = new Map();

/**
 * POST /api/nft/metadata
 * Store NFT metadata
 */
router.post('/metadata', async (req, res) => {
  try {
    const { tokenId, claim, proofId, topic, category, verification } = req.body;

    if (!tokenId || !claim || !proofId) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    const metadata = {
      name: `TruthMint Knowledge #${tokenId}`,
      description: claim,
      image: `https://api.dicebear.com/7.x/shapes/svg?seed=${tokenId}`,
      attributes: [
        {
          trait_type: 'Topic',
          value: topic || 'General'
        },
        {
          trait_type: 'Category',
          value: category || 'GENERAL'
        },
        {
          trait_type: 'Verification Status',
          value: verification.isVerified ? 'Verified' : 'Unverified'
        },
        {
          trait_type: 'Confidence Score',
          value: verification.confidenceScore,
          display_type: 'number'
        },
        {
          trait_type: 'Data Source',
          value: verification.dataSource
        },
        {
          trait_type: 'Proof ID',
          value: proofId
        }
      ],
      external_url: `https://truthmint.app/nft/${tokenId}`,
      proof: {
        proofId,
        claim,
        verification
      }
    };

    nftDatabase.set(tokenId.toString(), metadata);

    res.json({
      success: true,
      metadata,
      tokenURI: `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString('base64')}`
    });
  } catch (error) {
    console.error('Metadata creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create metadata',
      message: error.message 
    });
  }
});

/**
 * GET /api/nft/metadata/:tokenId
 * Get NFT metadata by token ID
 */
router.get('/metadata/:tokenId', (req, res) => {
  try {
    const { tokenId } = req.params;
    const metadata = nftDatabase.get(tokenId);

    if (!metadata) {
      return res.status(404).json({ 
        error: 'NFT not found' 
      });
    }

    res.json(metadata);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch metadata',
      message: error.message 
    });
  }
});

/**
 * GET /api/nft/all
 * Get all minted NFTs
 */
router.get('/all', (req, res) => {
  try {
    const allNFTs = Array.from(nftDatabase.entries()).map(([tokenId, metadata]) => ({
      tokenId,
      ...metadata
    }));

    res.json({
      success: true,
      nfts: allNFTs,
      total: allNFTs.length
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch NFTs',
      message: error.message 
    });
  }
});

module.exports = router;