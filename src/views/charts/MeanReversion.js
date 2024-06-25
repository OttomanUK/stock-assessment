import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Plot from 'react-plotly.js';
import * as math from 'mathjs';
import { CCard, CCardBody } from '@coreui/react';

function MeanReversion() {
  const [simulations, setSimulations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startPrice, setStartPrice] = useState(56.299999);
  const [days, setDays] = useState(365);
  const [numSimulations, setNumSimulations] = useState(100);
  const dispatch = useDispatch();
  const processedData = useSelector((state) => state.processedData);

  function generateRandomNormal(mean, stdDev) {
    let u1 = 0,
      u2 = 0;
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
      const closingPrices = processedData
        .map((row) => row.close)
        .filter((price) => price != null);
      const dailyReturns = closingPrices.map((price, index) => {
        if (index === 0) return null;
        return (price - closingPrices[index - 1]) / closingPrices[index - 1];
      }).filter((returnVal) => returnVal != null);

      const mu = math.mean(dailyReturns);
      const sigma = math.std(dailyReturns);

      if (isNaN(mu) || isNaN(sigma)) {
        throw new Error('Mu or Sigma calculation resulted in NaN');
      }

      const dt = 1 / days;
      const mrSimulations = runSimulations(startPrice, days, mu, sigma, dt, numSimulations, meanReversion);

      setSimulations([
        { name: 'Mean Reversion', data: mrSimulations },
      ]);

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching or parsing data:', error);
      setIsLoading(false);
    }
  };

  const runSimulations = (startPrice, days, mu, sigma, dt, numSimulations, method) => {
    const simulationResults = [];
    for (let run = 0; run < numSimulations; run++) {
      const result = method(startPrice, days, mu, sigma, dt);
      simulationResults.push(result);
    }
    return simulationResults;
  };

  const meanReversion = (startPrice, days, mu, sigma, dt) => {
    const price = new Array(days).fill(0);
    price[0] = startPrice;
    const meanPrice = startPrice;
    const reversionSpeed = 0.1; // Speed of mean reversion
    for (let i = 1; i < days; i++) {
      const shock = generateRandomNormal(0, sigma * Math.sqrt(dt));
      const drift = reversionSpeed * (meanPrice - price[i - 1]) * dt;
      price[i] = price[i - 1] + (price[i - 1] * (drift + shock));
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
            <h1>Mean Reversion Monte Carlo Simulation</h1>
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
            {simulations.length > 0 && simulations.map((sim, index) => (
              <div key={index}>
                <h2>{sim.name}</h2>
                <Plot
                  data={sim.data.map((simulation, simIndex) => ({
                    x: Array.from({ length: simulation.length }, (_, i) => i + 1),
                    y: simulation,
                    type: 'scatter',
                    mode: 'lines',
                    name: `Simulation ${simIndex + 1}`,
                    marker: { color: 'blue' },
                  }))}
                  layout={{
                    title: `Monte Carlo Analysis - ${sim.name}`,
                    xaxis: { title: 'Days' },
                    yaxis: { title: 'Price' },
                    width: 1000,
                    height: 600,
                    plot_bgcolor: 'rgba(0, 0, 0, 0)', // Transparent background
                    paper_bgcolor: 'rgba(0, 0, 0, 0)',
                  }}
                />
              </div>
            ))}
          </div>
        </CCardBody>
      </CCard>
    </>
  );
}

export default MeanReversion;
