const fs = require('fs');
const path = require('path');

// Use data folder for user-created meals (writable)
const MEALS_FILE = path.join(__dirname, '../data/meals.json');
// Static meals for fallback/seeding
const STATIC_MEALS_FILE = path.join(__dirname, '../static_data/meals.json');

// Helper: Read meals from file
function readMeals() {
    try {
        const data = fs.readFileSync(MEALS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

// Helper: Write meals to file
function writeMeals(meals) {
    try {
        fs.writeFileSync(MEALS_FILE, JSON.stringify(meals, null, 2));
        return true;
    } catch (err) {
        console.error('Error writing meals:', err);
        return false;
    }
}

// Helper: Generate next ID
function generateId(meals) {
    if (meals.length === 0) return 1;
    const maxId = Math.max(...meals.map(m => m.id || 0));
    return maxId + 1;
}

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
    // Ensure data file exists
    ensureDataExists() {
        const dataDir = path.join(__dirname, '../data');

        // Create data directory if it doesn't exist
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // Create meals.json if it doesn't exist, seed from static data
        if (!fs.existsSync(MEALS_FILE)) {
            try {
                // Read static meals and add default userId
                const staticData = fs.readFileSync(STATIC_MEALS_FILE, 'utf8');
                const staticMeals = JSON.parse(staticData);

                // Add userId: 1 to all existing meals (default admin/system user)
                const seededMeals = staticMeals.map(meal => ({
                    ...meal,
                    userId: 1
                }));

                fs.writeFileSync(MEALS_FILE, JSON.stringify(seededMeals, null, 2));
            } catch (err) {
                // If static file doesn't exist, create empty array
                fs.writeFileSync(MEALS_FILE, '[]');
            }
        }
    },

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

    // Find meals by user ID
    findByUserId(userId) {
        const meals = readMeals();
        const userIdNum = parseInt(userId);

        return meals.filter(m => m.userId === userIdNum);
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
    },

    // Create a new meal
    create(mealData) {
        const errors = validateMeal(mealData);
        if (errors.length > 0) {
            return { success: false, errors };
        }

        const meals = readMeals();

        const newMeal = {
            id: generateId(meals),
            name: mealData.name.trim(),
            description: mealData.description || '',
            price: parseFloat(mealData.price),
            image: mealData.image || '/images/meals/default.jpg',
            category: mealData.category || 'main',
            userId: parseInt(mealData.userId)
        };

        meals.push(newMeal);

        if (writeMeals(meals)) {
            return { success: true, meal: newMeal };
        } else {
            return { success: false, errors: ['Failed to save meal'] };
        }
    },

    // Update an existing meal
    update(id, mealData, requestUserId) {
        const meals = readMeals();
        const mealIdNum = parseInt(id);
        const mealIndex = meals.findIndex(m => m.id === mealIdNum);

        if (mealIndex === -1) {
            return { success: false, errors: ['Meal not found'] };
        }

        const meal = meals[mealIndex];

        // Check ownership - only the creator can update
        if (meal.userId !== parseInt(requestUserId)) {
            return { success: false, errors: ['You can only update your own meals'] };
        }

        // Update fields (preserve id and userId)
        const updatedMeal = {
            ...meal,
            name: mealData.name ? mealData.name.trim() : meal.name,
            description: mealData.description !== undefined ? mealData.description : meal.description,
            price: mealData.price !== undefined ? parseFloat(mealData.price) : meal.price,
            image: mealData.image || meal.image,
            category: mealData.category || meal.category
        };

        meals[mealIndex] = updatedMeal;

        if (writeMeals(meals)) {
            return { success: true, meal: updatedMeal };
        } else {
            return { success: false, errors: ['Failed to update meal'] };
        }
    },

    // Delete a meal
    delete(id, requestUserId) {
        const meals = readMeals();
        const mealIdNum = parseInt(id);
        const mealIndex = meals.findIndex(m => m.id === mealIdNum);

        if (mealIndex === -1) {
            return { success: false, errors: ['Meal not found'] };
        }

        const meal = meals[mealIndex];

        // Check ownership - only the creator can delete
        if (meal.userId !== parseInt(requestUserId)) {
            return { success: false, errors: ['You can only delete your own meals'] };
        }

        meals.splice(mealIndex, 1);

        if (writeMeals(meals)) {
            return { success: true, message: 'Meal deleted successfully' };
        } else {
            return { success: false, errors: ['Failed to delete meal'] };
        }
    }
};

module.exports = Meal;
