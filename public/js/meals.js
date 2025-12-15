const API_BASE = '/api';
let meals = [], categories = [];
const elements = {
    container: document.getElementById('mealsContainer'),
    searchInput: document.getElementById('searchInput'),
    categoryFilter: document.getElementById('categoryFilter'),
    priceFilter: document.getElementById('priceFilter'),
    sortFilter: document.getElementById('sortFilter'),
    cartCount: document.getElementById('cartCount')
};

async function fetchData(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
}

async function loadMeals() {
    try {
        meals = await fetchData(`${API_BASE}/meals`);
        if (!Array.isArray(meals) || meals.length === 0) meals = await fetchData(`${API_BASE}/home/popular-meals`);
        categories = await fetchData(`${API_BASE}/home/categories`);
        populateCategories();
        renderMeals(meals);
        updateCartCount();
    } catch (err) { elements.container.innerHTML = '<div class="no-results">Failed to load meals. Please refresh.</div>'; }
}

function populateCategories() {
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.type || cat.name.toLowerCase();
        opt.textContent = cat.name;
        elements.categoryFilter.appendChild(opt);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(func, wait) {
    let timeout;
    return function(...args) { clearTimeout(timeout); timeout = setTimeout(() => func(...args), wait); };
}

function renderMeals(list) {
    if (!list || list.length === 0) { elements.container.innerHTML = '<div class="no-results">No meals found. Try different filters.</div>'; return; }
    const frag = document.createDocumentFragment();
    const defaultImg = '../images/meals/profile.png';
    list.forEach(meal => {
        const card = document.createElement('div');
        card.className = 'meal-card';
        let imageSrc = meal.image || defaultImg;
        if (!imageSrc.startsWith('/') && !imageSrc.startsWith('http')) imageSrc = `../${imageSrc}`;
        card.innerHTML = `<img src="${imageSrc}" alt="${escapeHtml(meal.name)}" loading="lazy" onerror="this.onerror=null; this.src='${defaultImg}';"><h3>${escapeHtml(meal.name)}</h3><p class="meal-price">${meal.price || 0} EGP</p>`;
        card.addEventListener('click', () => window.location.href = `meal-details.html?id=${meal.id}`);
        frag.appendChild(card);
    });
    elements.container.innerHTML = '';
    elements.container.appendChild(frag);
}

function applyFilters() {
    let filtered = [...meals];
    const s = elements.searchInput.value.toLowerCase().trim(), cat = elements.categoryFilter.value, p = elements.priceFilter.value, sort = elements.sortFilter.value;
    if (s) filtered = filtered.filter(m => (m.name || '').toLowerCase().includes(s) || (m.description || '').toLowerCase().includes(s));
    if (cat !== 'all') filtered = filtered.filter(m => (m.category || '').toLowerCase() === cat);
    if (p !== 'all') {
        if (p === 'low') filtered = filtered.filter(m => m.price < 350);
        else if (p === 'mid') filtered = filtered.filter(m => m.price >= 350 && m.price <= 400);
        else if (p === 'high') filtered = filtered.filter(m => m.price > 400);
    }
    if (sort !== 'default') {
        filtered.sort((a, b) => {
            if (sort === 'price-asc') return (a.price || 0) - (b.price || 0);
            if (sort === 'price-desc') return (b.price || 0) - (a.price || 0);
            if (sort === 'name-asc') return (a.name || '').localeCompare(b.name || '');
            return 0;
        });
    }
    renderMeals(filtered);
}

async function updateCartCount() {
    try {
        const cart = await fetchData(`${API_BASE}/cart`);
        const total = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        elements.cartCount.textContent = total;
        elements.cartCount.style.display = total > 0 ? 'inline-block' : 'none';
    } catch (err) { elements.cartCount.textContent = '0'; }
}

elements.searchInput.addEventListener('input', debounce(applyFilters, 300));
elements.categoryFilter.addEventListener('change', applyFilters);
elements.priceFilter.addEventListener('change', applyFilters);
elements.sortFilter.addEventListener('change', applyFilters);
loadMeals();
