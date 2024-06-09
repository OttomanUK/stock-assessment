import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import * as math from 'mathjs';

function FinalPriceDistribution({ processedData }) {
  const [finalPrices, setFinalPrices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState({});

  // Function to generate random normal values using Box-Muller transform
  function generateRandomNormal(mean, stdDev) {
    let u1 = 0, u2 = 0;
    while (u1 === 0) u1 = Math.random(); // Converting [0,1) to (0,1)
    while (u2 === 0) u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
  }

  useEffect(() => {
    const fetchData = () => {
      try {
        // Calculate daily returns for TD
        const closingPrices = processedData.map(row => row.close).filter(price => price != null);
        const dailyReturns = closingPrices.map((price, index) => {
          if (index === 0) return null;
          return (price - closingPrices[index - 1]) / closingPrices[index - 1];
        }).filter(returnVal => returnVal != null);

        console.log('Daily Returns:', dailyReturns); // Debugging daily returns

        // Calculate mu (drift) and sigma (volatility)
        const mu = math.mean(dailyReturns);
        const sigma = math.std(dailyReturns);

        console.log('Mu (mean):', mu, 'Sigma (std dev):', sigma); // Debugging mu and sigma

        // Check for NaN values in mu and sigma
        if (isNaN(mu) || isNaN(sigma)) {
          throw new Error('Mu or Sigma calculation resulted in NaN');
        }

        // Run Monte Carlo simulations
        const days = 365;
        const dt = 1 / days;
        const startPrice = closingPrices[closingPrices.length - 1];
        const numSimulations = 10000;
        const finalPricesArray = [];

        for (let run = 0; run < numSimulations; run++) {
          const result = stockMonteCarlo(startPrice, days, mu, sigma, dt);
          finalPricesArray.push(result[result.length - 1]);
        }

        const q = math.quantileSeq(finalPricesArray, 0.01);
        const meanFinalPrice = math.mean(finalPricesArray);
        const startPriceDisplay = startPrice;

        setStatistics({
          startPrice: startPriceDisplay,
          meanFinalPrice,
          VaR: startPrice - q,
          quantile: q,
        });

        setFinalPrices(finalPricesArray);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching or parsing data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const stockMonteCarlo = (startPrice, days, mu, sigma, dt) => {
    const price = new Array(days).fill(0);
    price[0] = startPrice;

    for (let i = 1; i < days; i++) {
      const shock = generateRandomNormal(0, sigma * Math.sqrt(dt));
      const drift = mu * dt;
      if (isNaN(shock) || isNaN(drift)) {
        console.error(`NaN detected at day ${i}: Shock = ${shock}, Drift = ${drift}`);
      }
      price[i] = price[i - 1] + (price[i - 1] * (drift + shock));
      console.log(`Day ${i}: Shock = ${shock}, Drift = ${drift}, Price = ${price[i]}`); // Debugging price update
    }

    return price;
  };

  if (isLoading) return <div>Loading...</div>;

  const { startPrice, meanFinalPrice, VaR, quantile } = statistics;

  return (
    <div>
      <h1>Final Price Distribution for TD Stock</h1>
      {finalPrices.length > 0 ? (
        <Plot
          data={[
            {
              x: finalPrices,
              type: 'histogram',
              nbinsx: 200,
              marker: { color: 'blue' },
            },
          ]}
          layout={{
            title: 'Final Price Distribution for TD Stock',
            xaxis: { title: 'Final Prices' },
            yaxis: { title: 'Frequency' },
            shapes: quantile
              ? [
                  {
                    type: 'line',
                    x0: quantile,
                    x1: quantile,
                    y0: 0,
                    y1: Math.max(...finalPrices.map(() => 1)),
                    line: { color: 'red', width: 4 },
                  },
                ]
              : [],
            annotations: quantile
              ? [
                  {
                    x: quantile,
                    y: Math.max(...finalPrices.map(() => 1)),
                    xref: 'x',
                    yref: 'y',
                    text: `1% Quantile: $${quantile.toFixed(2)}`,
                    showarrow: true,
                    arrowhead: 7,
                    ax: 0,
                    ay: -40,
                  },
                ]
              : [],
            width: 1000,
            height: 600,
          }}
        />
      ) : (
        <p>No final prices available to display the distribution.</p>
      )}
      <div>
        <p>Start Price: ${startPrice.toFixed(2)}</p>
        <p>Mean Final Price: ${meanFinalPrice.toFixed(2)}</p>
        <p>VaR(0.99): ${VaR.toFixed(2)}</p>
        <p>q(0.99): ${quantile.toFixed(2)}</p>
      </div>
    </div>
  );
}

export default FinalPriceDistribution;
