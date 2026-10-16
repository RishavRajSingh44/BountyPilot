CREATE TABLE opportunities (
  github_issue_id TEXT PRIMARY KEY NOT NULL,
  owner TEXT NOT NULL COLLATE NOCASE,
  repo TEXT NOT NULL COLLATE NOCASE,
  issue_number INTEGER NOT NULL CHECK(issue_number > 0),
  github_url TEXT NOT NULL,
  title TEXT NOT NULL,
  state TEXT NOT NULL CHECK(state IN ('open','closed')),
  snapshot_json TEXT NOT NULL CHECK(json_valid(snapshot_json)),
  snapshot_hash TEXT NOT NULL,
  fetched_at TEXT NOT NULL,
  UNIQUE(owner,repo,issue_number)
) STRICT;
CREATE TABLE analyses (
  opportunity_id TEXT PRIMARY KEY NOT NULL REFERENCES opportunities(github_issue_id) ON DELETE CASCADE,
  input_hash TEXT NOT NULL,
  snapshot_hash TEXT NOT NULL,
  source_snapshot_json TEXT NOT NULL CHECK(json_valid(source_snapshot_json)),
  result_json TEXT NOT NULL CHECK(json_valid(result_json)),
  skills_json TEXT NOT NULL CHECK(json_valid(skills_json)),
  model_tag TEXT NOT NULL,
  model_digest TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  generated_at TEXT NOT NULL,
  duration_ms INTEGER NOT NULL CHECK(duration_ms >= 0)
) STRICT;
CREATE TABLE saved_opportunities (
  opportunity_id TEXT PRIMARY KEY NOT NULL REFERENCES opportunities(github_issue_id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK(status IN ('saved','evaluating','pursuing','archived')),
  saved_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
) STRICT;
CREATE INDEX saved_updated ON saved_opportunities(updated_at, opportunity_id);
CREATE INDEX opportunities_fetched ON opportunities(fetched_at);
