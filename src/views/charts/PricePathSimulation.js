import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import * as math from 'mathjs';
import { useSelector } from 'react-redux';
import { CCard, CCardBody } from '@coreui/react';

const PortfolioOptimization = () => {
  const [portfolioReturns, setPortfolioReturns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const processedData = useSelector((state) => state.processedData);

  // Function to simulate portfolio returns using Monte Carlo
  const simulatePortfolioReturns = (processedData, mu, sigma, days) => {
    const closingPrices = processedData.map(entry => entry.close).filter(price => price !== null);
    let portfolioValue = 1; // Start with initial portfolio value of 1
    for (let i = 0; i < days; i++) {
      const shock = randn_bm() * sigma;
      const drift = mu;
      portfolioValue *= (1 + (drift + shock));
    }
    const portfolioReturn = portfolioValue - 1; // Calculate portfolio return
    return portfolioReturn;
  };

  // Function to generate random normal values using Box-Muller transform
  const randn_bm = () => {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) return randn_bm(); // Resample between 0 and 1
    return num;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Filter out null closing prices and calculate daily returns
        const closingPrices = processedData.map(entry => entry.close);

        const returns = closingPrices.map((price, index) => {
          if (index === 0) return null;
          return (price - closingPrices[index - 1]) / closingPrices[index - 1];
        }).filter(returnVal => returnVal !== null);

        // Calculate mu (mean) and sigma (standard deviation)
        const mu = math.mean(returns);
        const sigma = math.std(returns);

        if (isNaN(mu) || isNaN(sigma)) {
          throw new Error('Mu or Sigma calculation resulted in NaN');
        }

        const days = 30; // Simulation period
        const numSimulations = 1000;

        // Simulate portfolio returns using Monte Carlo
        const portfolioReturns = [];
        for (let i = 0; i < numSimulations; i++) {
          const simulatedReturns = simulatePortfolioReturns(processedData, mu, sigma, days);
          portfolioReturns.push(simulatedReturns);
        }

        setPortfolioReturns(portfolioReturns);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching or parsing data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [processedData]);

  if (isLoading) return <div>Loading...</div>;

  // Calculate portfolio metrics
  const meanReturn = portfolioReturns.length > 0 ? math.mean(portfolioReturns) : 0;
  const stdDev = portfolioReturns.length > 0 ? math.std(portfolioReturns) : 0;
  const maxReturn = portfolioReturns.length > 0 ? Math.max(...portfolioReturns) : 0;
  const minReturn = portfolioReturns.length > 0 ? Math.min(...portfolioReturns) : 0;

  return (
    <CCard className="mb-4">
      <CCardBody>
        <div>
          <h1>Portfolio Optimization using Monte Carlo Simulation</h1>

          {/* Histogram of Portfolio Returns */}
          <Plot
            data={[
              {
                x: portfolioReturns,
                type: 'histogram',
                nbinsx: 30,
                marker: { color: 'purple' },
              },
            ]}
            layout={{
              title: 'Distribution of Portfolio Returns',
              xaxis: { title: 'Portfolio Returns' },
              yaxis: { title: 'Frequency' },
              width: 600,
              height: 400,
            }}
          />

          {/* Portfolio Metrics */}
          <div style={{ marginTop: '20px' }}>
            <p>Mean Return: {meanReturn.toFixed(4)}</p>
            <p>Standard Deviation: {stdDev.toFixed(4)}</p>
            <p>Max Return: {maxReturn.toFixed(4)}</p>
            <p>Min Return: {minReturn.toFixed(4)}</p>
          </div>
        </div>
      </CCardBody>
    </CCard>
  );
};

export default PortfolioOptimization;
