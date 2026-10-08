const Sequelize = require("sequelize");

let client = null;

const options = {
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: parseInt(process.env.DB_POOL_MAX, 10) || 5,
    min: parseInt(process.env.DB_POOL_MIN, 10) || 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    ssl:
      process.env.DB_SSL === "true"
        ? { require: true, rejectUnauthorized: false }
        : false,
  },
};

export async function connectDb() {
  if (client) return client;

  try {
    client = new Sequelize(process.env.DATABASE_URL, options);
    await client.authenticate();
    return client;
  } catch (error) {
    throw new Error(`Connection to DB failed: ${error.message}`);
  }
}

export async function disconnectDb() {
  try {
    if (client) {
      await client.close();
      client = null;
      console.log("🔌 Database connection closed gracefully.");
    }
  } catch (error) {
    throw new Error(`Failed to close DB connection: ${error.message}`);
  }
}

export function getClient() {
  return client;
}
