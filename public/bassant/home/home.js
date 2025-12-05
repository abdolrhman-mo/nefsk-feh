// Hamburger menu toggle
const hamburger = document.getElementById('hamburger');
const menu = document.getElementById('menu');

hamburger.addEventListener('click', () => {
    menu.style.display = (menu.style.display === 'flex') ? 'none' : 'flex';
});

// Popular meals (static/mock data)
const meals = [
    { name: "Pizza", image: "IMG_3210.JPG" },
    { name: "Burger", image: "IMG_3209.JPG" },
    { name: "Mahshi", image: "IMG_3211.JPG" },
    { name: "Twagen", image: "IMG_3212.JPG" }
];

const mealsContainer = document.getElementById('meals-container');

meals.forEach(meal => {
    const mealCard = document.createElement('div');
    mealCard.classList.add('meal-card');
    mealCard.innerHTML = `
        <img src="${meal.image}" alt="${meal.name}">
        <h3>${meal.name}</h3>
    `;
    mealsContainer.appendChild(mealCard);
});
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