const express = require('express');
const router = express.Router();
const { db } = require('../firebase/firebaseConfig'); // Import initialized Firebase

// Create a new notification
router.post('/', async (req, res) => {
  try {
    const docRef = await db.collection('notifications').add(req.body);
    res.status(201).send({ id: docRef.id });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get all notifications
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('notifications').get();
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(notifications);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get a single notification by ID
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('notifications').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).send('Notification not found');
    res.status(200).send(doc.data());
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Update notification by ID
router.put('/:id', async (req, res) => {
  try {
    await db.collection('notifications').doc(req.params.id).update(req.body);
    res.status(200).send('Notification updated successfully');
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Delete notification by ID
router.delete('/:id', async (req, res) => {
  try {
    await db.collection('notifications').doc(req.params.id).delete();
    res.status(200).send('Notification deleted successfully');
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;
