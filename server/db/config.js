import pg from 'pg';
import EnvironmentService from '../services/env.service.js';

const env = EnvironmentService.getEnvWithDefaults();

// Database connection setup
const pool = new pg.Pool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.database,
  user: env.db.user,
  password: env.db.password,
  schema: env.db.schema
});

export default pool;