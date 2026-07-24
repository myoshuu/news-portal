// Bun automatically loads .env from the working directory — no dotenv import needed.
export const env = {
  PORT: parseInt(process.env.PORT || "5000", 10),
  MONGODB_URI:
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017/news-portal",
  JWT_SECRET: process.env.JWT_SECRET || "fallback_secret_change_me",
};
