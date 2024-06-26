import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { CCard, CCardBody } from '@coreui/react';
import { useSelector, useDispatch } from 'react-redux';
import './main.css'; // Import the CSS file

function MonteCarloSimulation() {
  const dispatch = useDispatch();
  const unfoldable = useSelector((state) => state.sidebarUnfoldable);
  const [startPrice, setStartPrice] = useState(56.299999);
  const [days, setDays] = useState(100);
  const [mu, setMu] = useState(0.1);
  const [sigma, setSigma] = useState(0.2);
  const [numSimulations, setNumSimulations] = useState(5);
  const [simulationData, setSimulationData] = useState([]);

  const monteCarloSimulation = (startPrice, days, mu, sigma) => {
    const dt = 1;
    let price = Array(days).fill(0);
    price[0] = startPrice;

    for (let x = 1; x < days; x++) {
      const shock = (Math.random() - 0.5) * 2 * sigma * Math.sqrt(dt);
      const drift = mu * dt;
      price[x] = price[x - 1] + price[x - 1] * (drift + shock);
    }

    return price;
  };

  const runSimulation = (event) => {
    event.preventDefault();
    let simulations = [];
    for (let i = 0; i < numSimulations; i++) {
      simulations.push(monteCarloSimulation(startPrice, days, mu, sigma));
    }
    setSimulationData(simulations);
  };

  const colors = ['blue', 'red', 'green', 'orange', 'purple'];

  return (
    <>
      <CCard className="mb-4">
        <CCardBody>
          <div>
            <h1>Monte Carlo Simulation for Stock</h1>
            <form className="simulation-form" onSubmit={(event) => runSimulation(event)}>
            <div>
              <label>
                Starting Stock Price:
                <input
                  type="number"
                  value={startPrice}
                  onChange={(e) => setStartPrice(parseFloat(e.target.value))}
                />
              </label>
            </div>
            <div>
              <label>
                Days of Simulation:
                <input
                  type="number"
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value))}
                  />
              </label>
                  </div>
                  <div>
              <label>
                Mu:
                <input
                  type="number"
                  value={mu}
                  onChange={(e) => setMu(parseFloat(e.target.value))}
                  />
              </label>
                  </div>
                  <div>
              <label>
                Sigma:
                <input
                  type="number"
                  value={sigma}
                  onChange={(e) => setSigma(parseFloat(e.target.value))}
                  />
              </label>
                  </div>
                  <div>
              <label>
                Number of Simulations:
                <input
                  type="number"
                  value={numSimulations}
                  onChange={(e) => setNumSimulations(parseInt(e.target.value))}
                  />
              </label>
                  </div>
              <button type="submit">Run Simulation</button>
            </form>
            <div>
              {simulationData.length > 0 && (
                <Plot
                  data={simulationData.map((simulation, index) => ({
                    x: Array.from({ length: simulation.length }, (_, i) => i + 1),
                    y: simulation,
                    type: 'scatter',
                    mode: 'lines',
                    marker: { color: colors[index % colors.length] },
                  }))}
                  layout={{
                    title: 'Monte Carlo Simulation for Stock',
                    width: 1000,
                    height: 400,
                    plot_bgcolor: 'rgba(0, 0, 0, 0)', // Transparent background
                    paper_bgcolor: 'rgba(0, 0, 0, 0)',
                    xaxis: { title: 'Days' },
                    yaxis: { title: 'Price' },
                  }}
                />
              )}
            </div>
          </div>
        </CCardBody>
      </CCard>
    </>
  );
}

export default MonteCarloSimulation;
