// API base URL
const API_BASE = '/api';

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
    loadPopularMeals();
    loadCategories();
    loadReviews();
});

// Load popular meals from backend (max 3)
async function loadPopularMeals() {
    try {
        const response = await fetch(`${API_BASE}/meals`);
        const allMeals = await response.json();

        // Limit to 3 meals for homepage
        const meals = allMeals.slice(0, 3);

        const mealsContainer = document.getElementById('meals-container');
        mealsContainer.innerHTML = '';

        if (meals.length === 0) {
            mealsContainer.innerHTML = '<p class="no-meals">No meals available yet.</p>';
            return;
        }

        meals.forEach(meal => {
            const mealCard = document.createElement('div');
            mealCard.classList.add('meal-card');
            mealCard.innerHTML = `
                <img src="${meal.image}" alt="${escapeHtml(meal.name)}" onerror="this.src='../images/meals/profile.png'">
                <h3>${escapeHtml(meal.name)}</h3>
                <p class="meal-price">${meal.price} EGP</p>
            `;
            // Make card clickable
            mealCard.style.cursor = 'pointer';
            mealCard.addEventListener('click', () => {
                window.location.href = `meal-details.html?id=${meal.id}`;
            });
            mealsContainer.appendChild(mealCard);
        });
    } catch (error) {
        console.error('Error loading popular meals:', error);
        document.getElementById('meals-container').innerHTML = '<p>Failed to load meals. Please try again later.</p>';
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load categories from backend
async function loadCategories() {
    try {
        const categoriesGrid = document.querySelector('.categories-grid');
        if (!categoriesGrid) return;

        const response = await fetch(`${API_BASE}/home/categories`);
        const categories = await response.json();

        categoriesGrid.innerHTML = '';

        categories.forEach(category => {
            const categoryCard = document.createElement('div');
            categoryCard.classList.add('category-card');
            categoryCard.innerHTML = `
                <img src="${category.image}" alt="${escapeHtml(category.name)}">
                <h3>${escapeHtml(category.name)}</h3>
                <p>${escapeHtml(category.description || '')}</p>
            `;
            // Add click handler to navigate to meals page filtered by category
            categoryCard.style.cursor = 'pointer';
            categoryCard.addEventListener('click', () => {
                const categoryType = category.type || category.name.toLowerCase();
                window.location.href = `meals.html?category=${encodeURIComponent(categoryType)}`;
            });
            categoriesGrid.appendChild(categoryCard);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
        const categoriesGrid = document.querySelector('.categories-grid');
        if (categoriesGrid) {
            categoriesGrid.innerHTML = '<p>Failed to load categories. Please try again later.</p>';
        }
    }
}

// Load reviews from backend
async function loadReviews() {
    try {
        const reviewsGrid = document.querySelector('.reviews-grid');
        if (!reviewsGrid) return;

        const response = await fetch(`${API_BASE}/home/reviews`);
        const reviews = await response.json();

        reviewsGrid.innerHTML = '';

        reviews.forEach(review => {
            const reviewCard = document.createElement('div');
            reviewCard.classList.add('review-card');

            // Generate star rating
            const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

            reviewCard.innerHTML = `
                <img src="${review.avatar}" alt="${escapeHtml(review.name)}">
                <h3>${escapeHtml(review.name)}</h3>
                <div class="stars">${stars}</div>
                <p>${escapeHtml(review.comment)}</p>
            `;
            reviewsGrid.appendChild(reviewCard);
        });
    } catch (error) {
        console.error('Error loading reviews:', error);
        const reviewsGrid = document.querySelector('.reviews-grid');
        if (reviewsGrid) {
            reviewsGrid.innerHTML = '<p>Failed to load reviews. Please try again later.</p>';
        }
    }
}
