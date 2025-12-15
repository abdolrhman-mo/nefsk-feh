// Hamburger menu toggle
const hamburger = document.getElementById('hamburger');
const menu = document.getElementById('menu');

hamburger.addEventListener('click', () => {
    menu.style.display = (menu.style.display === 'flex') ? 'none' : 'flex';
});

// API base URL
const API_BASE = '/api';


// Helper function to show loading state
function showLoading(elementId, message = 'Loading...') {
    const element = document.getElementById(elementId) || document.querySelector(elementId);
    if (element) {
        element.innerHTML = `<div class="loading">${message}</div>`;
    }
}

// Helper function to show error state
function showError(elementId, message = 'Failed to load data') {
    const element = document.getElementById(elementId) || document.querySelector(elementId);
    if (element) {
        element.innerHTML = `<div class="error">${message}</div>`;
    }
}

// Add CSS for loading and error states
function addLoadingStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .loading {
            text-align: center;
            padding: 40px;
            color: #666;
            font-style: italic;
        }
        .error {
            text-align: center;
            padding: 40px;
            color: #e74c3c;
            background: #fdf2f2;
            border-radius: 8px;
            margin: 10px 0;
        }
        .review-date {
            color: #888;
            font-size: 12px;
            margin-top: 10px;
        }
        .category-type {
            background: #007bff;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            margin-top: 10px;
            display: inline-block;
        }
        .meal-description {
            color: #666;
            font-size: 14px;
            margin: 5px 0;
        }
    `;
    document.head.appendChild(style);
}

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Home page loaded, fetching data...');
    addLoadingStyles();
    loadPopularMeals();
    loadCategories();
    loadReviews();
});

// Load popular meals from backend
async function loadPopularMeals() {
    console.log('Loading popular meals...');
    showLoading('#meals-container', 'Loading meals...');
    
    try {
        const response = await fetch(`${API_BASE}/home/popular-meals`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const meals = await response.json();
        console.log('Popular meals data:', meals);
        
        const mealsContainer = document.getElementById('meals-container');
        if (!mealsContainer) {
            throw new Error('Meals container not found');
        }
        
        mealsContainer.innerHTML = ''; // Clear existing content
        
        if (meals.length === 0) {
            mealsContainer.innerHTML = '<p>No meals available at the moment.</p>';
            return;
        }
        
        meals.forEach(meal => {
            const mealCard = document.createElement('div');
            mealCard.classList.add('meal-card');
            mealCard.innerHTML = `
                <img src="${meal.image}" alt="${meal.name}" onerror="this.src='../images/placeholder.jpg'">
                <h3>${meal.name}</h3>
                <p class="meal-description">${meal.description || ''}</p>
                <p class="meal-price">${meal.price} EGP</p>
            `;
            mealsContainer.appendChild(mealCard);
        });
        
        console.log(`Loaded ${meals.length} popular meals`);
    } catch (error) {
        console.error('Error loading popular meals:', error);
        showError('#meals-container', 'Failed to load meals. Please try again later.');
    }
}



// Load categories from backend
async function loadCategories() {
    console.log('Loading categories...');
    showLoading('.categories-grid', 'Loading categories...');
    
    try {
        const categoriesGrid = document.querySelector('.categories-grid');
        if (!categoriesGrid) {
            throw new Error('Categories grid not found');
        }
        
        const response = await fetch(`${API_BASE}/home/categories`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const categories = await response.json();
        console.log('Categories data:', categories);
        
        categoriesGrid.innerHTML = '';
        
        if (categories.length === 0) {
            categoriesGrid.innerHTML = '<p>No categories available at the moment.</p>';
            return;
        }
        
        categories.forEach(category => {
            const categoryCard = document.createElement('div');
            categoryCard.classList.add('category-card');
            categoryCard.innerHTML = `
                <img src="${category.image}" alt="${category.name}" onerror="this.src='../images/placeholder.jpg'">
                <h3>${category.name}</h3>
                <p>${category.description || ''}</p>
                <span class="category-type">${category.type || ''}</span>
            `;
            categoriesGrid.appendChild(categoryCard);
        });
        
        console.log(`Loaded ${categories.length} categories`);
    } catch (error) {
        console.error('Error loading categories:', error);
        showError('.categories-grid', 'Failed to load categories. Please try again later.');
    }
}



// Load reviews from backend
async function loadReviews() {
    console.log('Loading reviews...');
    showLoading('.reviews-grid', 'Loading reviews...');
    
    try {
        const reviewsGrid = document.querySelector('.reviews-grid');
        if (!reviewsGrid) {
            throw new Error('Reviews grid not found');
        }
        
        const response = await fetch(`${API_BASE}/home/reviews`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const reviews = await response.json();
        console.log('Reviews data:', reviews);
        
        reviewsGrid.innerHTML = '';
        
        if (reviews.length === 0) {
            reviewsGrid.innerHTML = '<p>No reviews available at the moment.</p>';
            return;
        }
        
        reviews.forEach(review => {
            const reviewCard = document.createElement('div');
            reviewCard.classList.add('review-card');
            
            // Generate star rating
            const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
            
            // Format date if available
            const reviewDate = review.date ? new Date(review.date).toLocaleDateString() : '';
            
            reviewCard.innerHTML = `
                <img src="${review.avatar}" alt="user review" onerror="this.src='../images/reviews/default-avatar.jpg'">
                <h3>${review.name}</h3>
                <div class="stars">${stars}</div>
                <p>${review.comment}</p>
                ${reviewDate ? `<small class="review-date">${reviewDate}</small>` : ''}
            `;
            reviewsGrid.appendChild(reviewCard);
        });
        
        console.log(`Loaded ${reviews.length} reviews`);
    } catch (error) {
        console.error('Error loading reviews:', error);
        showError('.reviews-grid', 'Failed to load reviews. Please try again later.');
    }
}
// Hamburger toggle
const navRight = document.querySelector(".nav-right");

hamburger.addEventListener("click", () => {
    navRight.classList.toggle("open");
});

// Sections toggle
const links = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".section");

links.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();

        // إزالة active من كل رابط
        links.forEach(l => l.classList.remove("active"));
        link.classList.add("active");

        // اظهار القسم المطلوب
        const targetId = link.getAttribute("href").substring(1);
        sections.forEach(sec => {
            sec.style.display = (sec.id === targetId) ? "block" : "none";
        });

        // لو الـ hamburger مفتوح، أقفله بعد الضغط
        if(navRight.classList.contains("open")){
            navRight.classList.remove("open");
        }
    });
});
