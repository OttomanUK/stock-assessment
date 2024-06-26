import React, { useState } from 'react'
import Plot from 'react-plotly.js'
import Papa from 'papaparse'
import MonteCarloSimulation from './MonteCarloSimulation'
import HardCodedMonteCarlo from './HardCodedMonteCarlo'
import { useSelector, useDispatch } from 'react-redux'
import ExponentialMovingAverages from './ExponentialMovingAverage'
import DailyReturnAnalysis from './DailyReturnAnalysis'
import CorrelationHeatmap from './CorrelationHeatmap'
import BankReturnsScatterPlot from './BankReturnsScatterPlot'
import DailyReturnHistogram from './DailyReturnHistogram'
import Dropzone from 'react-dropzone'
import FinalPriceDistribution from './FinalPriceDistribution'
function MiscellaneousGraphs() {
  const [error, setError] = useState('')
  const dispatch = useDispatch()
  const processedData = useSelector((state) => state.processedData)

  const baseStyle = {
    border: '2px dashed #cccccc',
    borderRadius: '5px',
    padding: '20px',
    transition: 'border .3s ease-in-out',
  }

  const activeStyle = {
    border: '2px dashed #0000ff',
  }

  const handleFileUpload = (files) => {
    const file = files[0]
    if (file && file.type === 'text/csv') {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: (result) => {
          let processedData1 = result.data.map((row) => ({
            date: row['Date'],
            open: row['Open'],
            close: row['Close'],
            volume: row['Volume'],
            high: row['High'],
            lo: row['Low'],
            ma10: row['MA for 10 days'],
            ma20: row['MA for 20 days'],
            ma50: row['MA for 50 days'],
            ma100: row['MA for 100 days'],
            ema10: row['EMA for 10 days'],
            ema20: row['EMA for 20 days'],
            ema50: row['EMA for 50 days'],
            ema100: row['EMA for 100 days'],
            dailyReturn: row['Daily Return'],
          }))
          console.log('uess')
          dispatch({ type: 'set', processedData: processedData1 })
        },
      })
      setError('')
    } else {
      setError('Please upload a valid CSV file.')
    }
  }

  if (!processedData) {
    return (
      <div>
        <h1>Stock Data</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <Dropzone onDrop={(acceptedFiles) => handleFileUpload(acceptedFiles)}>
          {({ getRootProps, getInputProps, isDragActive }) => {
            const style = isDragActive ? { ...baseStyle, ...activeStyle } : baseStyle
            return (
              <section>
                <div {...getRootProps({ style })}>
                  <input {...getInputProps()} accept=".csv" />
                  {isDragActive ? (
                    <p>Dropping files</p>
                  ) : (
                    <p>Drag and drop csv here, or click to select files</p>
                  )}
                </div>
              </section>
            )
          }}
        </Dropzone>
      </div>
    )
  }

  const dates = processedData.map((row) => row.date)
  const closePrices = processedData.map((row) => row.close)
  const openPrices = processedData.map((row) => row.open)
  const volumes = processedData.map((row) => row.volume)
  const highs = processedData.map((row) => row.high)
  const lows = processedData.map((row) => row.low)
  const ma10 = processedData.map((row) => row.ma10)
  const ma20 = processedData.map((row) => row.ma20)
  const ma50 = processedData.map((row) => row.ma50)
  const ma100 = processedData.map((row) => row.ma100)
  const ema10 = processedData.map((row) => row.ema10)
  const ema20 = processedData.map((row) => row.ema20)
  const ema50 = processedData.map((row) => row.ema50)
  const ema100 = processedData.map((row) => row.ema100)
  const dailyReturns = processedData.map((row) => row.dailyReturn)

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
              type: 'scatter',
              mode: 'lines+markers',
              marker: { color: 'blue' },
            },
          ]}
          layout={{
            title: 'Stock Closing Prices',
            width: 1000,
            height: 400,
            xaxis: { title: 'Date' },
            yaxis: { title: 'Closing Prices' },
            plot_bgcolor: 'rgba(0, 0, 0, 0)', // Transparent background
            paper_bgcolor: 'rgba(0, 0, 0, 0)',
          }}
        />
      </div>
      <div>
        <h2>Total volume of stock being traded each day over the past year for stock data</h2>
        <Plot
          data={[
            {
              x: dates,
              y: volumes,
              type: 'bar',
              marker: { color: 'orange' },
            },
          ]}
          layout={{
            title: 'Stock Trading Volume',
            xaxis: { title: 'Date' },
            yaxis: { title: 'Volume of Stock' },
            width: 1000,
            height: 400,
            plot_bgcolor: 'rgba(0, 0, 0, 0)', // Transparent background
            paper_bgcolor: 'rgba(0, 0, 0, 0)',
          }}
        />
      </div>
      <div>
        <h2>Different Moving Averages for stock data</h2>
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
          layout={{
            title: 'Stock Moving Averages',
            xaxis: { title: 'Date' },
            yaxis: { title: 'Moving Average' },
            width: 1000,
            height: 400,
            plot_bgcolor: 'rgba(0, 0, 0, 0)', // Transparent background
            paper_bgcolor: 'rgba(0, 0, 0, 0)',
          }}
        />
      </div>
      <ExponentialMovingAverages />
      <DailyReturnAnalysis />
      <BankReturnsScatterPlot />
      <DailyReturnHistogram />
    </div>
  )
}

export default MiscellaneousGraphs
