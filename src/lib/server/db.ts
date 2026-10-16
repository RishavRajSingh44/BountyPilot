import 'server-only';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { dataDirectory } from './config';

export function openDatabase(file = process.env.DATABASE_PATH || resolve(dataDirectory(), 'bountypilot.sqlite')) {
  const path = resolve(file);
  mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path, { timeout: 1000 });
  try {
    db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;');
    const { user_version: version } = db.prepare('PRAGMA user_version').get() as { user_version: number };
    if (version > 1) throw new Error('Database schema is newer than this application');
    if (version === 0) {
      db.exec('BEGIN IMMEDIATE');
      try {
        db.exec(readFileSync(resolve('migrations/001_initial.sql'), 'utf8'));
        db.exec('PRAGMA user_version=1; COMMIT');
      } catch (error) { db.exec('ROLLBACK'); throw error; }
    }
    return db;
  } catch (error) { db.close(); throw error; }
}

let connection: DatabaseSync | undefined;
export function database() { return connection ??= openDatabase(); }
