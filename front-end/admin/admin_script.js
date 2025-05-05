let apiUrl;
let redirectUrl;

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    apiUrl = 'http://127.0.0.1:8001';
    redirectUrl = '../index.html';
} else {
    apiUrl = window.location.origin;
    redirectUrl = 'https://derm-platform-bot.cdb.com.ua';
}

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');

    // Добавляем код для изменения URL кнопки "Back to Home"
    const backButton = document.querySelector('.back-button');
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        backButton.href = '../index.html'; // Используем тот же путь, что и для redirectUrl
    }

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Clear previous messages
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';

        // Prepare form data for the token endpoint
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        fetch(`${apiUrl}/api/token`, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Invalid credentials');
            }
        })
        .then(data => {
            // Save token to localStorage
            localStorage.setItem('token', data.access_token);

            // Show success message
            successMessage.style.display = 'block';

            // Redirect to index page after a short delay
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 1500);
        })
        .catch(error => {
            // Show error message
            errorMessage.style.display = 'block';
            console.error('Login error:', error);
        });
    });
});