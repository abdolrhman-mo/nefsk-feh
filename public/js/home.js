// Check if user is logged in and update navbar
const user = JSON.parse(localStorage.getItem('user'));

// API base URL
const API_BASE = '/api';

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
    // Update navbar based on login state
    updateNavbar();

    loadPopularMeals();
    loadCategories();
    loadReviews();
});

// Update navbar based on login state
function updateNavbar() {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const becomeChefLink = document.querySelector('a[href="cook-dashboard.html"]');

    if (user) {
        // User is logged in - show user menu, hide auth buttons
        authButtons.style.display = 'none';
        userMenu.style.display = 'flex';
        document.getElementById('nav-username').textContent = user.username;

        // Update "Become a Chef" to "My Dashboard"
        if (becomeChefLink) {
            becomeChefLink.textContent = 'My Dashboard';
        }

        // Logout functionality
        document.getElementById('nav-logout-btn').addEventListener('click', function() {
            localStorage.removeItem('user');
            window.location.reload(); // Refresh to show auth buttons again
        });
    } else {
        // User is not logged in - prevent access to dashboard
        if (becomeChefLink) {
            becomeChefLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('You need to sign up first to become a chef. Would you like to register?')) {
                    window.location.href = 'register.html';
                }
            });
        }
    }
}

// Load popular meals from backend
async function loadPopularMeals() {
    try {
        const response = await fetch(`${API_BASE}/home/popular-meals`);
        const meals = await response.json();
        
        const mealsContainer = document.getElementById('meals-container');
        mealsContainer.innerHTML = ''; // Clear existing content
        
        meals.forEach(meal => {
            const mealCard = document.createElement('div');
            mealCard.classList.add('meal-card');
            mealCard.innerHTML = `
                <img src="${meal.image}" alt="${meal.name}">
                <h3>${meal.name}</h3>
                <p class="meal-price">${meal.price} EGP</p>
            `;
            mealsContainer.appendChild(mealCard);
        });
    } catch (error) {
        console.error('Error loading popular meals:', error);
        document.getElementById('meals-container').innerHTML = '<p>Failed to load meals. Please try again later.</p>';
    }
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
                <img src="${category.image}" alt="${category.name}">
                <h3>${category.name}</h3>
                <p>${category.description}</p>
            `;
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
                <img src="${review.avatar}" alt="user review">
                <h3>${review.name}</h3>
                <div class="stars">${stars}</div>
                <p>${review.comment}</p>
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