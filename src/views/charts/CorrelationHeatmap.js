import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';
import * as ss from 'simple-statistics';
import { useSelector, useDispatch } from 'react-redux'
function CorrelationHeatmap() {
  const dispatch = useDispatch()
  const processedData = useSelector((state) => state.processedData)
  const [bankReturnsCorrelation, setBankReturnsCorrelation] = useState([]);
  const [closingPricesCorrelation, setClosingPricesCorrelation] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch the CSV file
        const response = await fetch('/TD_data.csv');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const csvString = await response.text();

        // Parse CSV data
        const parsedData = Papa.parse(csvString, { header: true, dynamicTyping: true });
        const stockData = parsedData.data;

        // Get column names for heatmap labels
        setColumns(parsedData.meta.fields);

        // Process data to calculate returns and correlations
        const { bankReturnsCorrelation, closingPricesCorrelation } = processStockData(stockData);

        setBankReturnsCorrelation(bankReturnsCorrelation);
        setClosingPricesCorrelation(closingPricesCorrelation);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching or parsing data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const processStockData = (data) => {
    // Extract closing prices
    const closingPrices = data.map(row => row['Close']).filter(price => price != null);

    // Calculate daily returns
    const dailyReturns = [];
    for (let i = 1; i < closingPrices.length; i++) {
      dailyReturns.push((closingPrices[i] - closingPrices[i - 1]) / closingPrices[i - 1]);
    }

    // Calculate correlation matrices
    const bankReturnsCorrelation = calculateCorrelationMatrix([dailyReturns]);
    const closingPricesCorrelation = calculateCorrelationMatrix([closingPrices]);

    return { bankReturnsCorrelation, closingPricesCorrelation };
  };

  const calculateCorrelationMatrix = (dataArrays) => {
    const matrix = dataArrays.map(arr1 => dataArrays.map(arr2 => ss.sampleCorrelation(arr1, arr2)));
    return matrix;
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Bank Returns Correlation Heatmap</h1>
      {bankReturnsCorrelation.length > 0 && (
        <Plot
          data={[
            {
              z: bankReturnsCorrelation,
              x: ['Daily Returns'],
              y: ['Daily Returns'],
              type: 'heatmap',
              colorscale: 'YlGnBu',
              showscale: true,
              zmin: -1,
              zmax: 1,
            },
          ]}
          layout={{ title: 'Bank Returns Correlation Heatmap', width: 800, height: 600,  plot_bgcolor: 'rgba(0, 0, 0, 0)', // Transparent background
            paper_bgcolor: 'rgba(0, 0, 0, 0)', }}
        />
      )}

      <h1>Closing Prices Correlation Heatmap</h1>
      {closingPricesCorrelation.length > 0 && (
        <Plot
          data={[
            {
              z: closingPricesCorrelation,
              x: ['Closing Prices'],
              y: ['Closing Prices'],
              type: 'heatmap',
              colorscale: 'YlGnBu',
              showscale: true,
              zmin: -1,
              zmax: 1,
            },
          ]}
          layout={{ title: 'Closing Prices Correlation Heatmap', width: 800, height: 600 }}
        />
      )}
    </div>
  );
}

export default CorrelationHeatmap;
