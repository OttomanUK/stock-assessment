import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';
import { useSelector, useDispatch } from 'react-redux'
function ExponentialMovingAverages() {
  const [emaData, setEmaData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dailyReturnData, setDailyReturnData] = useState([]);
  const dispatch = useDispatch()
  const processedData = useSelector((state) => state.processedData)

  useEffect(() => {
    const fetchData =  () => {
      try {
        setIsLoading(true);

        // Fetch  stock 
        // Parse CSV data

        // Calculate exponential moving averages
        const emaDay = [10, 20, 50, 100];
        const emaData = emaDay.map(span => ({
          columnName: `EMA for ${span} days`,
          values: calculateEMA(processedData.map(row => ({ date: row.date, value: row.close})), span),
        }));
        setEmaData(emaData);

        // Calculate daily return percentage
        const dailyReturn = calculateDailyReturn(processedData.map(row => ({ date: row.date, value: row.close})));
        setDailyReturnData(dailyReturn);

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching or parsing data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateEMA = (data, span) => {
    const emaValues = [];
    const multiplier = 2 / (span + 1);
    let ema = 0;
    for (let i = 0; i < data.length; i++) {
      ema = i === 0 ? data[0].value : (data[i].value - ema) * multiplier + ema;
      emaValues.push({ date: data[i].date, value: ema });
    }
    return emaValues;
  };

  const calculateDailyReturn = (data) => {
    const dailyReturn = [];
    for (let i = 1; i < data.length; i++) {
      dailyReturn.push({ date: data[i].date, value: (data[i].value - data[i - 1].value) / data[i - 1].value });
    }
    return dailyReturn;
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Different Exponential Moving Averages for  Stock</h1>
      {emaData.length > 0 && (
        <Plot
          data={emaData.map((ema, index) => ({
            x: ema.values.map(item => item.date),
            y: ema.values.map(item => item.value),
            type: 'scatter',
            mode: 'lines',
            name: ema.columnName,
            marker: { color: index === 0 ? 'blue' : index === 1 ? 'red' : index === 2 ? 'green' : 'orange' },
          }))}
          layout={{ title: 'Different Exponential Moving Averages for  Stock',             xaxis: { title: 'Date' },
            yaxis: { title: 'Exponential Moving Average' },width: 1000, height: 400, plot_bgcolor: 'rgba(0, 0, 0, 0)', // Transparent background
            paper_bgcolor: 'rgba(0, 0, 0, 0)',  }}
        />
      )}

      {/* <h1>The daily return percentage for  Stock</h1>
      {dailyReturnData.length > 0 && (
        <Plot
          data={[
            {
              x: dailyReturnData.map(item => item.date),
              y: dailyReturnData.map(item => item.value),
              type: 'scatter',
              mode: 'lines+markers',
              marker: { color: 'blue' },
            },
          ]}
          layout={{ title: 'The daily return percentage for  Stock', width: 1000, height: 400, plot_bgcolor: 'rgba(0, 0, 0, 0)', // Transparent background
            paper_bgcolor: 'rgba(0, 0, 0, 0)', }}
        />
      )} */}
    </div>
  );
}

export default ExponentialMovingAverages;
