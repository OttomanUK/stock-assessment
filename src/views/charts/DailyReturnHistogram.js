import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';

function DailyReturnHistogram({processedData}) {
  const [dailyReturnData, setDailyReturnData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {


        // Extract Daily Return data and filter out NaN values
        const dailyReturn = processedData.map(row => row.dailyReturn).filter(value => !isNaN(value));

        setDailyReturnData(dailyReturn);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching or parsing data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Daily Return Histogram for  Stock</h1>
      {dailyReturnData.length > 0 && (
        <Plot
          data={[
            {
              x: dailyReturnData,
              type: 'histogram',
              marker: { color: 'purple' },
              nbinsx: 100,
            },
          ]}
          layout={{
            title: 'Distribution of Daily Returns',
            xaxis: { title: 'Daily Return' },
            yaxis: { title: 'Frequency' },
            width: 1000,
            height: 400,
          }}
        />
      )}
    </div>
  );
}

export default DailyReturnHistogram;
