import { createClient } from '@libsql/client';
import fs from 'fs';
import 'dotenv/config';

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

const sql = fs.readFileSync('schema.sql', 'utf-8');
// Split by semicolon that is at the end of a statement (rudimentary split)
const statements = sql.split(/;\s*$/m).filter(s => s.trim().length > 0);

async function run() {
  console.log(`Executing ${statements.length} statements on Turso...`);
  for (const statement of statements) {
    if (statement.trim() === '') continue;
    try {
      await client.execute(statement);
    } catch(e) {
      console.log('Error on statement:', statement);
      console.error(e);
      process.exit(1);
    }
  }
  console.log('Done pushing schema to Turso!');
}
run();
