const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
  res.send('Dental System API is running...');
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const aiRoutes = require('./routes/aiRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const bootstrapAdmin = require('./utils/bootstrap');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/services', serviceRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await bootstrapAdmin();
});
