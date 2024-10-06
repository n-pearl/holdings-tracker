document.addEventListener('DOMContentLoaded', function () {
    const toggleDarkModeButton = document.getElementById('toggleDarkModeButton');
    const form = document.getElementById('holdingForm');
    const checkAllHoldingsButton = document.getElementById('checkAllHoldingsButton');

    toggleDarkModeButton.addEventListener('click', function () {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        updateDarkModeStyles(isDarkMode);
    });

    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) {
        document.body.classList.add('dark-mode');
    }
    updateDarkModeStyles(savedDarkMode);

    function updateDarkModeStyles(isDarkMode) {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            toggleDarkModeButton.textContent = 'Toggle Light Mode';
        } else {
            document.body.classList.remove('dark-mode');
            toggleDarkModeButton.textContent = 'Toggle Dark Mode';
        }
    }

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
    
        const username = document.getElementById('username').value.trim();
        const holdingName = document.getElementById('holdingName').value.trim();
        const holdingType = document.getElementById('holdingType').value;
        const stockSymbol = document.getElementById('stockSymbol').value.trim();
    
        if (!username || !holdingName || !holdingType || (holdingType === 'stock' && !stockSymbol)) {
            alert('Please fill out all required fields.');
            return;
        }
    
        try {
            const holdingData = {
                username: username,
                holdingName: holdingName,
                holdingType: holdingType,
                stockSymbol: holdingType === 'stock' ? stockSymbol : null
            };
    
            const response = await fetch('/api/addHolding', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(holdingData)
            });
    
            if (!response.ok) {
                throw new Error('Failed to add holding');
            }
    
            const result = await response.json();
            alert('Holding added successfully!');
            form.reset(); // Clear the form
    
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while adding the holding. Please try again.');
        }
    });

    checkAllHoldingsButton.addEventListener('click', async function (event) {
        event.preventDefault();
    
        try {
            const username = document.getElementById('username').value;
            const response = await fetch(`/api/analyze?username=${username}`);
            if (!response.ok) {
                throw new Error('Failed to fetch holdings');
            }
    
            const results = await response.json();
            sessionStorage.setItem('holdingsData', JSON.stringify(results));
            window.location.href = '/results.html';
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while fetching your holdings. Please try again later or check your internet connection.');
        }
    });    
});
