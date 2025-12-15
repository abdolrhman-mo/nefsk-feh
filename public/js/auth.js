document.querySelector('form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (data.success) {
            // Save user in localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            alert('Registration successful!');
            window.location.href = 'home.html';
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (error) {
        alert('Error connecting to server');
    }
});

document.querySelector('form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            // Save user in localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            alert('Login successful!');
            window.location.href = 'home.html';
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        alert('Error connecting to server');
    }
});
