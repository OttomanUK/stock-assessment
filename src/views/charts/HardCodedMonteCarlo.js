import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';
import * as math from 'mathjs';

function MonteCarloSimulation({ processedData }) {
  const [simulations, setSimulations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [numSimulations, setNumSimulations] = useState(100);
  const [numDays, setNumDays] = useState(365);
  const [startPrice, setStartPrice] = useState(56.299999);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'numSimulations') {
      setNumSimulations(value);
    } else if (name === 'numDays') {
      setNumDays(value);
    } else if (name === 'startPrice') {
      setStartPrice(value);
    }
  };

  // Function to generate random normal values using Box-Muller transform
  function generateRandomNormal(mean, stdDev) {
    let u1 = 0,
      u2 = 0;
    while (u1 === 0) u1 = Math.random(); // Converting [0,1) to (0,1)
    while (u2 === 0) u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace with your data fetching logic, e.g., fetching CSV data
        // const response = await fetch('your_data.csv');
        // const csvData = await response.text();
        // const parsedData = Papa.parse(csvData, { header: true }).data;

        // For demonstration, calculating daily returns from processedData
        const closingPrices = processedData.map((row) => row.close).filter((price) => price != null);
        const dailyReturns = closingPrices.map((price, index) => {
          if (index === 0) return null;
          return (price - closingPrices[index - 1]) / closingPrices[index - 1];
        }).filter((returnVal) => returnVal != null);

        const mu = math.mean(dailyReturns);
        const sigma = math.std(dailyReturns);

        if (isNaN(mu) || isNaN(sigma)) {
          throw new Error('Mu or Sigma calculation resulted in NaN');
        }

        const dt = 1 / numDays;
        const simulationResults = [];

        for (let run = 0; run < numSimulations; run++) {
          const result = stockMonteCarlo(parseFloat(startPrice), numDays, mu, sigma, dt);
          simulationResults.push(result);
        }

        setSimulations(simulationResults);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching or parsing data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [numSimulations, numDays, startPrice]);

  const stockMonteCarlo = (startPrice, days, mu, sigma, dt) => {
    const price = new Array(days).fill(0);
    price[0] = startPrice;

    for (let i = 1; i < days; i++) {
      const shock = generateRandomNormal(0, sigma * Math.sqrt(dt));
      const drift = mu * dt;
      price[i] = price[i - 1] + (price[i - 1] * (drift + shock));
    }

    return price;
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Monte Carlo Simulation for TD Stock</h1>
      <div>
        <label>
          Number of Simulations:{' '}
          <input
            type="number"
            name="numSimulations"
            value={numSimulations}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Number of Days:{' '}
          <input type="number" name="numDays" value={numDays} onChange={handleInputChange} />
        </label>
        <label>
          Starting Price:{' '}
          <input
            type="number"
            step="0.01"
            name="startPrice"
            value={startPrice}
            onChange={handleInputChange}
          />
        </label>
      </div>
      {simulations.length > 0 && (
        <Plot
          data={simulations.map((sim, index) => ({
            x: Array.from({ length: sim.length }, (_, i) => i + 1),
            y: sim,
            type: 'scatter',
            mode: 'lines',
            name: `Simulation ${index + 1}`,
            marker: { color: 'blue' },
          }))}
          layout={{
            title: 'Monte Carlo Analysis for TD Stock',
            xaxis: { title: 'Days' },
            yaxis: { title: 'Price' },
            width: 1000,
            height: 600,
          }}
        />
      )}
    </div>
  );
}

export default MonteCarloSimulation;
