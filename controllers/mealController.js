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

// GET /api/meals/category/:category
exports.getMealsByCategory = (req, res) => {
    try {
        const meals = Meal.findByCategory(req.params.category);
        res.json(meals);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch meals by category' });
    }
};

// GET /api/meals/user/:userId
exports.getMealsByUser = (req, res) => {
    try {
        const meals = Meal.findByUserId(req.params.userId);
        res.json(meals);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user meals' });
    }
};

// POST /api/meals
exports.createMeal = (req, res) => {
    try {
        const { name, description, price, image, category, userId } = req.body;

        const result = Meal.create({
            name,
            description,
            price,
            image,
            category,
            userId
        });

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.errors[0]
            });
        }

        res.status(201).json({
            success: true,
            message: 'Meal created successfully',
            meal: result.meal
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during meal creation'
        });
    }
};

// PUT /api/meals/:id
exports.updateMeal = (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, image, category, userId } = req.body;

        // userId in body is the requesting user (for ownership check)
        const result = Meal.update(id, { name, description, price, image, category }, userId);

        if (!result.success) {
            const statusCode = result.errors[0] === 'Meal not found' ? 404 : 403;
            return res.status(statusCode).json({
                success: false,
                message: result.errors[0]
            });
        }

        res.json({
            success: true,
            message: 'Meal updated successfully',
            meal: result.meal
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during meal update'
        });
    }
};

// DELETE /api/meals/:id
exports.deleteMeal = (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        // userId in body is the requesting user (for ownership check)
        const result = Meal.delete(id, userId);

        if (!result.success) {
            const statusCode = result.errors[0] === 'Meal not found' ? 404 : 403;
            return res.status(statusCode).json({
                success: false,
                message: result.errors[0]
            });
        }

        res.json({
            success: true,
            message: 'Meal deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during meal deletion'
        });
    }
};
