const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const fs = require("fs");
const https = require("https");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/userRoutes");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(helmet());
// app.use(cors({
//     origin: 'http://your-frontend-domain.com',
//     credentials: true
//   }));
app.use(cors());
app.use(
  "/api/",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later",
  })
);

// Routes
app.use("/api/users", userRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// Start server
if (process.env.NODE_ENV === "production") {
  const privateKey = fs.readFileSync("/path/to/your/private.key", "utf8");
  const certificate = fs.readFileSync("/path/to/your/certificate.crt", "utf8");
  const ca = fs.readFileSync("/path/to/your/ca_bundle.crt", "utf8");

  const credentials = { key: privateKey, cert: certificate, ca: ca };

  https.createServer(credentials, app).listen(port, () => {
    console.log(`Server running in production mode on port ${port} with HTTPS`);
  });
} else {
  app.listen(port, () => {
    console.log(`Server running in development mode on port ${port} with HTTP`);
  });
}
