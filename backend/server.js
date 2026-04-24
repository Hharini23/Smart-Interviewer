import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import interviewRoutes from './routes/interviewRoutes.js';

import authRoutes from './routes/authRoutes.js';

dotenv.config();

// Connect to Supabase
// Our controllers and middleware will use the supabase client directly.

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/interviews', interviewRoutes);

import path from 'path';

app.use(express.static(path.join(process.cwd(), '../frontend/dist')));

app.get('/api', (req, res) => {
  res.send('API is running...');
});

// Any other requests that don't match '/api' will be served the React frontend
app.get('(.*)', (req, res) => {
  res.sendFile(path.join(process.cwd(), '../frontend/dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
