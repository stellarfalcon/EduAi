import dotenv from 'dotenv';
dotenv.config();  // Ensure env is loaded even if index.js hasn't yet

class EnvironmentService {
  static validateEnv() {
    const requiredEnvVars = [
      'PORT',
      'JWT_SECRET',
      'GEMINI_API_KEY',
      'DB_HOST',
      'DB_PORT',
      'DB_NAME',
      'DB_USER',
      'DB_PASSWORD',
      'DB_SCHEMA'
    ];

    const missingEnvVars = requiredEnvVars.filter(
      envVar => !process.env[envVar]
    );

    if (missingEnvVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingEnvVars.join(', ')}`
      );
    }

    // Validate port is a number
    const port = parseInt(process.env.PORT);
    if (isNaN(port)) {
      throw new Error('PORT must be a valid number');
    }

    // Validate database port is a number
    const dbPort = parseInt(process.env.DB_PORT);
    if (isNaN(dbPort)) {
      throw new Error('DB_PORT must be a valid number');
    }

    return true;
  }

  static getEnvWithDefaults() {
    return {
      port: parseInt(process.env.PORT),
      jwtSecret: process.env.JWT_SECRET,
      geminiApiKey: process.env.GEMINI_API_KEY,
      db: {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        schema: process.env.DB_SCHEMA
      },
      nodeEnv: process.env.NODE_ENV || 'development'
    };
  }
}

export default EnvironmentService;