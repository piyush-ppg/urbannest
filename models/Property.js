const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    bhk: { type: Number },
    type: { type: String, enum: ['Apartment', 'House', 'Villa', 'Commercial', 'Land'], default: 'Apartment' },
    amenities: [{ type: String }],
    images: [{ type: String }], // URLs to images
    isAvailable: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Property', propertySchema);
