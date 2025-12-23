const Home = require('../models/Home');
const Meal = require('../models/Meal');

// GET /api/home/categories
exports.getCategories = (req, res) => {
    try {
        const categories = Home.getCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};

// GET /api/home/reviews
exports.getReviews = (req, res) => {
    try {
        const reviews = Home.getReviews();
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
};

// GET /api/home/popular-meals
exports.getPopularMeals = (req, res) => {
    try {
        const meals = Home.getPopularMeals();
        res.json(meals);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch popular meals' });
    }
};
