document.addEventListener('DOMContentLoaded', async function () {
    try {
        const username = 'npearl'; // Replace with dynamic username if needed
        const response = await fetch(`/api/analyze?username=${username}`);
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }

        const results = await response.json();
        const resultsContainer = document.getElementById('resultsContainer');

        results.forEach(result => {
            const resultElement = document.createElement('div');
            resultElement.className = 'flex flex-wrap justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-6';

            // Create the chart container
            const chartContainer = document.createElement('div');
            chartContainer.className = 'w-1/2 p-4';
            chartContainer.innerHTML = `
                <h2 class="text-xl font-bold text-steel-800 dark:text-gray-100">${result.holding.name || result.holding.symbol}</h2>
                <canvas id="chart-${result.holding.symbol}" class="mb-4"></canvas>
            `;
            resultElement.appendChild(chartContainer);

            // Create the articles container
            const articlesContainer = document.createElement('div');
            articlesContainer.className = 'w-1/2 p-4';
            articlesContainer.innerHTML = `
                <button class="toggle-articles p-2 bg-iceberg dark:bg-gray-700 rounded-lg text-steel-800 dark:text-gray-100">
                    <span>Show Articles</span>
                    <svg class="w-6 h-6 inline-block transform rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <ul class="articles-list list-disc list-inside mt-4 hidden text-gray-700 dark:text-gray-300">
                    ${result.articles.map(article => `<li>${article.title} - Sentiment: ${article.sentiment}</li>`).join('')}
                </ul>
            `;
            resultElement.appendChild(articlesContainer);

            resultsContainer.appendChild(resultElement);

            // Add event listener to toggle articles visibility
            const toggleButton = articlesContainer.querySelector('.toggle-articles');
            const articlesList = articlesContainer.querySelector('.articles-list');
            toggleButton.addEventListener('click', () => {
                articlesList.classList.toggle('hidden');
                const icon = toggleButton.querySelector('svg');
                icon.classList.toggle('rotate-180');
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
