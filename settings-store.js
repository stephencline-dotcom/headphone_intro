const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const DEFAULT_SETTINGS = {
  teacherControlDefault: true,
  spokenDirectionsEnabled: true
};

const LOCAL_SETTINGS_FILE = path.join(__dirname, "data", "settings.json");

let pool = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false
  });
}

function normalizeSettings(settings = {}) {
  return {
    teacherControlDefault:
      typeof settings.teacherControlDefault === "boolean"
        ? settings.teacherControlDefault
        : DEFAULT_SETTINGS.teacherControlDefault,

    spokenDirectionsEnabled:
      typeof settings.spokenDirectionsEnabled === "boolean"
        ? settings.spokenDirectionsEnabled
        : DEFAULT_SETTINGS.spokenDirectionsEnabled
  };
}

async function ensureDatabase() {
  if (!pool) {
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_settings (
      id INTEGER PRIMARY KEY,
      settings JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(
    `
      INSERT INTO app_settings (id, settings)
      VALUES (1, $1::jsonb)
      ON CONFLICT (id) DO NOTHING
    `,
    [JSON.stringify(DEFAULT_SETTINGS)]
  );
}

function readLocalSettings() {
  try {
    const raw = fs.readFileSync(LOCAL_SETTINGS_FILE, "utf8");
    return normalizeSettings(JSON.parse(raw));
  } catch (error) {
    fs.mkdirSync(path.dirname(LOCAL_SETTINGS_FILE), {
      recursive: true
    });

    fs.writeFileSync(
      LOCAL_SETTINGS_FILE,
      JSON.stringify(DEFAULT_SETTINGS, null, 2) + "\n"
    );

    return { ...DEFAULT_SETTINGS };
  }
}

function writeLocalSettings(settings) {
  const normalized = normalizeSettings(settings);

  fs.mkdirSync(path.dirname(LOCAL_SETTINGS_FILE), {
    recursive: true
  });

  fs.writeFileSync(
    LOCAL_SETTINGS_FILE,
    JSON.stringify(normalized, null, 2) + "\n"
  );

  return normalized;
}

async function getSettings() {
  if (!pool) {
    return readLocalSettings();
  }

  await ensureDatabase();

  const result = await pool.query(
    "SELECT settings FROM app_settings WHERE id = 1"
  );

  return normalizeSettings(result.rows[0]?.settings);
}

async function saveSettings(changes) {
  const current = await getSettings();

  const next = normalizeSettings({
    ...current,
    ...changes
  });

  if (!pool) {
    return writeLocalSettings(next);
  }

  await ensureDatabase();

  await pool.query(
    `
      INSERT INTO app_settings (id, settings, updated_at)
      VALUES (1, $1::jsonb, NOW())
      ON CONFLICT (id)
      DO UPDATE SET
        settings = EXCLUDED.settings,
        updated_at = NOW()
    `,
    [JSON.stringify(next)]
  );

  return next;
}

function getStorageMode() {
  return pool ? "postgres" : "local-json";
}

module.exports = {
  getSettings,
  saveSettings,
  getStorageMode
};
