const express = require('express');
const router = express.Router();
const { db } = require('../firebase/firebaseConfig'); // Import initialized Firebase

// Create a new maintenance record
router.post('/', async (req, res) => {
  try {
    const docRef = await db.collection('maintenance').add(req.body);
    res.status(201).send({ id: docRef.id });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get all maintenance records
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('maintenance').get();
    const maintenance = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(maintenance);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get a single maintenance record by ID
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('maintenance').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).send('Maintenance record not found');
    res.status(200).send(doc.data());
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Update maintenance record by ID
router.put('/:id', async (req, res) => {
  try {
    await db.collection('maintenance').doc(req.params.id).update(req.body);
    res.status(200).send('Maintenance record updated successfully');
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Delete maintenance record by ID
router.delete('/:id', async (req, res) => {
  try {
    await db.collection('maintenance').doc(req.params.id).delete();
    res.status(200).send('Maintenance record deleted successfully');
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;
