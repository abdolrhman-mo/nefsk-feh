const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');

// GET /api/meals - Get all meals
router.get('/', mealController.getAllMeals);

// GET /api/meals/:id - Get a single meal by ID
router.get('/:id', mealController.getMealById);

module.exports = router;
