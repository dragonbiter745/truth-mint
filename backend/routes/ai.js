const express = require('express');
const router = express.Router();
const aiService = require('../services/ai');

/**
 * POST /api/ai/generate
 * Generate a factual claim from a topic
 */
router.post('/generate', async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic || topic.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Topic is required' 
      });
    }

    console.log(`Generating claim for topic: ${topic}`);

    const result = await aiService.generateClaim(topic);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate claim',
      message: error.message 
    });
  }
});

/**
 * POST /api/ai/validate
 * Validate claim structure before verification
 */
router.post('/validate', async (req, res) => {
  try {
    const { claim } = req.body;

    if (!claim) {
      return res.status(400).json({ 
        error: 'Claim is required' 
      });
    }

    const validation = await aiService.validateClaimStructure(claim);

    res.json({
      success: true,
      validation
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Validation failed',
      message: error.message 
    });
  }
});

module.exports = router;