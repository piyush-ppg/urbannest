const express = require('express');
const Property = require('../models/Property');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
router.get('/', async (req, res) => {
    try {
        const properties = await Property.find({}).sort({ createdAt: -1 });
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// @desc    Get single property by ID
// @route   GET /api/properties/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (property) {
            res.json(property);
        } else {
            res.status(404).json({ message: 'Property not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// @desc    Create a property
// @route   POST /api/properties
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { title, description, price, location, bhk, type, amenities, images } = req.body;

        const property = new Property({
            title,
            description,
            price,
            location,
            bhk,
            type,
            amenities,
            images,
            userId: req.user,
        });

        const createdProperty = await property.save();
        res.status(201).json(createdProperty);
    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

module.exports = router;
