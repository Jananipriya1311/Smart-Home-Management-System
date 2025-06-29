// src/pages/Devices.jsx
import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../AuthContext';

export default function Devices() {
  const { user } = useAuth();
  const [devices, setDevices] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    status: 'OFF',
    location: '',
    installation_date: '',
    room: '',
  });
  const [editingId, setEditingId] = useState(null);

  const fetchDevices = async () => {
    if (!user) return;
    const q = query(collection(db, 'devices'), where('user_id', '==', user.email));
    const snapshot = await getDocs(q);
    setDevices(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const fetchRooms = async () => {
    if (!user) return;
    const q = query(collection(db, 'rooms'), where('user_id', '==', user.email));
    const snapshot = await getDocs(q);
    setRooms(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchDevices();
    fetchRooms();
  }, [user]);

  const toggleDevice = async (device) => {
    const newStatus = device.status === 'ON' ? 'OFF' : 'ON';
    const deviceDoc = doc(db, 'devices', device.id);

    await updateDoc(deviceDoc, {
      status: newStatus,
    });

    await addDoc(collection(db, 'logs'), {
      device_id: device.id,
      status_change: `Turned ${newStatus}`,
      timestamp: new Date().toISOString(),
      user_id: user.email,
    });

    fetchDevices();
  };

  const handleAddOrUpdateDevice = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.location || !formData.installation_date || !formData.room) {
      alert('Please fill all fields');
      return;
    }

    const deviceData = {
      ...formData,
      user_id: user.email,
    };

    if (editingId) {
      await updateDoc(doc(db, 'devices', editingId), deviceData);
      setEditingId(null);
    } else {
      await addDoc(collection(db, 'devices'), deviceData);
    }

    setFormData({
      name: '',
      status: 'OFF',
      location: '',
      installation_date: '',
      room: '',
    });

    fetchDevices();
  };

  const handleEdit = (device) => {
    setFormData({
      name: device.name,
      status: device.status,
      location: device.location,
      installation_date: device.installation_date,
      room: device.room,
    });
    setEditingId(device.id);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'devices', id));
    fetchDevices();
  };

  return (
    <div>
      <h2>All Devices</h2>
      {devices.map((device) => (
        <div key={device.id} style={{ border: '1px solid gray', padding: 10, margin: 10 }}>
          <h3>{device.name}</h3>
          <p>Status: {device.status}</p>
          <p>Location: {device.location}</p>
          <p>Installed: {device.installation_date}</p>
          <p>Room: {device.room}</p>
          <button onClick={() => toggleDevice(device)}>
            Turn {device.status === 'ON' ? 'OFF' : 'ON'}
          </button>{' '}
          <button onClick={() => handleEdit(device)}>Edit</button>{' '}
          <button onClick={() => handleDelete(device.id)}>Delete</button>
        </div>
      ))}

      <h3>{editingId ? 'Edit Device' : 'Add New Device'}</h3>
      <form onSubmit={handleAddOrUpdateDevice}>
        <input
          type="text"
          placeholder="Device Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          required
        />
        <input
          type="date"
          value={formData.installation_date}
          onChange={(e) => setFormData({ ...formData, installation_date: e.target.value })}
          required
        />
        <select
          value={formData.room}
          onChange={(e) => setFormData({ ...formData, room: e.target.value })}
          required
        >
          <option value="">Select Room</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.name}>
              {room.name}
            </option>
          ))}
        </select>
        <button type="submit">{editingId ? 'Update Device' : 'Add Device'}</button>
        {editingId && <button onClick={() => setEditingId(null)}>Cancel</button>}
      </form>
    </div>
  );
}
