// sync-db.js
const models = require("../../../db/models"); // Adjust path if your models index is elsewhere
const { sequelize } = models;

async function syncDatabase() {
  try {
    console.log("Connecting to PostgreSQL...");
    await sequelize.authenticate();
    console.log("Connection successful.");

    console.log("Syncing models and associations to database...");
    // force: true drops existing tables and builds fresh schemas with all foreign keys
    await models.Organization.sync();
    await models.Role.sync();
    await sequelize.sync({ force: true });

    console.log("Schema successfully applied to local PostgreSQL!");
    process.exit(0);
  } catch (error) {
    console.error("Failed to sync database:", error);
    process.exit(1);
  }
}

syncDatabase();
