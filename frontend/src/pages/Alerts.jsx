// src/pages/Alerts.jsx
import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../AuthContext';

export default function Alerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [devices, setDevices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [devicesLoaded, setDevicesLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;

    fetchDevices().then(() => {
      setDevicesLoaded(true);
    });

    const unsubscribe = onSnapshot(
      query(collection(db, 'alerts'), where('user_id', '==', user.email), orderBy('timestamp', 'desc')),
      async (snapshot) => {
        const newAlerts = snapshot.docChanges()
          .filter(change => change.type === 'added')
          .map(change => ({ id: change.doc.id, ...change.doc.data() }));

        for (let alert of newAlerts) {
          const device = devices.find(d => d.id === alert.device_id);
          const deviceName = device?.name || alert.device_id;

          const notifQuery = query(
            collection(db, 'notifications'),
            where('alert_id', '==', alert.id)
          );
          const notifSnapshot = await getDocs(notifQuery);

          if (notifSnapshot.empty) {
            await addDoc(collection(db, 'notifications'), {
              alert_id: alert.id,
              user_id: user.email,
              message: `${deviceName} - ${alert.alert_type} Alert!`,
              timestamp: new Date().toISOString()
            });
          }
        }

        fetchAlerts();
      }
    );

    const usageInterval = setInterval(() => {
      if (devicesLoaded) checkUsageThreshold();
    }, 5 * 60 * 1000);

    return () => {
      unsubscribe();
      clearInterval(usageInterval);
    };
  }, [user, devicesLoaded]);

  useEffect(() => {
    if (devicesLoaded) {
      fetchAlerts();
      checkUsageThreshold();
    }
  }, [devicesLoaded]);

  const fetchDevices = async () => {
    const snapshot = await getDocs(collection(db, 'devices'));
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setDevices(list);
  };

  const fetchAlerts = async () => {
    const q = query(collection(db, 'alerts'), where('user_id', '==', user.email));
    const snapshot = await getDocs(q);
    setAlerts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const checkUsageThreshold = async () => {
    const usageSnap = await getDocs(collection(db, 'usage_records'));
    const usageRecords = usageSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const alertsSnap = await getDocs(query(collection(db, 'alerts'), where('user_id', '==', user.email)));
    const existingAlerts = alertsSnap.docs.map(doc => doc.data());

    const thresholdHours = 0.0833; // 5 minutes

    for (const record of usageRecords) {
      const usageTime = parseFloat(record.usage_time);

      const uniqueAlertKey = `${record.device_id}_${record.start_time}_${record.end_time}`;
      const alreadyAlerted = existingAlerts.some(alert =>
        alert.device_id === record.device_id &&
        alert.alert_type === 'Overuse' &&
        alert.timestamp &&
        alert.timestamp.includes(record.end_time?.split('T')[0])
      );

      if (usageTime > thresholdHours && !alreadyAlerted) {
        const alertRef = await addDoc(collection(db, 'alerts'), {
          device_id: record.device_id,
          alert_type: 'Overuse',
          timestamp: new Date().toISOString(),
          user_id: user.email
        });

        const device = devices.find(d => d.id === record.device_id);
        const deviceName = device?.name || record.device_id;

        await addDoc(collection(db, 'notifications'), {
          alert_id: alertRef.id,
          user_id: user.email,
          message: `${deviceName} exceeded usage limit!`,
          timestamp: new Date().toISOString()
        });

        console.log(`✅ Alert sent: ${deviceName} exceeded 5 minutes`);
      }
    }
  };

  const handleDeleteAll = async () => {
    const q = query(collection(db, 'alerts'), where('user_id', '==', user.email));
    const snapshot = await getDocs(q);
    const deletions = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletions);
    setAlerts([]);
  };

  const filteredAlerts = alerts.filter(alert => {
    const device = devices.find(d => d.id === alert.device_id);
    const deviceName = device?.name || alert.device_id;
    return (
      deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.alert_type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div style={{ padding: '20px' }}>
      <h2>🔔 Alerts</h2>

      <input
        type="text"
        placeholder="Search by device or alert type..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: '10px', padding: '5px', width: '250px' }}
      />
      <br />
      <button onClick={handleDeleteAll} style={{ backgroundColor: 'red', color: 'white' }}>
        Delete All Alerts
      </button>

      <table border="1" cellPadding="10" style={{ marginTop: '15px' }}>
        <thead>
          <tr>
            <th>Device</th>
            <th>Alert Type</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {filteredAlerts.map((alert) => {
            const device = devices.find(d => d.id === alert.device_id);
            const deviceName = device?.name || alert.device_id;
            return (
              <tr key={alert.id}>
                <td>{deviceName}</td>
                <td>{alert.alert_type}</td>
                <td>{new Date(alert.timestamp).toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
