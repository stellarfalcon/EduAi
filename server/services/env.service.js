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
      port: parseInt(process.env.PORT) || 5000,
      jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
      geminiApiKey: process.env.GEMINI_API_KEY,
      db: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || 'postgres',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '68NITec@2011',
        schema: process.env.DB_SCHEMA || 'edu_platform'
      },
      nodeEnv: process.env.NODE_ENV || 'development'
    };
  }
}

export default EnvironmentService;