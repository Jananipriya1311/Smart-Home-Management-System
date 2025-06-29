const express = require('express');
const app = express();
const cors = require('cors');
const { db } = require('./firebase/firebaseConfig'); // Import initialized Firebase

// Middleware
app.use(express.json()); // Parse JSON requests
app.use(cors()); // Enable CORS

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/devices', require('./routes/devices'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/usageRecords', require('./routes/usageRecords'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/notifications', require('./routes/notifications'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
