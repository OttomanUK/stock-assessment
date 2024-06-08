import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';

function BankReturnsScatterPlot() {
  const [bankReturns, setBankReturns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch the CSV data
        const response = await fetch('/TD_data.csv');
        const csvString = await response.text();
        
        // Parse CSV data
        const parsedData = Papa.parse(csvString, { header: true, dynamicTyping: true });
        const tdData = parsedData.data;
        
        // Calculate returns
        const bankReturns = calculateBankReturns(tdData);
        setBankReturns(bankReturns);

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching or parsing data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateBankReturns = (data) => {
    const bankReturns = [];
    for (let i = 1; i < data.length; i++) {
      const returnRate = (data[i]['Close'] - data[i - 1]['Close']) / data[i - 1]['Close'];
      bankReturns.push({ date: data[i]['Date'], returnRate });
    }
    return bankReturns;
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Scatter Plot of TD Bank Returns</h1>
      {bankReturns.length > 0 && (
        <Plot
          data={[
            {
              x: bankReturns.map(d => d.date),
              y: bankReturns.map(d => d.returnRate),
              mode: 'markers',
              type: 'scatter',
              marker: { color: 'green' },
            },
          ]}
          layout={{
            title: 'TD Bank Daily Return Percentage',
            xaxis: { title: 'Date' },
            yaxis: { title: 'Daily Return' },
            width: 1000,
            height: 600,
          }}
        />
      )}
    </div>
  );
}

export default BankReturnsScatterPlot;
