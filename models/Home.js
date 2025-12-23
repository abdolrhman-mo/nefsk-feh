const fs = require('fs');
const path = require('path');

const CATEGORIES_FILE = path.join(__dirname, '../static_data/categories.json');
const REVIEWS_FILE = path.join(__dirname, '../static_data/reviews.json');
const MEALS_FILE = path.join(__dirname, '../static_data/meals.json');

// Helper: Read JSON file safely
function readJSONFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error reading file ${filePath}:`, err.message);
        return [];
    }
}

const Home = {
    // Get all categories
    getCategories() {
        return readJSONFile(CATEGORIES_FILE);
    },

    // Get all reviews
    getReviews() {
        return readJSONFile(REVIEWS_FILE);
    },

    // Get popular meals
    getPopularMeals(limit = null) {
        const meals = readJSONFile(MEALS_FILE);
        if (limit && limit > 0) {
            return meals.slice(0, limit);
        }
        return meals;
    }
};

module.exports = Home;
