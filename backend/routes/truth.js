const express = require('express');
const router = express.Router();
const truthService = require('../services/truth');

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