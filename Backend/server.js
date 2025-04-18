import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';

import studentRoutes from './routes/studentRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import facultyActivitiesRoutes from './routes/facultyActivitiesRoutes.js';
import attendanceRoutes from "./routes/attendanceRoutes.js"; 
import assessmentRoutes from "./routes/assessmentRoutes.js";
import resourceRoutes from './routes/resourceRoutes.js'; 

// Fix __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to DB
connectDB();

// Routes
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/faculty-activities', facultyActivitiesRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use('/api/resources', resourceRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
