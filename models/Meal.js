const fs = require('fs');
const path = require('path');

const MEALS_FILE = path.join(__dirname, '../static_data/meals.json');

// Helper: Read meals from file
function readMeals() {
    try {
        const data = fs.readFileSync(MEALS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

const Meal = {
    // Get all meals
    findAll() {
        return readMeals();
    },

    // Find meal by ID (flexible matching for string/number)
    findById(id) {
        const meals = readMeals();
        const mealIdNum = parseInt(id);

        return meals.find(m =>
            m.id === mealIdNum ||
            m.id === id ||
            String(m.id) === String(id)
        );
    },

    // Find meals by category
    findByCategory(category) {
        const meals = readMeals();
        if (!category) return meals;

        return meals.filter(m =>
            m.category && m.category.toLowerCase() === category.toLowerCase()
        );
    },

    // Get popular meals (returns first n meals or all if no limit)
    findPopular(limit = null) {
        const meals = readMeals();
        if (limit && limit > 0) {
            return meals.slice(0, limit);
        }
        return meals;
    },

    // Search meals by name or description
    search(query) {
        const meals = readMeals();
        if (!query) return meals;

        const lowerQuery = query.toLowerCase();
        return meals.filter(m =>
            (m.name && m.name.toLowerCase().includes(lowerQuery)) ||
            (m.description && m.description.toLowerCase().includes(lowerQuery))
        );
    }
};

module.exports = Meal;
