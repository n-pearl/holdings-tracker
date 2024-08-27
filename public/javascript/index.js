document.addEventListener('DOMContentLoaded', function () {
    const toggleDarkModeButton = document.getElementById('toggleDarkModeButton');

    toggleDarkModeButton.addEventListener('click', function () {
        document.body.classList.toggle('dark-mode');
    });

    const form = document.getElementById('holdingForm');
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // Your existing logic for adding/checking holdings
    });

    const checkAllHoldingsButton = document.getElementById('checkAllHoldingsButton');
    checkAllHoldingsButton.addEventListener('click', function (event) {
        event.preventDefault();
        window.location.href = '/results.html';
    });
});
