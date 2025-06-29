// src/pages/Maintenance.jsx
import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../AuthContext';

export default function Maintenance() {
  const { user } = useAuth();
  const [maintenance, setMaintenance] = useState([]);
  const [formData, setFormData] = useState({
    service_date: '',
    technician_name: '',
    service_details: '',
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (user) fetchMaintenance();
  }, [user]);

  const fetchMaintenance = async () => {
    try {
      const q = query(collection(db, 'maintenance'), where('user_id', '==', user.email));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMaintenance(data);
    } catch (err) {
      console.error('Error fetching maintenance records:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { service_date, technician_name, service_details } = formData;

    if (!service_date || !technician_name || !service_details) {
      alert('Please fill all fields.');
      return;
    }

    const newData = {
      ...formData,
      user_id: user.email,
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'maintenance', editingId), newData);
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'maintenance'), newData);
      }

      setFormData({
        service_date: '',
        technician_name: '',
        service_details: '',
      });

      fetchMaintenance();
    } catch (err) {
      console.error('Error saving maintenance record:', err);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      service_date: item.service_date,
      technician_name: item.technician_name,
      service_details: item.service_details,
    });
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'maintenance', id));
      fetchMaintenance();
    } catch (err) {
      console.error('Error deleting maintenance record:', err);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Maintenance Records</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input
          type="date"
          name="service_date"
          value={formData.service_date}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="technician_name"
          placeholder="Technician Name"
          value={formData.technician_name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="service_details"
          placeholder="Service Details"
          value={formData.service_details}
          onChange={handleChange}
          required
        />
        <button type="submit">{editingId ? 'Update' : 'Add'} Maintenance</button>
      </form>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Service Date</th>
            <th>Technician Name</th>
            <th>Service Details</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {maintenance.map((record) => (
            <tr key={record.id}>
              <td>{record.service_date}</td>
              <td>{record.technician_name}</td>
              <td>{record.service_details}</td>
              <td>
                <button onClick={() => handleEdit(record)}>Edit</button>
                <button onClick={() => handleDelete(record.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
