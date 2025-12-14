const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Path to meals.json
const mealsFilePath = path.join(__dirname, '..', 'meals.json');

// Helper function to read meals data
function getMeals() {
    try {
        const data = fs.readFileSync(mealsFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        // If file doesn't exist or is invalid, return empty array
        return [];
    }
}

// GET /api/meals - Get all meals
router.get('/', (req, res) => {
    try {
        const meals = getMeals();
        res.json(meals);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch meals' });
    }
});

// GET /api/meals/:id - Get a single meal by ID
router.get('/:id', (req, res) => {
    try {
        const meals = getMeals();
        const mealId = parseInt(req.params.id);
        const meal = meals.find(m => m.id === mealId);
        
        if (!meal) {
            return res.status(404).json({ error: 'Meal not found' });
        }
        
        res.json(meal);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch meal' });
    }
});

module.exports = router;



