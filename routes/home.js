const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Paths to static data files
const categoriesFilePath = path.join(__dirname, '..', 'static_data', 'categories.json');
const reviewsFilePath = path.join(__dirname, '..', 'static_data', 'reviews.json');
const mealsFilePath = path.join(__dirname, '..', 'static_data', 'meals.json');

// Helper function to read JSON file
function readJSONFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error reading file ${filePath}:`, err);
        return [];
    }
}

// GET /api/home/categories - Get all categories
router.get('/categories', (req, res) => {
    try {
        const categories = readJSONFile(categoriesFilePath);
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// GET /api/home/reviews - Get all reviews
router.get('/reviews', (req, res) => {
    try {
        const reviews = readJSONFile(reviewsFilePath);
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// GET /api/home/popular-meals - Get popular meals
router.get('/popular-meals', (req, res) => {
    try {
        const meals = readJSONFile(mealsFilePath);
        // Return all meals (or you could filter for popular ones)
        res.json(meals);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch popular meals' });
    }
});

module.exports = router;
