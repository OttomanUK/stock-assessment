import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';
import MonteCarloSimulation from './MonteCarloSimulation';
import HardCodedMonteCarlo from './HardCodedMonteCarlo';
import ExponentialMovingAverages from './ExponentialMovingAverage';
import DailyReturnAnalysis from './DailyReturnAnalysis';
import CorrelationHeatmap from './CorrelationHeatmap';
import BankReturnsScatterPlot from './BankReturnsScatterPlot';
import DailyReturnHistogram from './DailyReturnHistogram';

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const baseStyle = {
    border: "2px dashed #cccccc",
    borderRadius: "5px",
    padding: "20px",
    transition: "border .3s ease-in-out",
  };

  const activeStyle = {
    border: "2px dashed #0000ff",
  };

  const handleFileUpload = (files) => {
    const file = files[0];
    if (file && file.type === "text/csv") {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: (result) => {
          let processedData = result.data.map((row) => ({
            date: row["Date"],
            open: row["Open"],
            close: row["Close"],
            volume: row["Volume"],
            high: row["High"],
            lo: row["Low"],
            ma10: row["MA for 10 days"],
            ma20: row["MA for 20 days"],
            ma50: row["MA for 50 days"],
            ma100: row["MA for 100 days"],
            ema10: row["EMA for 10 days"],
            ema20: row["EMA for 20 days"],
            ema50: row["EMA for 50 days"],
            ema100: row["EMA for 100 days"],
            dailyReturn: row["Daily Return"],
          }));
          setData(processedData);
        },
      });
      setError("");
    } else {
      setError("Please upload a valid CSV file.");
    }
  };

  if (!data) {
    return (
      <div>
        <h1>TD Stock Data</h1>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <Dropzone onDrop={(acceptedFiles) => handleFileUpload(acceptedFiles)}>
          {({ getRootProps, getInputProps, isDragActive }) => {
            const style = isDragActive
              ? { ...baseStyle, ...activeStyle }
              : baseStyle;
            return (
              <section>
                <div {...getRootProps({style})}>
                  <input {...getInputProps()} accept=".csv" />
                  {isDragActive ? (
                    <p>Dropping files</p>
                  ) : (
                    <p>Drag and drop csv here, or click to select files</p>
                  )}
                </div>
              </section>
            );
          }}
        </Dropzone>
      </div>
    );
  }

  const dates = data.map((row) => row.date);
  const closePrices = data.map((row) => row.close);
  const openPrices = data.map((row) => row.open);
  const volumes = data.map((row) => row.volume);
  const highs = data.map((row) => row.high);
  const lows = data.map((row) => row.low);
  const ma10 = data.map((row) => row.ma10);
  const ma20 = data.map((row) => row.ma20);
  const ma50 = data.map((row) => row.ma50);
  const ma100 = data.map((row) => row.ma100);
  const ema10 = data.map((row) => row.ema10);
  const ema20 = data.map((row) => row.ema20);
  const ema50 = data.map((row) => row.ema50);
  const ema100 = data.map((row) => row.ema100);
  const dailyReturns = data.map((row) => row.dailyReturn);

  return (
    <div>
      <h1>Stock Data</h1>
      <div>
        <h2>The closing price during past year for stock data</h2>
        <Plot
          data={[
            {
              x: dates,
              y: closePrices,
              type: "scatter",
              mode: "lines+markers",
              marker: { color: "blue" },
            },
          ]}
          layout={{ title: "Stock Closing Prices", width: 1000, height: 400 }}
        />
      </div>
      <div>
        <h2>
          Total volume of stock being traded each day over the past year for
          stock data
        </h2>
        <Plot
          data={[
            {
              x: dates,
              y: volumes,
              type: "bar",
              marker: { color: "orange" },
            },
          ]}
          layout={{ title: "Stock Trading Volume", width: 1000, height: 400 }}
        />
      </div>
      <div>
        <h2>Different Moving Averages for stock data</h2>
        <Plot
          data={[
            {
              x: dates,
              y: closePrices,
              type: "scatter",
              mode: "lines",
              name: "Close",
              marker: { color: "blue" },
            },
            {
              x: dates,
              y: ma10,
              type: "scatter",
              mode: "lines",
              name: "MA for 10 days",
              marker: { color: "red" },
            },
            {
              x: dates,
              y: ma20,
              type: "scatter",
              mode: "lines",
              name: "MA for 20 days",
              marker: { color: "green" },
            },
            {
              x: dates,
              y: ma50,
              type: "scatter",
              mode: "lines",
              name: "MA for 50 days",
              marker: { color: "purple" },
            },
            {
              x: dates,
              y: ma100,
              type: "scatter",
              mode: "lines",
              name: "MA for 100 days",
              marker: { color: "orange" },
            },
          ]}
          layout={{ title: "Stock Moving Averages", width: 1000, height: 400 }}
        />
      </div>
      <div>
        <h2>Different Exponential Moving Averages for stock data</h2>
        <Plot
          data={[
            {
              x: dates,
              y: closePrices,
              type: "scatter",
              mode: "lines",
              name: "Close",
              marker: { color: "blue" },
            },
            {
              x: dates,
              y: ema10,
              type: "scatter",
              mode: "lines",
              name: "EMA for 10 days",
              marker: { color: "red" },
            },
            {
              x: dates,
              y: ema20,
              type: "scatter",
              mode: "lines",
              name: "EMA for 20 days",
              marker: { color: "green" },
            },
            {
              x: dates,
              y: ema50,
              type: "scatter",
              mode: "lines",
              name: "EMA for 50 days",
              marker: { color: "purple" },
            },
            {
              x: dates,
              y: ema100,
              type: "scatter",
              mode: "lines",
              name: "EMA for 100 days",
              marker: { color: "orange" },
            },
          ]}
          layout={{
            title: "Stock Exponential Moving Averages",
            width: 1000,
            height: 400,
          }}
        />
      </div>
      <div>
        <h2>The daily return percentage for stock data</h2>
        <Plot
          data={[
            {
              x: dates,
              y: dailyReturns,
              type: "scatter",
              mode: "lines+markers",
              name: "Daily Return",
              marker: { color: "blue" },
            },
          ]}
          layout={{
            title: "Stock Daily Return Percentage",
            width: 1000,
            height: 400,
          }}
        />
        <MonteCarloSimulation />
        <ExponentialMovingAverages processedData={data} />
        <DailyReturnAnalysis processedData={data} />
        <CorrelationHeatmap />
        <HardCodedMonteCarlo processedData={data}/>
        <BankReturnsScatterPlot  processedData={data}/>
        <DailyReturnHistogram processedData={data}/>
      </div>
    </div>
  );
}

export default App;
