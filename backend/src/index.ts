import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './config/database';
import authRoutes from './routes/authRoutes';
import templateRoutes from './routes/templateRoutes';
import posterRoutes from './routes/posterRoutes';
import uploadRoutes from './routes/uploadRoutes';
import adminRoutes from './routes/adminRoutes';
import { Template } from './models/Template';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static uploaded photos and rendered posters
const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'AI Political Poster Maker API (Bangladesh)',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE'),
  });
});

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/posters', posterRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server Error]:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
  });
});

async function startServer() {
  try {
    await connectDB();

    // Check if templates need automatic seeding
    const templateCount = await Template.countDocuments();
    if (templateCount === 0) {
      console.log('[Bootstrap] No templates found. Automatically bootstrapping seed templates...');
      try {
        const { seedDatabase } = await import('./scripts/seed');
        await seedDatabase(false);
      } catch (seedErr) {
        console.warn('[Bootstrap] Auto-seed warning:', seedErr);
      }
    }

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 Political Poster Backend running at http://localhost:${PORT}`);
      console.log(`📡 API Endpoints available at http://localhost:${PORT}/api`);
      console.log(`📂 Static uploads served at http://localhost:${PORT}/uploads`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
