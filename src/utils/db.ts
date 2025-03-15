import Database from '@tauri-apps/plugin-sql';

let db: Database | null = null;

export async function initDatabase() {
  if (!db) {
    db = await Database.load('sqlite:database.db');
  }
  return db;
}

export async function executeQuery(query: string, bindValues: any[] = []) {
  const database = await initDatabase();
  return await database.execute(query, bindValues);
}

export async function select<T>(query: string, bindValues: any[] = []): Promise<T[]> {
  const database = await initDatabase();
  const result = await database.select<T>(query, bindValues);
  return result as T[];
}
