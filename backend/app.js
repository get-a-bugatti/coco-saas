const express = require("express");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  })
);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(`[Error] ${statusCode} - ${message}`);
  console.error(err.stack); // Log full stack trace for debugging

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
    // Only expose stack traces in development mode
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});
