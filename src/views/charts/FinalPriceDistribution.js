import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import * as math from 'mathjs';
import { useSelector } from 'react-redux';
import { CCard, CCardBody } from '@coreui/react';
import "./main.css"

function FinalPriceDistribution() {
  const [finalPrices, setFinalPrices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState({});
  const [numSimulations, setNumSimulations] = useState(10000); // Default number of simulations
  const processedData = useSelector((state) => state.processedData);

  // Function to generate random normal values using Box-Muller transform
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
      // Calculate daily returns for TD
      const closingPrices = processedData.map(row => row.close).filter(price => price != null);
      const dailyReturns = closingPrices.map((price, index) => {
        if (index === 0) return null;
        return (price - closingPrices[index - 1]) / closingPrices[index - 1];
      }).filter(returnVal => returnVal != null);

      // Calculate mu (drift) and sigma (volatility)
      const mu = math.mean(dailyReturns);
      const sigma = math.std(dailyReturns);

      // Check for NaN values in mu and sigma
      if (isNaN(mu) || isNaN(sigma)) {
        throw new Error('Mu or Sigma calculation resulted in NaN');
      }

      // Run Monte Carlo simulations
      const days = 365;
      const dt = 1 / days;
      const startPrice = closingPrices[closingPrices.length - 1];
      const finalPricesArray = [];

      for (let run = 0; run < numSimulations; run++) {
        const result = stockMonteCarlo(startPrice, days, mu, sigma, dt);
        finalPricesArray.push(result[result.length - 1]);
      }

      const q = math.quantileSeq(finalPricesArray, 0.01);
      const meanFinalPrice = math.mean(finalPricesArray);

      setStatistics({
        startPrice: startPrice,
        meanFinalPrice: meanFinalPrice,
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

  const handleRunSimulation = (event) => {
    event.preventDefault();
    setIsLoading(true);
    fetchData();
  };

  if (isLoading) return <div>Loading...</div>;

  const { startPrice, meanFinalPrice, VaR, quantile } = statistics;
  return (
    <CCard className="mb-4">
      <CCardBody>
        <div>
          <h1>Final Price Distribution for TD Stock</h1>
          <form   className="simulation-form"  onSubmit={handleRunSimulation}>
            <label>
              Number of Simulations:
              <input
                type="number"
                value={numSimulations}
                onChange={(e) => setNumSimulations(parseInt(e.target.value))}
              />
            </label>
            <button type="submit">Run Simulation</button>
          </form>
          {finalPrices.length > 0 ? (
            <Plot
              data={[
                {
                  x: finalPrices,
                  type: 'histogram',
                  nbinsx: 200,
                  marker: { color: 'rgba(0, 188, 145, 0.8)'},
                  
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
                plot_bgcolor: 'rgba(0, 0, 0, 0)', // Transparent background
                paper_bgcolor: 'rgba(0, 0, 0, 0)',
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
      </CCardBody>
    </CCard>
  );
}

export default FinalPriceDistribution;
