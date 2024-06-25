import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Plot from 'react-plotly.js';
import * as math from 'mathjs';
import { CCard, CCardBody } from '@coreui/react';

function Bootstrap() {
  const [simulations, setSimulations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startPrice, setStartPrice] = useState(56.299999);
  const [days, setDays] = useState(365);
  const [numSimulations, setNumSimulations] = useState(100);
  const processedData = useSelector((state) => state.processedData);

  function generateRandomNormal(mean, stdDev) {
    let u1 = 0, u2 = 0;
    while (u1 === 0) u1 = Math.random(); // Converting [0,1) to (0,1)
    while (u2 === 0) u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
  }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    try {
      const dailyReturns = processedData.map(row => row.close).filter(price => price != null);
      const mu = math.mean(dailyReturns);
      const sigma = math.std(dailyReturns);

      if (isNaN(mu) || isNaN(sigma)) {
        throw new Error('Mu or Sigma calculation resulted in NaN');
      }

      const dt = 1 / days;
      const simulationResults = [];

      for (let run = 0; run < numSimulations; run++) {
        const result = bootstrap(startPrice, days);
        simulationResults.push(result);
      }

      setSimulations(simulationResults);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching or parsing data:', error);
      setIsLoading(false);
    }
  };

  const bootstrap = (startPrice, days) => {
    const price = new Array(days).fill(0);
    price[0] = startPrice;
    const returns = processedData.map(row => row.close).filter(price => price != null);
    for (let i = 1; i < days; i++) {
      const randomReturn = returns[Math.floor(Math.random() * returns.length)];
      price[i] = price[i - 1] * (1 + randomReturn);
    }
    return price;
  };

  const handleRunSimulation = (event) => {
    event.preventDefault();
    setIsLoading(true);
    fetchData();
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <CCard className="mb-4">
        <CCardBody>
          <div>
            <h1>Monte Carlo Simulation for Stock</h1>
            <form onSubmit={handleRunSimulation}>
              <label>
                Starting Stock Price:
                <input
                  type="number"
                  value={startPrice}
                  onChange={(e) => setStartPrice(parseFloat(e.target.value))}
                />
              </label>
              <br />
              <label>
                Days of Simulation:
                <input
                  type="number"
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value))}
                />
              </label>
              <br />
              <label>
                Number of Simulations:
                <input
                  type="number"
                  value={numSimulations}
                  onChange={(e) => setNumSimulations(parseInt(e.target.value))}
                />
              </label>
              <br />
              <button type="submit">Run Simulation</button>
            </form>
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
                  title: 'Monte Carlo Analysis - Bootstrap',
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
  );
}

export default Bootstrap;
