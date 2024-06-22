

import React, { useEffect, useState } from 'react';
import { CButton, CCard, CCardBody, CCol, CRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilCloudDownload } from '@coreui/icons';
import WidgetsDropdown from '../widgets/WidgetsDropdown';
import MiscellaneousGraphs from '../charts/MiscellaneousGraphs';
import { useSelector, useDispatch } from 'react-redux';
import Papa from 'papaparse';

const Dashboard = () => {
  const dispatch = useDispatch();
  const [error, setError] = useState('');
  const processedData = useSelector((state) => state.processedData) || [];

  // Filter and process the dates to handle null or invalid dates
  const validDates = processedData
    .map((row) => row?.date) // Extract the date values
    .filter(date => date) // Filter out null or undefined dates
    .map(date => new Date(date)) // Convert the remaining dates to Date objects
    .filter(date => !isNaN(date)); // Filter out invalid Date objects

  // Options for formatting the date strings
  const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };

  // Calculate start and end dates if there are valid dates available
  const startDate = validDates.length > 0 ? new Date(Math.min(...validDates)).toLocaleDateString(undefined, dateOptions) : '';
  const endDate = validDates.length > 0 ? new Date(Math.max(...validDates)).toLocaleDateString(undefined, dateOptions) : '';

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
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
            low: row['Low'], // corrected 'lo' to 'low'
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
          dispatch({ type: 'set', processedData: processedData1 });
        },
      });
      setError('');
    } else {
      setError('Please upload a valid CSV file.');
    }
  };

  return (
    <>
      <WidgetsDropdown className="mb-4" />
      <CCard className="mb-4">
        <CCardBody>
          <CRow>
            <CCol sm={5}>
              <h4 id="traffic" className="card-title mb-0">
                Stocks
              </h4>
              <div className="small text-body-secondary">{startDate} - {endDate}</div>
            </CCol>
            <CCol sm={7} className="d-none d-md-block">
              <input
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                id="csvFileInput"
                onChange={handleFileUpload}
              />
              <CButton
                color="primary"
                className="float-end"
                onClick={() => document.getElementById('csvFileInput').click()}
              >
                <CIcon icon={cilCloudDownload} />
              </CButton>
            </CCol>
          </CRow>
          {error && <div style={{ color: 'red' }}>{error}</div>}
          <MiscellaneousGraphs />
        </CCardBody>
      </CCard>
    </>
  );
};

export default Dashboard;
