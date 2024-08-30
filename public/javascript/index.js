document.addEventListener('DOMContentLoaded', function () {
    const toggleDarkModeButton = document.getElementById('toggleDarkModeButton');
    const form = document.getElementById('holdingForm');
    const checkAllHoldingsButton = document.getElementById('checkAllHoldingsButton');

    // Toggle dark mode
    toggleDarkModeButton.addEventListener('click', function () {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        updateDarkModeStyles(isDarkMode);
    });

    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) {
        document.body.classList.add('dark-mode');
    }
    updateDarkModeStyles(savedDarkMode);

    // Function to update styles based on dark mode
    function updateDarkModeStyles(isDarkMode) {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            toggleDarkModeButton.textContent = 'Toggle Light Mode';
        } else {
            document.body.classList.remove('dark-mode');
            toggleDarkModeButton.textContent = 'Toggle Dark Mode';
        }
    }

    // Form submission
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // Your existing logic for adding/checking holdings
        console.log('Form submitted');
        // You can add more functionality here
    });

    // Check all holdings
    checkAllHoldingsButton.addEventListener('click', async function (event) {
        event.preventDefault();
    
        try {
            const username = document.getElementById('username').value;
            const response = await fetch(`/api/analyze?username=${username}`);
            if (!response.ok) {
                throw new Error('Failed to fetch holdings');
            }
            
            // Save the holdings data in sessionStorage
            const results = await response.json();
            sessionStorage.setItem('holdingsData', JSON.stringify(results));
            
            // Redirect to the results page
            window.location.href = '/results.html';
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while fetching your holdings.');
        }
    });
});
