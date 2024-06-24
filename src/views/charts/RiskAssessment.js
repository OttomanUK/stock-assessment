import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';
import * as math from 'mathjs';
import { useSelector, useDispatch } from 'react-redux'
function RiskAssessment() {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const [simulations, setSimulations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const days = 365;
  const runs = 10000;
  const td_start_price = 56.299999;

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
        setIsLoading(true);
        const response = await fetch('/TD_data.csv');
        const csvString = await response.text();
        const parsedData = Papa.parse(csvString, { header: true, dynamicTyping: true });
        console.log('Parsed Data:', parsedData);
        const tdData = parsedData.data;
        console.log(' Data:', tdData);
        const closingPrices = tdData.map(row => row['Close']);
        console.log('Closing Prices:', closingPrices);
        const dailyReturns = closingPrices.map((price, index) => {
          if (index === 0) return 0;
          return (price - closingPrices[index - 1]) / closingPrices[index - 1];
        }).slice(1);
        console.log('Daily Returns:', dailyReturns);
        const mu = math.mean(dailyReturns);
        const sigma = math.std(dailyReturns);
        console.log('Mu:', mu);
        console.log('Sigma:', sigma);
        const simulationResults = [];

        for (let run = 0; run < runs; run++) {
          simulationResults.push(stockMonteCarlo(td_start_price, days, mu, sigma));
        }
        console.log('Simulation Results:', simulationResults);

        setSimulations(simulationResults);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching or parsing data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const stockMonteCarlo = (startPrice, days, mu, sigma) => {
    let price = startPrice;

    for (let i = 0; i < days; i++) {
      const shock = generateRandomNormal(mu, sigma);
      price += price * (shock / 100);
    }

    return price;
  };

  if (isLoading) return <div>Loading...</div>;

  const meanFinalPrice = math.mean(simulations);
  const q = math.quantileSeq(simulations, 0.01);
  const var99 = td_start_price - q;

  console.log('Mean Final Price:', meanFinalPrice);
  console.log('VaR(0.99):', var99);
  console.log('q(0.99):', q);

  return (
    <div>
      <h1>Monte Carlo Simulation for  Stock</h1>
      <Plot
        data={[
          {
            x: simulations,
            type: 'histogram',
            nbinsx: 200,
            marker: { color: 'blue' },
          },
        ]}
        layout={{
          title: `Risk Assessment Stock () after ${days} days`,
          xaxis: { title: 'Final Price' },
          yaxis: { title: 'Frequency' },
          shapes: [
            {
              type: 'line',
              x0: q,
              x1: q,
              y0: 0,
              y1: Math.max(...simulations),
              line: {
                color: 'red',
                width: 2,
              },
            },
          ],
          annotations: [
            {
              x: q,
              y: Math.max(...simulations) / 2,
              text: `VaR(0.99): $${var99.toFixed(2)}`,
              showarrow: true,
              arrowhead: 2,
              ax: -40,
              ay: -40,
            },
          ],
          width: 1000,
          height: 600,
        }}
      />
      <div>
        <p>Start Price: ${td_start_price.toFixed(2)}</p>
        <p>Mean Final Price: ${meanFinalPrice.toFixed(2)}</p>
        <p>VaR(0.99): ${var99.toFixed(2)}</p>
        <p>q(0.99): ${q.toFixed(2)}</p>
      </div>
    </div>
  );
}

export default RiskAssessment;
