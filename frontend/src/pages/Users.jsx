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
import { useAuth } from '../AuthContext'; // Assuming you're using Firebase AuthContext

export default function Users() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    user_id: '',
    name: '',
    email: '',
    password: '',
    contact: '',
  });
  const [editingDocId, setEditingDocId] = useState(null);
  const { user } = useAuth(); // Firebase Auth user context

  const usersRef = collection(db, 'users');

  // Fetch users based on the logged-in email
  const fetchUsers = async () => {
    if (user) {
      const q = query(usersRef, where('email', '==', user.email)); // Filter by email
      const data = await getDocs(q);
      setUsers(data.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]); // Re-fetch when the user changes

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.user_id ||
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.contact
    ) {
      alert('Please fill all fields');
      return;
    }

    try {
      if (editingDocId) {
        // Update existing user
        const userDoc = doc(db, 'users', editingDocId);
        await updateDoc(userDoc, formData);
        setEditingDocId(null);
      } else {
        // Add new user
        await addDoc(usersRef, formData);
      }

      setFormData({
        user_id: '',
        name: '',
        email: '',
        password: '',
        contact: '',
      });

      await fetchUsers(); // Refresh list
    } catch (err) {
      console.error('Error in add/update:', err);
    }
  };

  const handleEdit = (user) => {
    setFormData({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      password: user.password,
      contact: user.contact,
    });
    setEditingDocId(user.id); // Use Firestore document ID
  };

  const handleDelete = async (docId) => {
    try {
      await deleteDoc(doc(db, 'users', docId));
      await fetchUsers();
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  return (
    <div>
      <h2>Users</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="user_id"
          placeholder="User ID"
          value={formData.user_id}
          onChange={handleChange}
          required
        />
        <input
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          name="contact"
          placeholder="Contact"
          value={formData.contact}
          onChange={handleChange}
          required
        />
        <button type="submit">
          {editingDocId ? 'Update User' : 'Add User'}
        </button>
      </form>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Contact</th>
            <th>Password</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.user_id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.contact}</td>
              <td>{u.password}</td>
              <td>
                <button onClick={() => handleEdit(u)}>Edit</button>
                <button onClick={() => handleDelete(u.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
