// src/pages/Rooms.jsx
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
import { useAuth } from '../AuthContext';

export default function Rooms() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: '' });
  const [editingDocId, setEditingDocId] = useState(null);

  const roomsRef = collection(db, 'rooms');
  const usersRef = collection(db, 'users');

  const fetchRooms = async () => {
    const data = await getDocs(roomsRef);
    const filteredRooms = data.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((room) => room.user_id === user?.email);
    setRooms(filteredRooms);
  };

  const fetchUsers = async () => {
    const data = await getDocs(usersRef);
    setUsers(data.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    if (user) {
      fetchRooms();
      fetchUsers();
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      alert('Please enter a room name');
      return;
    }

    const newRoom = {
      name: formData.name,
      user_id: user.email,
    };

    try {
      if (editingDocId) {
        await updateDoc(doc(db, 'rooms', editingDocId), newRoom);
        setEditingDocId(null);
      } else {
        await addDoc(roomsRef, newRoom);
      }

      setFormData({ name: '' });
      await fetchRooms();
    } catch (err) {
      console.error('Error in add/update:', err);
    }
  };

  const handleEdit = (room) => {
    setFormData({ name: room.name });
    setEditingDocId(room.id);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'rooms', id));
      await fetchRooms();
    } catch (err) {
      console.error('Error deleting room:', err);
    }
  };

  const getUserName = (uid) => {
    const u = users.find((u) => u.user_id === uid);
    return u ? u.name : uid;
  };

  return (
    <div>
      <h2>Rooms</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Room Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <button type="submit">
          {editingDocId ? 'Update Room' : 'Add Room'}
        </button>
      </form>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Room Name</th>
            <th>User</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((r) => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{getUserName(r.user_id)}</td>
              <td>
                <button onClick={() => handleEdit(r)}>Edit</button>
                <button onClick={() => handleDelete(r.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
