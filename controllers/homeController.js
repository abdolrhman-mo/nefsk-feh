const Home = require('../models/Home');

// GET /api/home/categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Home.getCategories();
        res.json(categories);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};

// GET /api/home/reviews
exports.getReviews = async (req, res) => {
    try {
        const reviews = await Home.getReviews();
        res.json(reviews);
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
};

// GET /api/home/popular-meals
exports.getPopularMeals = async (req, res) => {
    try {
        const meals = await Home.getPopularMeals();
        res.json(meals);
    } catch (error) {
        console.error('Get popular meals error:', error);
        res.status(500).json({ error: 'Failed to fetch popular meals' });
    }
};
