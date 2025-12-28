const { Meal: MealModel } = require('./index');
const { Op } = require('sequelize');

// Validation helper
function validateMeal(mealData) {
    const errors = [];

    if (!mealData.name || mealData.name.trim() === '') {
        errors.push('Meal name is required');
    }

    if (mealData.price === undefined || mealData.price === null) {
        errors.push('Price is required');
    } else if (isNaN(mealData.price) || mealData.price < 0) {
        errors.push('Price must be a positive number');
    }

    if (!mealData.userId) {
        errors.push('User ID is required');
    }

    return errors;
}

const Meal = {
    // Ensure data exists (no-op for database, kept for backward compatibility)
    ensureDataExists() {
        // Database tables are created via sequelize.sync()
    },

    // Get all meals
    async findAll() {
        const meals = await MealModel.findAll();
        return meals.map(m => m.get({ plain: true }));
    },

    // Find meal by ID (flexible matching for string/number)
    async findById(id) {
        const mealIdNum = parseInt(id);
        const meal = await MealModel.findByPk(mealIdNum);
        return meal ? meal.get({ plain: true }) : undefined;
    },

    // Find meals by user ID
    async findByUserId(userId) {
        const userIdNum = parseInt(userId);
        const meals = await MealModel.findAll({
            where: { userId: userIdNum }
        });
        return meals.map(m => m.get({ plain: true }));
    },

    // Find meals by category
    async findByCategory(category) {
        if (!category) {
            return this.findAll();
        }

        const meals = await MealModel.findAll({
            where: {
                category: { [Op.like]: category }
            }
        });
        return meals.map(m => m.get({ plain: true }));
    },

    // Get popular meals (returns first n meals or all if no limit)
    async findPopular(limit = null) {
        const options = {};
        if (limit && limit > 0) {
            options.limit = limit;
        }
        const meals = await MealModel.findAll(options);
        return meals.map(m => m.get({ plain: true }));
    },

    // Search meals by name or description
    async search(query) {
        if (!query) {
            return this.findAll();
        }

        const meals = await MealModel.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${query}%` } },
                    { description: { [Op.like]: `%${query}%` } }
                ]
            }
        });
        return meals.map(m => m.get({ plain: true }));
    },

    // Create a new meal
    async create(mealData) {
        const errors = validateMeal(mealData);
        if (errors.length > 0) {
            return { success: false, errors };
        }

        try {
            const newMeal = await MealModel.create({
                name: mealData.name.trim(),
                description: mealData.description || '',
                price: parseFloat(mealData.price),
                image: mealData.image || '/images/meals/default.jpg',
                category: mealData.category || 'main',
                userId: parseInt(mealData.userId)
            });

            return { success: true, meal: newMeal.get({ plain: true }) };
        } catch (error) {
            if (error.name === 'SequelizeValidationError') {
                return { success: false, errors: [error.errors[0].message] };
            }
            return { success: false, errors: ['Failed to save meal'] };
        }
    },

    // Update an existing meal
    async update(id, mealData, requestUserId) {
        const mealIdNum = parseInt(id);
        const meal = await MealModel.findByPk(mealIdNum);

        if (!meal) {
            return { success: false, errors: ['Meal not found'] };
        }

        // Check ownership - only the creator can update
        if (meal.userId !== parseInt(requestUserId)) {
            return { success: false, errors: ['You can only update your own meals'] };
        }

        try {
            // Update fields
            if (mealData.name) meal.name = mealData.name.trim();
            if (mealData.description !== undefined) meal.description = mealData.description;
            if (mealData.price !== undefined) meal.price = parseFloat(mealData.price);
            if (mealData.image) meal.image = mealData.image;
            if (mealData.category) meal.category = mealData.category;

            await meal.save();

            return { success: true, meal: meal.get({ plain: true }) };
        } catch (error) {
            if (error.name === 'SequelizeValidationError') {
                return { success: false, errors: [error.errors[0].message] };
            }
            return { success: false, errors: ['Failed to update meal'] };
        }
    },

    // Delete a meal
    async delete(id, requestUserId) {
        const mealIdNum = parseInt(id);
        const meal = await MealModel.findByPk(mealIdNum);

        if (!meal) {
            return { success: false, errors: ['Meal not found'] };
        }

        // Check ownership - only the creator can delete
        if (meal.userId !== parseInt(requestUserId)) {
            return { success: false, errors: ['You can only delete your own meals'] };
        }

        try {
            await meal.destroy();
            return { success: true, message: 'Meal deleted successfully' };
        } catch (error) {
            return { success: false, errors: ['Failed to delete meal'] };
        }
    }
};

module.exports = Meal;
