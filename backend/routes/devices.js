const express = require('express');
const router = express.Router();
const { db } = require('../firebase/firebaseConfig');

// Create a new device
router.post('/', async (req, res) => {
  try {
    const docRef = await db.collection('devices').add(req.body);
    res.status(201).send({ id: docRef.id });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get all devices
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('devices').get();
    const devices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(devices);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get a single device by ID
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('devices').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).send('Device not found');
    res.status(200).send(doc.data());
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Update device by ID
router.put('/:id', async (req, res) => {
  try {
    await db.collection('devices').doc(req.params.id).update(req.body);
    res.status(200).send('Device updated successfully');
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Delete device by ID
router.delete('/:id', async (req, res) => {
  try {
    await db.collection('devices').doc(req.params.id).delete();
    res.status(200).send('Device deleted successfully');
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;
