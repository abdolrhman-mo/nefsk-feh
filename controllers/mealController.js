const Meal = require('../models/Meal');

// GET /api/meals
exports.getAllMeals = (req, res) => {
    try {
        const meals = Meal.findAll();
        res.json(meals);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch meals' });
    }
};

// GET /api/meals/:id
exports.getMealById = (req, res) => {
    try {
        const meal = Meal.findById(req.params.id);

        if (!meal) {
            return res.status(404).json({ error: 'Meal not found' });
        }

        res.json(meal);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch meal' });
    }
};

// GET /api/meals/category/:category (optional - for filtering)
exports.getMealsByCategory = (req, res) => {
    try {
        const meals = Meal.findByCategory(req.params.category);
        res.json(meals);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch meals by category' });
    }
};
