import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';

function BankReturnsScatterPlot({processedData}) {
  const [bankReturns, setBankReturns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Parse CSV data

        // Ensure processedData is not empty
        if (!processedData || processedData.length === 0) {
          throw new Error('No data found in the CSV file');
        }

        // Calculate returns
        const bankReturns = calculateBankReturns(processedData);
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
      const returnRate = (data[i].close - data[i - 1].close) / data[i - 1].close;
      bankReturns.push({ date: data[i].date, returnRate });
    }
    return bankReturns;
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Scatter Plot of Bank Returns</h1>
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
            title:  'Bank Daily Return Percentage',
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
