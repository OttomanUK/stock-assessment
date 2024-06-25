import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { CCard, CCardBody } from '@coreui/react';
import { useSelector, useDispatch } from 'react-redux';

function MonteCarloSimulation() {
  const dispatch = useDispatch();
  const unfoldable = useSelector((state) => state.sidebarUnfoldable);
  const [startPrice, setStartPrice] = useState(56.299999);
  const [days, setDays] = useState(100);
  const [mu, setMu] = useState(0.1);
  const [sigma, setSigma] = useState(0.2);
  const [simulationData, setSimulationData] = useState([]);

  const monteCarloSimulation = (startPrice, days, mu, sigma) => {
    const dt = 1;
    let price = Array(days).fill(0);
    price[0] = startPrice;

    for (let x = 1; x < days; x++) {
      const shock = Math.random() * sigma * Math.sqrt(dt);
      const drift = mu * dt;
      price[x] = price[x - 1] + price[x - 1] * (drift + shock);
    }

    return price;
  };

  const runSimulation = (event) => {
    event.preventDefault(); // Prevent form submission and page reload
    const simulatedPrices = monteCarloSimulation(startPrice, days, mu, sigma);
    setSimulationData(simulatedPrices);
  };

  return (
    <>
      <CCard className="mb-4">
        <CCardBody>
          <div>
            <h1>Monte Carlo Simulation for Stock</h1>
            <form onSubmit={(event) => runSimulation(event)}>
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
                Mu:
                <input
                  type="number"
                  value={mu}
                  onChange={(e) => setMu(parseFloat(e.target.value))}
                />
              </label>
              <br />
              <label>
                Sigma:
                <input
                  type="number"
                  value={sigma}
                  onChange={(e) => setSigma(parseFloat(e.target.value))}
                />
              </label>
              <br />
              <button type="submit">Run Simulation</button>
            </form>
            <div>
              {simulationData.length > 0 && (
                <Plot
                  data={[
                    {
                      x: Array.from({ length: simulationData.length }, (_, i) => i + 1),
                      y: simulationData,
                      type: 'scatter',
                      mode: 'lines',
                      marker: { color: 'blue' },
                    },
                  ]}
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
