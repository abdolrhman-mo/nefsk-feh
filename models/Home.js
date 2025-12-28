const { Category, Review, Meal } = require('./index');

const Home = {
    // Get all categories
    async getCategories() {
        const categories = await Category.findAll();
        return categories.map(c => c.get({ plain: true }));
    },

    // Get all reviews
    async getReviews() {
        const reviews = await Review.findAll();
        return reviews.map(r => r.get({ plain: true }));
    },

    // Get popular meals
    async getPopularMeals(limit = null) {
        const options = {};
        if (limit && limit > 0) {
            options.limit = limit;
        }
        const meals = await Meal.findAll(options);
        return meals.map(m => m.get({ plain: true }));
    }
};

module.exports = Home;
