const express = require('express');
const router = express.Router();
const { db } = require('../firebase/firebaseConfig'); // Import the initialized Firebase

// Create a new user
router.post('/', async (req, res) => {
  try {
    const docRef = await db.collection('users').add(req.body);
    res.status(201).send({ id: docRef.id });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(users);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get a single user by ID
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('users').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).send('User not found');
    res.status(200).send(doc.data());
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Update user by ID
router.put('/:id', async (req, res) => {
  try {
    await db.collection('users').doc(req.params.id).update(req.body);
    res.status(200).send('User updated successfully');
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Delete user by ID
router.delete('/:id', async (req, res) => {
  try {
    await db.collection('users').doc(req.params.id).delete();
    res.status(200).send('User deleted successfully');
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;
