import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Plot from 'react-plotly.js'
import * as math from 'mathjs';
import { CCard, CCardBody } from '@coreui/react'

function MonteCarloSimulation() {
  const [simulations, setSimulations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch()
  const processedData = useSelector((state) => state.processedData)
  // Function to generate random normal values using Box-Muller transform
  function generateRandomNormal(mean, stdDev) {
    let u1 = 0, u2 = 0;
    while (u1 === 0) u1 = Math.random(); // Converting [0,1) to (0,1)
    while (u2 === 0) u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
  }

  useEffect(() => {
    const fetchData =  () => {
      try {
        // Fetch bank returns data CSV file

        // Parse CSV data
        // Debugging parsed data

        // Calculate daily returns for TD
        const closingPrices = processedData.map(row => row.close).filter(price => price != null);
        const dailyReturns = closingPrices.map((price, index) => {
          if (index === 0) return null;
          return (price - closingPrices[index - 1]) / closingPrices[index - 1];
        }).filter(returnVal => returnVal != null);

        // console.log('Daily Returns:', dailyReturns); // Debugging daily returns

        // Calculate mu (drift) and sigma (volatility)
        const mu = math.mean(dailyReturns);
        const sigma = math.std(dailyReturns);

        // console.log('Mu (mean):', mu, 'Sigma (std dev):', sigma); // Debugging mu and sigma

        // Check for NaN values in mu and sigma
        if (isNaN(mu) || isNaN(sigma)) {
          throw new Error('Mu or Sigma calculation resulted in NaN');
        }

        // Run Monte Carlo simulations
        const days = 365;
        const dt = 1 / days;
        const startPrice = 56.299999;
        const numSimulations = 100;
        const simulationResults = [];

        for (let run = 0; run < numSimulations; run++) {
          const result = stockMonteCarlo(startPrice, days, mu, sigma, dt);
          // console.log(`Simulation ${run + 1}:`, result); // Debugging each simulation
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
  }, []);

  const stockMonteCarlo = (startPrice, days, mu, sigma, dt) => {
    const price = new Array(days).fill(0);
    price[0] = startPrice;

    for (let i = 1; i < days; i++) {
      const shock = generateRandomNormal(0, sigma * Math.sqrt(dt));
      const drift = mu * dt;
      // if (isNaN(shock) || isNaN(drift)) {
      //   console.error(`NaN detected at day ${i}: Shock = ${shock}, Drift = ${drift}`);
      // }
      price[i] = price[i - 1] + (price[i - 1] * (drift + shock));
    }

    return price;
  };

  if (isLoading) return <div>Loading...</div>;

  // if (isLoading) return <div>Loading...</div>

  return (
    <>
      <CCard className="mb-4">
        <CCardBody>
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
                  plot_bgcolor: 'rgba(0, 0, 0, 0)', // Transparent background
                  paper_bgcolor: 'rgba(0, 0, 0, 0)',
                }}
              />
            )}
          </div>
        </CCardBody>
      </CCard>
    </>
  )
}

export default MonteCarloSimulation
