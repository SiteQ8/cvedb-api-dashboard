import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DeviceList from './components/DeviceList';

function App() {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    axios.get('/api/iot-devices')
      .then(response => setDevices(response.data.matches))
      .catch(error => console.error('Error fetching IoT devices:', error));
  }, []);

  return (
    <div className="App">
      <h1>IoT Devices in Kuwait</h1>
      <DeviceList devices={devices} />
    </div>
  );
}

export default App;
