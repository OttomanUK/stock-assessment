import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';

function CorrelationHeatmap() {
  const [correlationMatrix, setCorrelationMatrix] = useState([]);
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the CSV data
        const response = await fetch('/TD_data.csv');
        const csvString = await response.text();

        // Parse CSV data
        const parsedData = Papa.parse(csvString, { header: true, dynamicTyping: true });
        const tdData = parsedData.data;

        // Extract relevant columns for correlation calculation
        const columns = ['Close', 'Volume', 'MA for 10 days', 'MA for 20 days', 'MA for 50 days', 'MA for 100 days', 'EMA for 10 days', 'EMA for 20 days', 'EMA for 50 days', 'EMA for 100 days', 'Daily Return'];
        const data = tdData.map(row => columns.map(col => row[col]));
    console.log(data)
        // Calculate correlation matrix
        const correlationMatrix = calculateCorrelationMatrix(data);

        // Set correlation matrix and labels
        setCorrelationMatrix(correlationMatrix);
        setLabels(columns);
      } catch (error) {
        console.error('Error fetching or parsing data:', error);
      }
    };

    fetchData();
  }, []);

  const calculateCorrelationMatrix = (data) => {
    const correlationMatrix = [];
    const n = data.length;

    for (let i = 0; i < data[0].length; i++) {
      correlationMatrix[i] = [];
      for (let j = 0; j < data[0].length; j++) {
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
        for (let k = 0; k < n; k++) {
          sumX += data[k][i];
          sumY += data[k][j];
          sumXY += data[k][i] * data[k][j];
          sumX2 += data[k][i] * data[k][i];
          sumY2 += data[k][j] * data[k][j];
        }
        const corr = (n * sumXY - sumX * sumY) / (Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)));
        correlationMatrix[i][j] = corr;
      }
    }

    return correlationMatrix;
  };

  return (
    <div>
      <h1>Correlation Heatmap for TD Stock Data</h1>
      {correlationMatrix.length > 0 && (
        <Plot
          data={[
            {
              z: correlationMatrix,
              x: labels,
              y: labels,
              type: 'heatmap',
              colorscale: 'YlGnBu',
              showscale: true,
            },
          ]}
          layout={{ title: 'Correlation Heatmap', width: 1000, height: 800, annotations: createAnnotations(correlationMatrix, labels) }}
        />
      )}
    </div>
  );
}

const createAnnotations = (matrix, labels) => {
  const annotations = [];
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      const value = matrix[i][j].toFixed(3);
      annotations.push({
        x: labels[j],
        y: labels[i],
        xref: 'x1',
        yref: 'y1',
        text: value,
        showarrow: false,
        font: {
          family: 'Arial',
          size: 12,
          color: 'black',
        },
      });
    }
  }
  return annotations;
};

export default CorrelationHeatmap;
