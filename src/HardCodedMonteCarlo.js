import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';
import * as math from 'mathjs';

function MonteCarloSimulation() {
  const [simulations, setSimulations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to generate random normal values using Box-Muller transform
  function generateRandomNormal(mean, stdDev) {
    let u1 = 0, u2 = 0;
    while (u1 === 0) u1 = Math.random(); // Converting [0,1) to (0,1)
    while (u2 === 0) u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch bank returns data CSV file
        const response = await fetch('/TD_data.csv');
        const csvString = await response.text();

        // Parse CSV data
        const parsedData = Papa.parse(csvString, { header: true, dynamicTyping: true });
        const tdData = parsedData.data;

        // Calculate daily returns for TD
        const closingPrices = tdData.map(row => row['Close']);
        const dailyReturns = closingPrices.map((price, index) => {
          if (index === 0) return 0;
          return (price - closingPrices[index - 1]) / closingPrices[index - 1];
        }).slice(1);

        // Calculate mu (drift) and sigma (volatility)
        const mu = math.mean(dailyReturns);
        const sigma = math.std(dailyReturns);

        // Run Monte Carlo simulations
        const days = 365;
        const dt = 1 / days;
        const startPrice = 56.299999;
        const numSimulations = 100;
        const simulationResults = [];

        for (let run = 0; run < numSimulations; run++) {
          simulationResults.push(stockMonteCarlo(startPrice, days, mu, sigma, dt));
        }

        setSimulations(simulationResults);
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
      const shock = generateRandomNormal(mu * dt, sigma * Math.sqrt(dt));
      const drift = mu * dt;
      price[i] = price[i - 1] + (price[i - 1] * (drift + shock));
    }

    return price;
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Monte Carlo Simulation for TD Stock</h1>
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
