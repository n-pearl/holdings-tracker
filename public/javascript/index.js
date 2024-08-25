// Updated dark mode toggle script
function toggleDarkMode() {
    const body = document.body;
    const toggleButton = document.getElementById('toggleDarkModeButton');
    body.classList.toggle('dark-mode');

    // Adjust the background and text colors accordingly
    if (body.classList.contains('dark-mode')) {
        body.style.backgroundColor = '#1a1a1a';
        body.style.color = '#f1f1f1';
        toggleButton.style.backgroundColor = '#6b46c1';
        toggleButton.style.color = '#f1f1f1';
    } else {
        body.style.backgroundColor = '#f1f1f1';
        body.style.color = '#1a1a1a';
        toggleButton.style.backgroundColor = '#6b46c1';
        toggleButton.style.color = '#ffffff';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // Dark mode toggle button
    const toggleButton = document.getElementById('toggleDarkModeButton');
    if (toggleButton) {
        toggleButton.addEventListener('click', toggleDarkMode);
    }

    // Check all holdings button
    const checkAllHoldingsButton = document.getElementById('checkAllHoldingsButton');
    if (checkAllHoldingsButton) {
        checkAllHoldingsButton.addEventListener('click', async function () {
            const username = document.getElementById('username').value;

            if (!username) {
                alert('Please enter your username.');
                return;
            }

            try {
                const response = await fetch(`/api/analyze?username=${username}`);
                if (!response.ok) {
                    throw new Error(`Error fetching holdings: ${response.statusText}`);
                }

                const results = await response.json();
                // Handle the results, display them, or navigate to the results page
                window.location.href = `/html/results.html?username=${username}`;
            } catch (error) {
                console.error('Error fetching holdings:', error);
                alert('An error occurred while checking your holdings.');
            }
        });
    }
});
