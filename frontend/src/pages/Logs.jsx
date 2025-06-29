// src/pages/Logs.jsx
import React, { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../AuthContext';

export default function Logs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [devices, setDevices] = useState([]);
  const [formData, setFormData] = useState({
    device_id: '',
    status_change: '',
    timestamp: '',
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!user) return;

    const logsQuery = query(collection(db, 'logs'), where('user_id', '==', user.email));
    const unsubLogs = onSnapshot(logsQuery, (snapshot) => {
      setLogs(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const fetchDevices = async () => {
      const devicesQuery = query(collection(db, 'devices'), where('user_id', '==', user.email));
      const snapshot = await getDocs(devicesQuery);
      setDevices(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchDevices();
    return () => unsubLogs();
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.device_id || !formData.status_change || !formData.timestamp) {
      alert('Please fill all fields');
      return;
    }

    const logData = {
      ...formData,
      user_id: user.email,
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'logs', editingId), logData);
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'logs'), logData);
      }

      setFormData({
        device_id: '',
        status_change: '',
        timestamp: '',
      });
    } catch (err) {
      console.error('Error saving log:', err);
    }
  };

  const handleEdit = (log) => {
    setFormData({
      device_id: log.device_id,
      status_change: log.status_change,
      timestamp: log.timestamp,
    });
    setEditingId(log.id);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'logs', id));
  };

  const getDeviceName = (device_id) => {
    const device = devices.find((d) => d.id === device_id);
    return device ? device.name : device_id;
  };

  return (
    <div>
      <h3>Live Activity Feed</h3>
      <ul>
        {logs
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .map((log) => (
            <li key={log.id}>
              [{new Date(log.timestamp).toLocaleString()}] – {getDeviceName(log.device_id)}: {log.status_change}
              <button onClick={() => handleEdit(log)}>Edit</button>
              <button onClick={() => handleDelete(log.id)}>Delete</button>
            </li>
          ))}
      </ul>
    </div>
  );
}
