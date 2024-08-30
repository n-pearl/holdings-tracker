document.addEventListener('DOMContentLoaded', async function () {
    try {
        // Retrieve the holdings data from sessionStorage
        const holdingsData = JSON.parse(sessionStorage.getItem('holdingsData'));
        if (!holdingsData) {
            throw new Error('No holdings data found');
        }

        const resultsContainer = document.getElementById('resultsContainer');
        resultsContainer.innerHTML = ''; // Clear any previous content

        holdingsData.forEach(result => {
            // Create a new card for each holding
            const resultElement = document.createElement('div');
            resultElement.className = 'card';

            // Create the chart container within the card
            const chartContainer = document.createElement('div');
            chartContainer.className = 'p-4';
            chartContainer.innerHTML = `
                <h2 class="text-xl font-bold text-steel-800 dark:text-gray-100 mb-4">${result.holding.name || result.holding.symbol}</h2>
                <canvas id="chart-${result.holding.symbol}" class="mb-4"></canvas>
            `;
            resultElement.appendChild(chartContainer);

            // Create the articles container within the card
            const articlesContainer = document.createElement('div');
            articlesContainer.className = 'p-4 flex items-start';
            articlesContainer.innerHTML = `
                <button class="toggle-articles">
                    <svg class="w-4 h-4 transform rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <ul class="articles-list hidden text-gray-700 dark:text-gray-300">
                    ${result.articles.map(article => `<li>${article.title} - Sentiment: ${article.sentiment}</li>`).join('')}
                </ul>
            `;
            resultElement.appendChild(articlesContainer);

            // Append the card to the results container
            resultsContainer.appendChild(resultElement);

            // Add event listener to toggle articles visibility
            const toggleButton = articlesContainer.querySelector('.toggle-articles');
            const articlesList = articlesContainer.querySelector('.articles-list');
            toggleButton.addEventListener('click', () => {
                articlesList.classList.toggle('hidden');
                toggleButton.classList.toggle('rotate');
            });

            // Render the chart
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
