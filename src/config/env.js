const dotenv = require("dotenv");

function loadEnv() {
  const result = dotenv.config();
  if (result.error) {
    console.warn("No .env file found; using environment variables if set.");
  }

  const required = ["JWT_SECRET", "MONGODB_URI"];
  required.forEach((key) => {
    if (!process.env[key]) {
      console.warn(`Warning: Missing env var ${key}`);
    }
  });

  process.env.PORT = process.env.PORT || "3000";
}

module.exports = { loadEnv };
