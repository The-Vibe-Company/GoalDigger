import 'dotenv/config';
import express from 'express';

const app = express();
app.use(express.json());

// Dynamically load Vercel-style handlers
async function wrap(handlerPath: string) {
  const mod = await import(handlerPath);
  return (req: express.Request, res: express.Response) => {
    // Map express req/res to Vercel-like shape (compatible enough)
    mod.default(req, res);
  };
}

async function start() {
  app.post('/api/auth/signup', await wrap('./api/auth/signup'));
  app.post('/api/auth/login', await wrap('./api/auth/login'));
  app.get('/api/auth/session', await wrap('./api/auth/session'));
  app.get('/api/goals', await wrap('./api/goals/index'));
  app.post('/api/goals', await wrap('./api/goals/index'));
  app.delete('/api/goals/:id', await wrap('./api/goals/[id]'));
  app.patch('/api/goals/:id', await wrap('./api/goals/[id]'));
  app.get('/api/entries/:goalId', await wrap('./api/entries/[goalId]'));
  app.post('/api/entries/:goalId', await wrap('./api/entries/[goalId]'));

  app.listen(3101, () => {
    console.log('API dev server running on http://localhost:3101');
  });
}

start();
