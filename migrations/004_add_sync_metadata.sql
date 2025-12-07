CREATE TABLE IF NOT EXISTS sync_metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL -- Unix timestamp
);

CREATE INDEX IF NOT EXISTS idx_sync_metadata_key ON sync_metadata(key);

CREATE TABLE IF NOT EXISTS sync_conflicts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  local_version TEXT NOT NULL, -- JSON
  remote_version TEXT NOT NULL, -- JSON
  conflict_type TEXT NOT NULL, -- 'pull_conflict', 'push_conflict', 'field_mismatch'
  resolved INTEGER DEFAULT 0, -- Boolean: 0 = unresolved, 1 = resolved
  resolution_choice TEXT, -- 'local', 'remote', 'merged'
  resolved_at INTEGER, -- Unix timestamp
  timestamp INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Indexes for sync_conflicts
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_resolved ON sync_conflicts(resolved);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_table_record ON sync_conflicts(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_timestamp ON sync_conflicts(timestamp DESC);