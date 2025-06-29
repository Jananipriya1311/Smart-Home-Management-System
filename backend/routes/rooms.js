const express = require('express');
const router = express.Router();
const { db } = require('../firebase/firebaseConfig');

// Create a new room
router.post('/', async (req, res) => {
  try {
    const docRef = await db.collection('rooms').add(req.body);
    res.status(201).send({ id: docRef.id });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('rooms').get();
    const rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(rooms);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;
