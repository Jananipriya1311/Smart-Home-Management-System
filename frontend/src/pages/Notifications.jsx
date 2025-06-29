// src/pages/Notifications.jsx
import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    user_id: '',
    message: '',
    timestamp: '',
  });
  const [editingId, setEditingId] = useState(null);

  const notificationsRef = collection(db, 'notifications');
  const usersRef = collection(db, 'users');

  const fetchData = async () => {
    const notificationsSnap = await getDocs(notificationsRef);
    const usersSnap = await getDocs(usersRef);

    setNotifications(
      notificationsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    );
    setUsers(usersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.user_id || !formData.message || !formData.timestamp) {
      alert('Please fill all fields');
      return;
    }

    try {
      if (editingId) {
        await updateDoc(doc(db, 'notifications', editingId), formData);
        setEditingId(null);
      } else {
        await addDoc(notificationsRef, formData);
      }

      setFormData({
        user_id: '',
        message: '',
        timestamp: '',
      });

      await fetchData();
    } catch (err) {
      console.error('Error in add/update:', err);
    }
  };

  const handleEdit = (rec) => {
    setFormData({
      user_id: rec.user_id,
      message: rec.message,
      timestamp: rec.timestamp,
    });
    setEditingId(rec.id);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
      await fetchData();
    } catch (err) {
      console.error('Error deleting record:', err);
    }
  };

  const deleteAllNotifications = async () => {
    try {
      const snapshot = await getDocs(notificationsRef);
      const deletions = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletions);
      await fetchData();
    } catch (err) {
      console.error('Error deleting all notifications:', err);
    }
  };

  const getUserName = (user_id) => {
    const user = users.find((u) => u.id === user_id);
    return user ? user.name : user_id;
  };

  const filteredNotifications = notifications.filter(n =>
    n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.timestamp.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '20px' }}>
      <h2>Notifications</h2>

      <input
        type="text"
        placeholder="Search notifications..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ padding: '8px', marginBottom: '10px', width: '300px' }}
      />

      <button
        onClick={deleteAllNotifications}
        style={{ marginLeft: '20px', padding: '8px 12px', backgroundColor: '#f44336', color: '#fff', border: 'none', borderRadius: '4px' }}
      >
        Delete All Notifications
      </button>

      <table border="1" cellPadding="10" style={{ marginTop: '20px' }}>
        <thead>
          <tr>
            <th>Message</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {filteredNotifications.map((n) => (
            <tr key={n.id}>
              <td>{n.message}</td>
              <td>{n.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
