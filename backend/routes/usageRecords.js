const express = require('express');
const router = express.Router();
const { db } = require('../firebase/firebaseConfig');

// Create a new usage record
router.post('/', async (req, res) => {
  try {
    const docRef = await db.collection('usageRecords').add(req.body);
    res.status(201).send({ id: docRef.id });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get all usage records
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('usageRecords').get();
    const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(records);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;
