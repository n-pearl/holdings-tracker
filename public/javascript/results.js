document.addEventListener('DOMContentLoaded', async function () {
    const toggleDarkModeButton = document.getElementById('toggleDarkModeButton');

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

    // The rest of your existing logic to load holdings...
    try {
        const holdingsData = JSON.parse(sessionStorage.getItem('holdingsData'));
        if (!holdingsData) throw new Error('No holdings data found');

        const resultsContainer = document.getElementById('resultsContainer');
        resultsContainer.innerHTML = ''; // Clear any previous content

        holdingsData.forEach(result => {
            const resultElement = document.createElement('div');
            resultElement.className = 'card';

            const titleContainer = document.createElement('div');
            titleContainer.className = 'chart-title';
            titleContainer.innerHTML = `
                <h2>${result.holding.name || result.holding.symbol}</h2>
                <button class="toggle-articles">
                    <svg class="w-4 h-4 transform rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
            `;
            resultElement.appendChild(titleContainer);

            const chartContainer = document.createElement('div');
            chartContainer.className = 'chart-container';
            chartContainer.innerHTML = `
                <canvas id="chart-${result.holding.symbol}" class="mb-4"></canvas>
            `;
            resultElement.appendChild(chartContainer);

            const articlesList = document.createElement('ul');
            articlesList.className = 'articles-list text-gray-700 dark:text-gray-300';
            articlesList.style.maxHeight = '150px'; // Default max height for collapsed state
            articlesList.style.overflow = 'hidden'; // Hide overflow for collapsed state
            
            // Render all articles, but only show first 5 initially
            result.articles.forEach((article, index) => {
                const listItem = document.createElement('li');
                listItem.textContent = `${article.title} - Sentiment: ${article.sentiment}`;
                articlesList.appendChild(listItem);
                if (index >= 5) listItem.style.display = 'none'; // Hide articles beyond the first 5
            });
            
            // Keep track of whether the list is expanded
            let isExpanded = false;

            resultElement.appendChild(articlesList);
            resultsContainer.appendChild(resultElement);

            const toggleButton = titleContainer.querySelector('.toggle-articles');
            toggleButton.addEventListener('click', () => {
                const articleItems = articlesList.querySelectorAll('li');
                if (isExpanded) {
                    // Collapse to the first 5 articles
                    articleItems.forEach((item, index) => {
                        if (index >= 5) item.style.display = 'none';
                    });
                    articlesList.style.maxHeight = '150px'; // Set to default height
                    resultElement.classList.remove('card-expanded'); // Remove expanded class
                } else {
                    // Expand to show all articles
                    articleItems.forEach(item => item.style.display = 'list-item');
                    articlesList.style.maxHeight = 'none'; // Remove max height to expand
                    resultElement.classList.add('card-expanded'); // Add expanded class
                }
                isExpanded = !isExpanded;
                toggleButton.classList.toggle('rotate');
            });

            if (result.performanceData && result.performanceData.length > 0) {
                renderChart(`chart-${result.holding.symbol}`, result.performanceData);
            }
        });
    } catch (error) {
        console.error('Error fetching results:', error);
        alert('An error occurred while checking your holdings.');
    }
});

function renderChart(canvasId, performanceData) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: performanceData.map(point => point.date),
            datasets: [{
                label: 'Closing Prices Over the Last 30 Days',
                data: performanceData.map(point => point.value),
                borderColor: '#3A7CA5',
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Value ($)'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            return `Closing: $${tooltipItem.raw.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}
