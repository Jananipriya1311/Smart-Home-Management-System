// src/pages/UsageRecords.jsx
import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function UsageRecords() {
  const [usageRecords, setUsageRecords] = useState([]);
  const [devices, setDevices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDevices();
    fetchUsageData();
  }, []);

  const fetchDevices = async () => {
    const snapshot = await getDocs(collection(db, 'devices'));
    const deviceList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setDevices(deviceList);
  };

  const fetchUsageData = async () => {
    const usageSnapshot = await getDocs(collection(db, 'usage_records'));
    const records = usageSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const uniqueMap = new Map();
    for (const rec of records) {
      const key = `${rec.device_id}_${rec.start_time}_${rec.end_time}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, rec);
      }
    }

    const uniqueSorted = Array.from(uniqueMap.values()).sort(
      (a, b) => new Date(b.end_time) - new Date(a.end_time)
    );

    setUsageRecords(uniqueSorted);
  };

  const calculateUsage = async () => {
    const logsSnapshot = await getDocs(query(
      collection(db, 'logs'),
      orderBy('timestamp', 'asc')
    ));

    const logs = logsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const deviceLogs = {};

    for (let log of logs) {
      const { device_id, status_change, timestamp } = log;
      if (!deviceLogs[device_id]) deviceLogs[device_id] = [];
      deviceLogs[device_id].push({ status_change, timestamp: new Date(timestamp) });
    }

    for (let deviceId in deviceLogs) {
      const logs = deviceLogs[deviceId];
      for (let i = 0; i < logs.length - 1; i++) {
        const start = logs[i];
        const end = logs[i + 1];

        if (start.status_change === 'Turned ON' && end.status_change === 'Turned OFF') {
          const usageTimeMs = end.timestamp - start.timestamp;
          const usageTimeHr = (usageTimeMs / (1000 * 60 * 60)).toFixed(2);

          const usageRecord = {
            device_id: deviceId,
            usage_time: usageTimeHr,
            start_time: start.timestamp.toISOString(),
            end_time: end.timestamp.toISOString()
          };

          const duplicateKey = `${usageRecord.device_id}_${usageRecord.start_time}_${usageRecord.end_time}`;
          const existingKeys = usageRecords.map(rec =>
            `${rec.device_id}_${rec.start_time}_${rec.end_time}`
          );

          if (!existingKeys.includes(duplicateKey)) {
            await addDoc(collection(db, 'usage_records'), usageRecord);
          }

          i++;
        }
      }
    }

    fetchUsageData();
    alert('Usage records updated successfully.');
  };

  const deleteAllUsageRecords = async () => {
    const confirm = window.confirm("Are you sure you want to delete all usage records?");
    if (!confirm) return;

    const usageSnapshot = await getDocs(collection(db, 'usage_records'));
    const deletePromises = usageSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    setUsageRecords([]);
    alert('All usage records deleted.');
  };

  const getDeviceName = (id) => {
    const device = devices.find(d => d.id === id);
    return device ? device.name : id;
  };

  const filteredRecords = usageRecords.filter((rec) =>
    getDeviceName(rec.device_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2>Usage Records</h2>
      <input
        type="text"
        placeholder="Search device..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: '10px', padding: '5px', width: '200px' }}
      />
      <br />
      <button onClick={calculateUsage} style={{ marginRight: '10px' }}>
        Calculate Usage From Logs
      </button>
      <button onClick={deleteAllUsageRecords} style={{ backgroundColor: 'red', color: 'white' }}>
        Delete All Usage Records
      </button>

      <table border="1" cellPadding="10" style={{ marginTop: '15px' }}>
        <thead>
          <tr>
            <th>Device</th>
            <th>Usage Time (hrs)</th>
            <th>Start Time</th>
            <th>End Time</th>
          </tr>
        </thead>
        <tbody>
          {filteredRecords.map((rec) => (
            <tr key={`${rec.device_id}_${rec.start_time}_${rec.end_time}`}>
              <td>{getDeviceName(rec.device_id)}</td>
              <td>{rec.usage_time}</td>
              <td>{new Date(rec.start_time).toLocaleString()}</td>
              <td>{new Date(rec.end_time).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
