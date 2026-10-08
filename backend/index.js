require("./config/dotenv.js");
const { app } = require("./app.js");
const { connectDb, disconnectDb } = require("./db/index.js");
const http = require("http");

let httpServer;
const port = process.env.PORT || 8000;

const startServer = async () => {
  try {
    let dbClient = await connectDb();

    console.log("Database connection succeeded. Client :", dbClient);

    httpServer = http.createServer(app);

    httpServer.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });

    httpServer.on("error", (err) => {
      console.error("Server Error:", err);
      process.exit(1);
    });
  } catch (error) {
    console.error("Startup Error:", error);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal) => {
  console.log(`${signal} received. Starting graceful shutdown...`);

  try {
    // Stop accepting new connections
    await new Promise((resolve, reject) => {
      httpServer.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    console.log("HTTP server closed.");

    // Close Sequelize connection pool
    await disconnectDb();

    console.log("Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

startServer();
