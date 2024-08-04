const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const fs = require("fs");
const https = require("https");
const cookieParser = require("cookie-parser");
const session = require("./config/session");
const sessionTimeout = require("./middleware/sessionTimeout");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const customerRoutes = require("./routes/customerRoutes");
const roleRoutes = require("./routes/roleRoutes");
const permissionRoutes = require("./routes/permissionRoutes");
const roleAssignmentRoutes = require("./routes/roleAssignmentRoutes");

require("dotenv").config();

const app = express();

const port = process.env.PORT || 3000;
const apiVersion = process.env.API_VERSION || "v1";

// Middleware
app.use(bodyParser.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(helmet());
app.use(cors());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later",
  })
);

// Session middleware
app.use(session);

// Apply session timeout middleware to protected routes
app.use(sessionTimeout);

// Routes
// app.use("/api/users", userRoutes);
// app.use("/api/admins", adminRoutes);
// app.use("/api/customers", customerRoutes);
// app.use("/api/roles", roleRoutes);
// app.use("/api/roleAssignments", roleAssignmentRoutes);
// app.use("/api/permissions", permissionRoutes);

app.use(`/api/${apiVersion}/users`, userRoutes);
app.use(`/api/${apiVersion}/admins`, adminRoutes);
app.use(`/api/${apiVersion}/customers`, customerRoutes);
app.use(`/api/${apiVersion}/roles`, roleRoutes);
app.use(`/api/${apiVersion}/roleAssignments`, roleAssignmentRoutes);
app.use(`/api/${apiVersion}/permissions`, permissionRoutes);

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

app.get("/set-session", (req, res) => {
  req.session.test = "Session is working!";
  res.send("Session variable set!");
});

app.get("/get-session", (req, res) => {
  if (req.session.test) {
    res.send(`Session value: ${req.session.test}`);
  } else {
    res.send("No session value found");
  }
});
