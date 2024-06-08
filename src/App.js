import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';
import MonteCarloSimulation from './MonteCarloSimulation';
import ExponentialMovingAverages from './ExponentialMovingAverage';
import DailyReturnAnalysis from './DailyReturnAnalysis';
import CorrelationHeatmap from './CorrelationHeatmap';
import BankReturnsScatterPlot from './BankReturnsScatterPlot';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/TD_data.csv')
      .then(response => response.text())
      .then(csvString => {
        const parsedData = Papa.parse(csvString, { header: true, dynamicTyping: true });
        let processedData = parsedData.data.map(row => ({
          date: row['Date'],
          close: row['Close'],
          volume: row['Volume'],
          ma10: row['MA for 10 days'],
          ma20: row['MA for 20 days'],
          ma50: row['MA for 50 days'],
          ma100: row['MA for 100 days'],
          ema10: row['EMA for 10 days'],
          ema20: row['EMA for 20 days'],
          ema50: row['EMA for 50 days'],
          ema100: row['EMA for 100 days'],
          dailyReturn: row['Daily Return'],
        }));
        setData(processedData);
      });
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  const dates = data.map(row => row.date);
  const closePrices = data.map(row => row.close);
  const volumes = data.map(row => row.volume);
  const ma10 = data.map(row => row.ma10);
  const ma20 = data.map(row => row.ma20);
  const ma50 = data.map(row => row.ma50);
  const ma100 = data.map(row => row.ma100);
  const ema10 = data.map(row => row.ema10);
  const ema20 = data.map(row => row.ema20);
  const ema50 = data.map(row => row.ema50);
  const ema100 = data.map(row => row.ema100);
  const dailyReturns = data.map(row => row.dailyReturn);

  return (
    <div>
      <h1>TD Stock Data</h1>

      <div>
        <h2>The closing price during past year for TD stock data</h2>
        <Plot
          data={[
            {
              x: dates,
              y: closePrices,
              type: 'scatter',
              mode: 'lines+markers',
              marker: { color: 'blue' },
            },
          ]}
          layout={{ title: 'TD Stock Closing Prices', width: 1000, height: 400 }}
        />
      </div>

      <div>
        <h2>Total volume of stock being traded each day over the past year for TD stock data</h2>
        <Plot
          data={[
            {
              x: dates,
              y: volumes,
              type: 'bar',
              marker: { color: 'orange' },
            },
          ]}
          layout={{ title: 'TD Stock Trading Volume', width: 1000, height: 400 }}
        />
      </div>

      <div>
        <h2>Different Moving Averages for TD stock data</h2>
        <Plot
          data={[
            {
              x: dates,
              y: closePrices,
              type: 'scatter',
              mode: 'lines',
              name: 'Close',
              marker: { color: 'blue' },
            },
            {
              x: dates,
              y: ma10,
              type: 'scatter',
              mode: 'lines',
              name: 'MA for 10 days',
              marker: { color: 'red' },
            },
            {
              x: dates,
              y: ma20,
              type: 'scatter',
              mode: 'lines',
              name: 'MA for 20 days',
              marker: { color: 'green' },
            },
            {
              x: dates,
              y: ma50,
              type: 'scatter',
              mode: 'lines',
              name: 'MA for 50 days',
              marker: { color: 'purple' },
            },
            {
              x: dates,
              y: ma100,
              type: 'scatter',
              mode: 'lines',
              name: 'MA for 100 days',
              marker: { color: 'orange' },
            },
          ]}
          layout={{ title: 'TD Stock Moving Averages', width: 1000, height: 400 }}
        />
      </div>

      <div>
        <h2>Different Exponential Moving Averages for TD stock data</h2>
        <Plot
          data={[
            {
              x: dates,
              y: closePrices,
              type: 'scatter',
              mode: 'lines',
              name: 'Close',
              marker: { color: 'blue' },
            },
            {
              x: dates,
              y: ema10,
              type: 'scatter',
              mode: 'lines',
              name: 'EMA for 10 days',
              marker: { color: 'red' },
            },
            {
              x: dates,
              y: ema20,
              type: 'scatter',
              mode: 'lines',
              name: 'EMA for 20 days',
              marker: { color: 'green' },
            },
            {
              x: dates,
              y: ema50,
              type: 'scatter',
              mode: 'lines',
              name: 'EMA for 50 days',
              marker: { color: 'purple' },
            },
            {
              x: dates,
              y: ema100,
              type: 'scatter',
              mode: 'lines',
              name: 'EMA for 100 days',
              marker: { color: 'orange' },
            },
          ]}
          layout={{ title: 'TD Stock Exponential Moving Averages', width: 1000, height: 400 }}
        />
      </div>

      <div>
        <h2>The daily return percentage for TD stock data</h2>
        <Plot
          data={[
            {
              x: dates,
              y: dailyReturns,
              type: 'scatter',
              mode: 'lines+markers',
              name: 'Daily Return',
              marker: { color: 'blue' },
            },
          ]}
          layout={{ title: 'TD Stock Daily Return Percentage', width: 1000, height: 400 }}
        />
        <MonteCarloSimulation/>
        <ExponentialMovingAverages/>
        <DailyReturnAnalysis/>
        <CorrelationHeatmap/>
        <BankReturnsScatterPlot/>
      </div>
    </div>
  );
}

export default App;
