import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';
import * as sns from 'plotly.js/dist/plotly-cartesian';

function DailyReturnAnalysis() {
  const [dailyReturnData, setDailyReturnData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch TD stock data CSV file
        const response = await fetch('/TD_data.csv');
        const csvString = await response.text();

        // Parse CSV data
        const parsedData = Papa.parse(csvString, { header: true, dynamicTyping: true });
        const tdData = parsedData.data;

        // Calculate daily return percentage
        const dailyReturn = calculateDailyReturn(tdData.map(row => row['Close']));
        setDailyReturnData(dailyReturn);
      } catch (error) {
        console.error('Error fetching or parsing data:', error);
      }
    };

    fetchData();
  }, []);

  const calculateDailyReturn = (data) => {
    const dailyReturn = [];
    for (let i = 1; i < data.length; i++) {
      dailyReturn.push((data[i] - data[i - 1]) / data[i - 1]);
    }
    return dailyReturn;
  };

  return (
    <div>
      <h1>Daily Return Analysis for TD Stock</h1>
      {dailyReturnData.length > 0 && (
        <div>
          <h2>Daily Return Percentage Plot</h2>
          <Plot
            data={[
              {
                x: Array.from({ length: dailyReturnData.length }, (_, i) => i + 1), // Assuming x-axis is just index
                y: dailyReturnData,
                type: 'scatter',
                mode: 'lines+markers',
                marker: { color: 'blue' },
              },
            ]}
            layout={{ title: 'Daily Return Percentage Plot', width: 1000, height: 400 }}
          />

          <h2>Distribution of Daily Return</h2>
          <Plot
            data={[
              {
                x: dailyReturnData,
                type: 'histogram',
              },
            ]}
            layout={{ title: 'Distribution of Daily Return', width: 1000, height: 400 }}
          />

          <h2>Pairplot for Daily Return</h2>
          {/* Add your Pairplot component here */}
          {/* Replace the below Plot component with the appropriate Pairplot component */}

          {/* <Plot
            data={[
              // Add your pairplot data configuration here
            ]}
            layout={{ title: 'Pairplot for Daily Return', width: 1000, height: 400 }}
          /> */}
        </div>
      )}
    </div>
  );
}

export default DailyReturnAnalysis;
