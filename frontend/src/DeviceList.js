import React from 'react';

const DeviceList = ({ devices }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>IP Address</th>
          <th>Port</th>
          <th>Service</th>
          <th>CVE</th>
        </tr>
      </thead>
      <tbody>
        {devices.map(device => (
          <tr key={device.ip_str}>
            <td>{device.ip_str}</td>
            <td>{device.port}</td>
            <td>{device.product || 'Unknown'}</td>
            <td>{device.cpe ? device.cpe.join(', ') : 'No CVE'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DeviceList;
