import express from 'express';

// The former API stored accounts and portal data in a local JSON file and exposed
// unauthenticated read/write endpoints. Supabase Auth + Postgres RLS is now the
// only supported data path, so reject all legacy API routes by default.
export const app = express();

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', persistence: 'supabase_auth_and_postgres_rls' });
});

app.use('/api', (_req, res) => {
  res.status(410).json({
    error: 'Legacy API disabled. Authenticate with Supabase and use the protected Supabase Data API.'
  });
});
