import 'server-only';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { dataDirectory } from './config';
import { AppError } from './errors';
import {
  savedStatus,
  type SavedRecord,
  type SavedSummary,
  type Snapshot,
  type AnalysisRecord
} from '@/lib/schemas';

export function openDatabase(
  file = process.env.DATABASE_PATH || resolve(dataDirectory(), 'bountypilot.sqlite')
) {
  const path = resolve(file);
  mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path, { timeout: 1000 });
  try {
    const { user_version: version } = db.prepare('PRAGMA user_version').get() as {
      user_version: number;
    };
    if (version > 1) throw new Error('Database schema is newer than this application');
    db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;');
    if (version === 0) {
      db.exec('BEGIN IMMEDIATE');
      try {
        db.exec(readFileSync(resolve('migrations/001_initial.sql'), 'utf8'));
        db.exec('PRAGMA user_version=1; COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    }
    return db;
  } catch (error) {
    db.close();
    throw error;
  }
}

let connection: DatabaseSync | undefined;
export function database() {
  return (connection ??= openDatabase());
}

function transaction<T>(action: () => T): T {
  const db = database();
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = action();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}
function pruneUnsaved(current: string) {
  const db = database();
  const keep =
    !getSaved(current) &&
    db.prepare('SELECT 1 FROM opportunities WHERE github_issue_id=?').get(current)
      ? 499
      : 500;
  db.prepare(
    `DELETE FROM opportunities WHERE github_issue_id IN (
    SELECT github_issue_id FROM opportunities WHERE github_issue_id != ?
    AND github_issue_id NOT IN (SELECT opportunity_id FROM saved_opportunities)
    ORDER BY fetched_at DESC, github_issue_id DESC LIMIT -1 OFFSET ?
  )`
  ).run(current, keep);
}
export function storeSnapshot(snapshot: Snapshot) {
  const issue = snapshot.issue;
  transaction(() => {
    database()
      .prepare(
        `INSERT INTO opportunities VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(github_issue_id) DO UPDATE SET
      owner=excluded.owner, repo=excluded.repo, issue_number=excluded.issue_number, github_url=excluded.github_url,
      title=excluded.title, state=excluded.state, snapshot_json=excluded.snapshot_json, snapshot_hash=excluded.snapshot_hash, fetched_at=excluded.fetched_at
    `
      )
      .run(
        issue.id,
        issue.owner,
        issue.repo,
        issue.number,
        issue.url,
        issue.title,
        issue.state,
        JSON.stringify(snapshot),
        snapshot.hash,
        snapshot.fetchedAt
      );
    pruneUnsaved(issue.id);
  });
}
export function getSnapshot(id: string): Snapshot | null {
  const row = database()
    .prepare('SELECT snapshot_json FROM opportunities WHERE github_issue_id=?')
    .get(id);
  return row ? (JSON.parse(String(row.snapshot_json)) as Snapshot) : null;
}
export function snapshotByIdentity(owner: string, repo: string, number: number): Snapshot | null {
  const row = database()
    .prepare('SELECT snapshot_json FROM opportunities WHERE owner=? AND repo=? AND issue_number=?')
    .get(owner, repo, number);
  return row ? (JSON.parse(String(row.snapshot_json)) as Snapshot) : null;
}
export function getSaved(id: string): SavedRecord | null {
  const row = database()
    .prepare(
      'SELECT opportunity_id AS opportunityId,status,saved_at AS savedAt,updated_at AS updatedAt FROM saved_opportunities WHERE opportunity_id=?'
    )
    .get(id);
  return row ? ({ ...row } as SavedRecord) : null;
}
export function saveOpportunity(id: string): SavedRecord {
  return transaction(() => {
    if (!getSnapshot(id))
      throw new AppError('NOT_FOUND', 'Retrieve this issue before saving it.', 404);
    const existing = getSaved(id);
    if (existing) return existing;
    if (Number(database().prepare('SELECT count(*) AS n FROM saved_opportunities').get()?.n) >= 500)
      throw new AppError(
        'SAVED_LIMIT',
        'The pipeline holds up to 500 opportunities. Remove one before saving another.',
        409
      );
    const now = new Date().toISOString();
    database()
      .prepare('INSERT INTO saved_opportunities VALUES (?,?,?,?)')
      .run(id, 'saved', now, now);
    return getSaved(id)!;
  });
}
export function updateSaved(id: string, status: string): SavedRecord {
  savedStatus.parse(status);
  if (!getSaved(id)) throw new AppError('NOT_FOUND', 'This opportunity is not saved.', 404);
  database()
    .prepare('UPDATE saved_opportunities SET status=?,updated_at=? WHERE opportunity_id=?')
    .run(status, new Date().toISOString(), id);
  return getSaved(id)!;
}
export function unsaveOpportunity(id: string) {
  transaction(() => {
    database().prepare('DELETE FROM saved_opportunities WHERE opportunity_id=?').run(id);
    pruneUnsaved(id);
  });
}
export function listSaved(): SavedSummary[] {
  // Read list metadata only; do not send up to 500 full discussion snapshots.
  return database()
    .prepare(
      `SELECT o.github_issue_id AS id,o.owner,o.repo,o.issue_number AS number,o.github_url AS url,o.title,o.state,o.fetched_at AS fetchedAt,
    COALESCE(json_extract(o.snapshot_json,'$.evidence.state'),'unknown') AS paidState,s.status,s.saved_at AS savedAt,s.updated_at AS updatedAt,a.generated_at AS analysisAt
    FROM saved_opportunities s JOIN opportunities o ON o.github_issue_id=s.opportunity_id LEFT JOIN analyses a ON a.opportunity_id=o.github_issue_id
    ORDER BY s.updated_at DESC,o.github_issue_id ASC LIMIT 500`
    )
    .all()
    .map((row) => ({ ...row })) as unknown as SavedSummary[];
}
export function workspaceOverview() {
  const counts = database()
    .prepare(
      `SELECT count(*) AS retrieved,
    sum(CASE WHEN json_extract(snapshot_json,'$.evidence.state')='claim_found' THEN 1 ELSE 0 END) AS claims FROM opportunities`
    )
    .get()!;
  const recent = database()
    .prepare('SELECT snapshot_json FROM opportunities ORDER BY fetched_at DESC LIMIT 8')
    .all()
    .map((row) => JSON.parse(String(row.snapshot_json)) as Snapshot);
  return {
    retrieved: Number(counts.retrieved),
    claims: Number(counts.claims || 0),
    recent,
    observedAt: Date.now()
  };
}

export function getAnalysis(id: string): AnalysisRecord | null {
  const row = database().prepare('SELECT * FROM analyses WHERE opportunity_id=?').get(id);
  return row
    ? {
        opportunityId: String(row.opportunity_id),
        inputHash: String(row.input_hash),
        snapshotHash: String(row.snapshot_hash),
        sources: JSON.parse(String(row.source_snapshot_json)),
        result: JSON.parse(String(row.result_json)),
        skills: JSON.parse(String(row.skills_json)),
        modelTag: String(row.model_tag) as AnalysisRecord['modelTag'],
        modelDigest: String(row.model_digest),
        promptVersion: String(row.prompt_version),
        generatedAt: String(row.generated_at),
        durationMs: Number(row.duration_ms)
      }
    : null;
}
export function storeAnalysis(record: AnalysisRecord) {
  transaction(() => {
    if (getSnapshot(record.opportunityId)?.hash !== record.snapshotHash)
      throw new AppError(
        'SOURCE_CHANGED',
        'Source changed during analysis. Refresh the detail and analyze again; prior result is preserved.',
        409,
        true
      );
    database()
      .prepare(
        `INSERT INTO analyses VALUES (?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(opportunity_id) DO UPDATE SET
      input_hash=excluded.input_hash,snapshot_hash=excluded.snapshot_hash,source_snapshot_json=excluded.source_snapshot_json,
      result_json=excluded.result_json,skills_json=excluded.skills_json,model_tag=excluded.model_tag,model_digest=excluded.model_digest,
      prompt_version=excluded.prompt_version,generated_at=excluded.generated_at,duration_ms=excluded.duration_ms
    `
      )
      .run(
        record.opportunityId,
        record.inputHash,
        record.snapshotHash,
        JSON.stringify(record.sources),
        JSON.stringify(record.result),
        JSON.stringify(record.skills),
        record.modelTag,
        record.modelDigest,
        record.promptVersion,
        record.generatedAt,
        record.durationMs
      );
  });
}
