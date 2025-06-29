const express = require('express');
const router = express.Router();
const { db } = require('../firebase/firebaseConfig');

// Create a new alert
router.post('/', async (req, res) => {
  try {
    const docRef = await db.collection('alerts').add(req.body);
    res.status(201).send({ id: docRef.id });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get all alerts
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('alerts').get();
    const alerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(alerts);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;
