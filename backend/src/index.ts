import express from 'express';
import cors from 'cors';
import { partRoutes } from './routes/parts';
import { compatibilityProfileRoutes } from './routes/compatibility-profiles';
import { buildRoutes } from './routes/builds';
import { buildItemRoutes } from './routes/build-items';

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/parts', partRoutes);
app.use('/builds', buildRoutes);
// Legacy routes (kept for backward compatibility if needed)
app.use('/api/parts', partRoutes);
app.use('/api/compatibility-profiles', compatibilityProfileRoutes);
app.use('/api/builds', buildRoutes);
app.use('/api/build-items', buildItemRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

