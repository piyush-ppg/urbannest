const express = require('express');
const router = express.Router();

// Mock Data for "AI" generation for a university project
// In a real scenario, this would call an external API (like OpenAI) or a trained ML model.

// @desc    Generate Property Description using "AI"
// @route   POST /api/ai/generate-description
// @access  Public
router.post('/generate-description', (req, res) => {
    const { title, type, location, bhk } = req.body;

    // Simple deterministic generative logic to mimic AI
    const adjectives = ['stunning', 'luxurious', 'modern', 'spacious', 'beautifully designed', 'premium'];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];

    const bhkText = bhk ? `${bhk} BHK ` : '';
    const safeType = type || 'Property';
    const safeLocation = location || 'a prime location';
    const safeTitle = title || 'this amazing listing';

    const generatedDesc = `Discover this ${randomAdjective} ${bhkText}${safeType} located in the heart of ${safeLocation}. Featuring state-of-the-art amenities and breathtaking views, "${safeTitle}" is built to offer the pinnacle of comfort and luxury. Perfect for families looking for a seamless blend of convenience and style. Close to major transit hubs, top-tier schools, and entertainment centers. Don't miss the opportunity to make this your dream home!`;

    res.status(200).json({ description: generatedDesc });
});

// @desc    Estimate Property Price using "AI"
// @route   POST /api/ai/estimate-price
// @access  Public
router.post('/estimate-price', (req, res) => {
    const { location, bhk, type, areaSqft } = req.body;

    // A deterministic mock "AI" algorithm based on base rates
    let baseRatePerSqft = 5000; // Base rate across the board

    // Adjust base rate by "Location" heuristic
    if (location && location.toLowerCase().includes('mumbai')) baseRatePerSqft = 15000;
    if (location && location.toLowerCase().includes('bangalore')) baseRatePerSqft = 8000;
    if (location && location.toLowerCase().includes('bandra')) baseRatePerSqft = 30000;

    // Adjust by Type
    let typeMultiplier = 1;
    if (type === 'Villa') typeMultiplier = 1.5;
    if (type === 'Commercial') typeMultiplier = 1.2;

    const finalArea = areaSqft || ((bhk || 2) * 500); // Guessed area if not provided (500 sqft per room)
    const estimatedPrice = baseRatePerSqft * typeMultiplier * finalArea;

    // Return a range to make it feel more authentic
    const lowerBound = estimatedPrice * 0.9;
    const upperBound = estimatedPrice * 1.1;

    res.status(200).json({
        estimatedPrice,
        range: { min: lowerBound, max: upperBound },
        currency: 'INR'
    });
});

module.exports = router;
