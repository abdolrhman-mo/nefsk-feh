const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// GET /api/home/categories - Get all categories
router.get('/categories', homeController.getCategories);

// GET /api/home/reviews - Get all reviews
router.get('/reviews', homeController.getReviews);

// GET /api/home/popular-meals - Get popular meals
router.get('/popular-meals', homeController.getPopularMeals);

module.exports = router;
