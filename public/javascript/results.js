document.addEventListener('DOMContentLoaded', async function () {
    const toggleDarkModeButton = document.getElementById('toggleDarkModeButton');
    let isDarkMode = localStorage.getItem('darkMode') === 'true';

    function updateDarkModeStyles(isDarkMode) {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            toggleDarkModeButton.textContent = 'Toggle Light Mode';
        } else {
            document.body.classList.remove('dark-mode');
            toggleDarkModeButton.textContent = 'Toggle Dark Mode';
        }
    }

    toggleDarkModeButton.addEventListener('click', function () {
        document.body.classList.toggle('dark-mode');
        isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        updateDarkModeStyles(isDarkMode);
        const holdingsData = JSON.parse(sessionStorage.getItem('holdingsData'));
        holdingsData.forEach(result => {
            renderChart(`chart-${result.holding.symbol}`, result.performanceData, isDarkMode);
        });
    });

    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
    updateDarkModeStyles(isDarkMode);

    try {
        const holdingsData = JSON.parse(sessionStorage.getItem('holdingsData'));
        if (!holdingsData) throw new Error('No holdings data found');

        const resultsContainer = document.getElementById('resultsContainer');
        resultsContainer.innerHTML = '';

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
            articlesList.style.maxHeight = '150px';
            articlesList.style.overflow = 'hidden';
            
            result.articles.forEach((article, index) => {
                const listItem = document.createElement('li');
                listItem.textContent = `${article.title} - Sentiment: ${article.sentiment}`;
                articlesList.appendChild(listItem);
                if (index >= 5) listItem.style.display = 'none';
            });
            
            let isExpanded = false;

            resultElement.appendChild(articlesList);
            resultsContainer.appendChild(resultElement);

            const toggleButton = titleContainer.querySelector('.toggle-articles');
            toggleButton.addEventListener('click', () => {
                const articleItems = articlesList.querySelectorAll('li');
                if (isExpanded) {
                    articleItems.forEach((item, index) => {
                        if (index >= 5) item.style.display = 'none';
                    });
                    articlesList.style.maxHeight = '150px';
                    resultElement.classList.remove('card-expanded');
                } else {
                    articleItems.forEach(item => item.style.display = 'list-item');
                    articlesList.style.maxHeight = 'none';
                    resultElement.classList.add('card-expanded');
                }
                isExpanded = !isExpanded;
                toggleButton.classList.toggle('rotate');
            });

            if (result.performanceData && result.performanceData.length > 0) {
                renderChart(`chart-${result.holding.symbol}`, result.performanceData, isDarkMode);
            }
        });
    } catch (error) {
        console.error('Error fetching results:', error);
        alert('An error occurred while checking your holdings. Please try refreshing the page or check your internet connection.');
    }
});

function renderChart(canvasId, performanceData, isDarkMode) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const chartColors = isDarkMode ? {
        backgroundColor: '#333333',
        textColor: '#f1f1f1',
        borderColor: '#5c6ac4'
    } : {
        backgroundColor: '#ffffff',
        textColor: '#333',
        borderColor: '#3A7CA5'
    };

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: performanceData.map(point => point.date),
            datasets: [{
                label: 'Closing Prices Over the Last 30 Days',
                data: performanceData.map(point => point.value),
                borderColor: chartColors.borderColor,
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date',
                        color: chartColors.textColor
                    },
                    ticks: {
                        color: chartColors.textColor
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Value ($)',
                        color: chartColors.textColor
                    },
                    ticks: {
                        color: chartColors.textColor
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
                },
                legend: {
                    labels: {
                        color: chartColors.textColor
                    }
                }
            },
            backgroundColor: chartColors.backgroundColor
        }
    });
}
