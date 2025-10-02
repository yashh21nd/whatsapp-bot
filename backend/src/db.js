import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Open connection to SQLite database
export const db = await open({
  filename: process.env.DB_FILE || "./whatsapp.db",
  driver: sqlite3.Database,
});

// Create tables if not exists
await db.exec(`
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chatId TEXT,
  sender TEXT,
  receiver TEXT,
  body TEXT,
  direction TEXT, -- 'in' or 'out'
  source TEXT,    -- 'rule', 'llm', 'manual', 'incoming'
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  pattern TEXT,
  isRegex INTEGER DEFAULT 0,
  reply TEXT,
  active INTEGER DEFAULT 1,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  otp TEXT,
  otpExpires DATETIME,
  otpType TEXT,
  isVerified INTEGER DEFAULT 0,
  subscription TEXT DEFAULT 'free',
  subscriptionExpires DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);
