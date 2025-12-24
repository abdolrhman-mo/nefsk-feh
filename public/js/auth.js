document.querySelector('form').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Check if this is register or login page
    const email = document.getElementById('email');
    const confirmPassword = document.getElementById('confirm-password');
    const address = document.getElementById('address');

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // If email field exists, this is the registration form
    if (email) {
        if (confirmPassword && password !== confirmPassword.value) {
            alert('Passwords do not match!');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    email: email.value,
                    address: address?.value || '',
                    password
                })
            });

            const data = await response.json();

            if (data.success) {
                // Auto-login: save user in localStorage and redirect to home
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'home.html';
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            alert('Error connecting to server');
        }
    } else {
        // Login form
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
    }
});
