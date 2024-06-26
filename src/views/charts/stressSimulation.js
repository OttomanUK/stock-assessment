import React, { useEffect, useState } from 'react';
import * as math from 'mathjs';
import { useSelector } from 'react-redux';
import { CCard, CCardBody,  } from '@coreui/react';
import "./main.css"
import Plot from 'react-plotly.js';

function StressTesting() {
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [startPrice, setStartPrice] = useState(100); // Default start price
  const [confidenceLevel, setConfidenceLevel] = useState(0.99); // Default confidence level

  const processedData = useSelector((state) => state.processedData);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const closingPrices = processedData.map(row => row.close).filter(price => price != null);
      const dailyReturns = calculateDailyReturns(closingPrices);

      const mu = math.mean(dailyReturns);
      const sigma = math.std(dailyReturns);

      if (isNaN(mu) || isNaN(sigma)) {
        throw new Error('Mu or Sigma calculation resulted in NaN');
      }

      const days = 365;
      const dt = 1 / days;
      const numSimulations = 10000;
      setStartPrice(closingPrices[closingPrices.length - 1])

      // Base simulation without stress testing
      const basePrices = runSimulation(startPrice, mu, sigma, days, dt, numSimulations);

      // Stress testing scenarios
      const stressScenarios = [
        { label: 'Financial Crisis', shock: -0.2 }, // 20% market crash
        { label: 'Tech Bubble Burst', shock: -0.15 }, // 15% market crash
      ];

      const stressTestResults = {};
      stressScenarios.forEach((scenario) => {
        const prices = runSimulation(startPrice, mu + scenario.shock, sigma, days, dt, numSimulations);
        stressTestResults[scenario.label] = prices;
      });

      // Calculate statistics for base simulation
      const qBase = math.quantileSeq(basePrices, 1 - confidenceLevel, true);
      const VaRBase = startPrice - qBase;
      const ESBase = calculateExpectedShortfall(basePrices, 1 - confidenceLevel);

      // Calculate statistics for stress scenarios
      const stressTestStatistics = {};
      Object.keys(stressTestResults).forEach((scenario) => {
        const prices = stressTestResults[scenario];
        const q = math.quantileSeq(prices, 1 - confidenceLevel, true);
        const VaR = startPrice - q;
        const ES = calculateExpectedShortfall(prices, 1 - confidenceLevel);
        stressTestStatistics[scenario] = { VaR, ES };
      });

      setStatistics({
        base: { startPrice, VaR: VaRBase, ES: ESBase },
        stressTests: stressTestStatistics,
        basePrices,
        stressTestResults,
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching or parsing data:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [processedData]);

  const handleStartPriceChange = (event) => {
    setStartPrice(parseFloat(event.target.value));
  };

  const handleConfidenceChange = (event) => {
    setConfidenceLevel(parseFloat(event.target.value));
  };

  const calculateDailyReturns = (closingPrices) => {
    return closingPrices.map((price, index) => {
      if (index === 0) return null;
      return (price - closingPrices[index - 1]) / closingPrices[index - 1];
    }).filter(returnVal => returnVal != null);
  };

  const runSimulation = (startPrice, mu, sigma, days, dt, numSimulations) => {
    const finalPricesArray = [];

    for (let i = 0; i < numSimulations; i++) {
      const prices = simulatePath(startPrice, mu, sigma, days, dt);
      finalPricesArray.push(prices[prices.length - 1]); // Capture only final price
    }

    return finalPricesArray;
  };

  const simulatePath = (startPrice, mu, sigma, days, dt) => {
    const pricePath = [startPrice];
    let currentPrice = startPrice;

    for (let day = 1; day < days; day++) {
      const drift = mu * dt;
      const shock = generateRandomNormal(0, sigma * Math.sqrt(dt));
      currentPrice = currentPrice + (currentPrice * drift) + (currentPrice * shock);
      pricePath.push(currentPrice);
    }

    return pricePath;
  };

  const generateRandomNormal = (mean, stdDev) => {
    let u1 = 0, u2 = 0;
    while (u1 === 0) u1 = Math.random();
    while (u2 === 0) u2 = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z * stdDev + mean;
  };

  const calculateExpectedShortfall = (prices, quantile) => {
    const sortedPrices = prices.slice().sort((a, b) => a - b);
    const index = Math.floor(quantile * sortedPrices.length);
    const tailReturns = sortedPrices.slice(0, index);
    const ES = math.mean(tailReturns);
    return ES;
  };

  const handleRunSimulation = () => {
    fetchData();
  };

  if (isLoading) return <div>Loading...</div>;

  if (!statistics) return null;

  const { base, stressTests, basePrices, stressTestResults } = statistics;

  return (
    <CCard className="mb-4">
      <CCardBody>
        <h1>Advanced Stochastic Modeling and Multi-Scenario Risk Analysis</h1>
        
        {/* Input fields for start price and confidence level */}
        <form   className="simulation-form"  onSubmit={handleRunSimulation}>
          
        <div>
          <label>Start Price:</label>{' '}
          <input
            type="number"
            value={startPrice}
            onChange={handleStartPriceChange}
            step="0.01"
            min="0"
            />
        </div>
        <div>
          <label>Confidence Level:</label>{' '}
          <input
            type="number"
            value={confidenceLevel}
            onChange={handleConfidenceChange}
            step="0.01"
            min="0"
            max="1"
            />
        </div>
        
        {/* Run Simulation button */}
        < button color="primary" onClick={handleRunSimulation}>Run Simulation</button >

        {/* Display statistics and plots */}
            </form>
        <div>
          <h2>Baseline Market Dynamics Projection</h2>
          <p>Initial Asset Valuation: ${base.startPrice.toFixed(2)}</p>
          <p>Value at Risk ({(confidenceLevel * 100).toFixed(0)}% Confidence): ${base.VaR.toFixed(2)}</p>
          <p>Expected Shortfall ({(confidenceLevel * 100).toFixed(0)}% Threshold): ${base.ES.toFixed(2)}</p>
          <Plot
            data={[
              {
                x: basePrices,
                type: 'histogram',
                nbinsx: 30,
                marker: { color: 'rgba(0, 188, 145, 0.8)' },
              },
            ]}
            layout={{
              title: 'Probabilistic Distribution of Asset Valuations - Baseline Scenario',
              xaxis: { title: 'Projected Asset Values' },
              yaxis: { title: 'Frequency' },
              width: 800,
              height: 500,
              margin: { t: 50, r: 50, l: 50, b: 50 },
            }}
          />
        </div>

        <div>
          <h2>Stress-Induced Market Volatility Simulations</h2>
          {Object.entries(stressTests).map(([scenario, data]) => (
            <div key={scenario}>
              <h3>{scenario === 'Financial Crisis' ? 'Global Economic Downturn Scenario' : 'Technology Sector Correction Scenario'}</h3>
              <p>Value at Risk ({(confidenceLevel * 100).toFixed(0)}% Confidence): ${data.VaR.toFixed(2)}</p>
              <p>Expected Shortfall ({(confidenceLevel * 100).toFixed(0)}% Threshold): ${data.ES.toFixed(2)}</p>
              <Plot
                data={[
                  {
                    x: stressTestResults[scenario],
                    type: 'histogram',
                    nbinsx: 30,
                    marker: { color: 'rgba(0, 188, 145, 0.8)' },
                  },
                ]}
                layout={{
                  title: `Probabilistic Distribution of Asset Valuations - ${scenario === 'Financial Crisis' ? 'Economic Downturn' : 'Tech Sector Correction'}`,
                  xaxis: { title: 'Projected Asset Values' },
                  yaxis: { title: 'Frequency' },
                  width: 800,
                  height: 500,
                  margin: { t: 50, r: 50, l: 50, b: 50 },
                }}
              />
            </div>
          ))}
        </div>
      </CCardBody>
    </CCard>
  );
}

export default StressTesting;
