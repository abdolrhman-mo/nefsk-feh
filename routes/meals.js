const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');

// GET /api/meals - Get all meals
router.get('/', mealController.getAllMeals);

// GET /api/meals/user/:userId - Get meals by user (must be before :id route)
router.get('/user/:userId', mealController.getMealsByUser);

// GET /api/meals/category/:category - Get meals by category
router.get('/category/:category', mealController.getMealsByCategory);

// GET /api/meals/:id - Get a single meal by ID
router.get('/:id', mealController.getMealById);

// POST /api/meals - Create a new meal
router.post('/', mealController.createMeal);

// PUT /api/meals/:id - Update a meal
router.put('/:id', mealController.updateMeal);

// DELETE /api/meals/:id - Delete a meal
router.delete('/:id', mealController.deleteMeal);

module.exports = router;
