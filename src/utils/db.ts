import Database from '@tauri-apps/plugin-sql';
import { categories, builtInCommands } from '../data/commands';

let db: Database | null = null;

export async function getDb() {
  if (db) return db;
  db = await Database.load('sqlite:oopsassistant.db');
  await initDb(db);
  return db;
}

async function initDb(database: Database) {
  // Create categories table
  await database.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      icon TEXT NOT NULL
    )
  `);

  // Create commands table (merging custom and builtin)
  await database.execute(`
    CREATE TABLE IF NOT EXISTS commands (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      command TEXT NOT NULL,
      description TEXT,
      categoryId TEXT NOT NULL,
      tags TEXT,
      params TEXT,
      is_builtin INTEGER DEFAULT 0,
      copy_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migration: add copy_count column if it doesn't exist (for existing databases)
  try {
    await database.execute('ALTER TABLE commands ADD COLUMN copy_count INTEGER DEFAULT 0');
  } catch {
    // Column already exists, ignore
  }

  // Migration: add created_at column if it doesn't exist
  try {
    await database.execute('ALTER TABLE commands ADD COLUMN created_at DATETIME');
  } catch {
    // Column already exists, ignore
  }

  // Backfill created_at for existing rows that are NULL
  try {
    await database.execute("UPDATE commands SET created_at = datetime('now') WHERE created_at IS NULL");
  } catch {
    // Column doesn't exist yet, ignore
  }

  // Migration: add updated_at column if it doesn't exist
  try {
    await database.execute('ALTER TABLE commands ADD COLUMN updated_at DATETIME');
  } catch {
    // Column already exists, ignore
  }

  // Backfill updated_at for existing rows that are NULL
  try {
    await database.execute("UPDATE commands SET updated_at = created_at WHERE updated_at IS NULL");
  } catch {
    // Column doesn't exist yet, ignore
  }

  // Create trigger to auto-update updated_at on row update (if not exists)
  try {
    await database.execute(`
      CREATE TRIGGER IF NOT EXISTS trg_commands_updated_at
      AFTER UPDATE ON commands
      FOR EACH ROW
      BEGIN
        UPDATE commands SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
      END
    `);
  } catch {
    // Trigger already exists, ignore
  }

  // Create pinned_commands table
  await database.execute(`
    CREATE TABLE IF NOT EXISTS pinned_commands (
      command_id TEXT PRIMARY KEY
    )
  `);

  // Migration: migrate favorites to pinned_commands if exists
  try {
    const tableExists = await database.select<any[]>("SELECT name FROM sqlite_master WHERE type='table' AND name='favorites'");
    if (tableExists.length > 0) {
      await database.execute('INSERT OR IGNORE INTO pinned_commands (command_id) SELECT command_id FROM favorites');
      await database.execute('DROP TABLE favorites');
    }
  } catch (err) {
    console.error('Migration failed:', err);
  }

  // Create copy history table
  await database.execute(`
    CREATE TABLE IF NOT EXISTS copy_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      command_id TEXT NOT NULL,
      command_name TEXT NOT NULL,
      command_text TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed data if empty
  await seedData(database);
}

async function seedData(database: Database) {
  const categoryCount = await database.select<any[]>('SELECT COUNT(*) as count FROM categories');
  if (categoryCount[0].count === 0) {
    for (const cat of categories) {
      await database.execute(
        'INSERT INTO categories (id, name, color, icon) VALUES ($1, $2, $3, $4)',
        [cat.id, cat.name, cat.color, cat.icon]
      );
    }
  }

  const commandCount = await database.select<any[]>('SELECT COUNT(*) as count FROM commands WHERE is_builtin = 1');
  if (commandCount[0].count === 0) {
    for (const cmd of builtInCommands) {
      await database.execute(
        'INSERT INTO commands (id, name, command, description, categoryId, tags, params, is_builtin, copy_count, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, 1, 0, $8, $8)',
        [
          cmd.id,
          cmd.name,
          cmd.command,
          cmd.description,
          cmd.categoryId,
          JSON.stringify(cmd.tags),
          JSON.stringify(cmd.params),
          cmd.createdAt || new Date().toISOString()
        ]
      );
    }
  }
}
