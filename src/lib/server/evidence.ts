import 'server-only';
import type { Evidence, Issue, Source } from '@/lib/schemas';

const negative = /\b(?:no (?:bounty|reward|payment|compensation|funding)|not (?:paid|funded)|unpaid|(?:reward|funding) withdrawn|bounty (?:withdrawn|cancelled|canceled|claimed)|already (?:paid|claimed)|no longer (?:available|funded))\b/i;
const signal = /\b(?:bount(?:y|ies)|paid|reward|payment|compensat\w*)\b/i;
const amount = /(?:\b(?:USD|EUR|GBP|INR)\s*\d[\d,.]*|[$€£₹]\s*\d[\d,.]*|\d[\d,.]*\s*\b(?:USD|EUR|GBP|INR)\b)/i;
export function issueSources(issue: Issue): Source[] {
  const shared = { url: issue.url, author: issue.author, association: issue.association, updatedAt: issue.updatedAt };
  return [
    { ...shared, id: `issue:${issue.id}:title`, kind: 'title', text: issue.title, truncated: false },
    { ...shared, id: `issue:${issue.id}:body`, kind: 'body', text: issue.body, truncated: issue.bodyTruncated },
    { ...shared, id: `issue:${issue.id}:labels`, kind: 'labels', text: issue.labels.join(', '), truncated: false },
  ];
}
export function paymentEvidence(sources: Source[], coverage: Evidence['coverage']): Evidence {
  const excerpts: Evidence['excerpts'] = []; let claim = false; let conflict = false; let found = false; let textSignal = false;
  const amounts = new Set<string>();
  for (const source of sources) {
    const scanned = source.text.replace(/\b(?:no|missing) (?:compensation|payment|funding|reward) (?:information|details|terms)\b/gi, s => ' '.repeat(s.length));
    const denied = negative.exec(scanned); const cue = signal.exec(scanned); const money = amount.exec(scanned);
    let match: RegExpExecArray | null = denied || cue;
    if (denied) conflict = true;
    if (cue) { found = true; if (source.kind !== 'labels') textSignal = true; }
    if (money && source.kind !== 'labels') {
      const start = Math.max(0, money.index - 120); const span = scanned.slice(start, money.index + money[0].length + 120);
      if (signal.test(span) && !negative.test(span)) {
        claim = true; match = money;
        for (const mention of scanned.matchAll(new RegExp(amount.source, 'gi'))) amounts.add(mention[0].replace(/[\s,]/g, '').toUpperCase());
      }
    }
    if (match && excerpts.length < 8) {
      const offset = Math.max(0, match.index - 70); const quote = source.text.slice(offset, offset + 240);
      excerpts.push({ sourceId: source.id, quote, offset, url: source.url, author: source.author, association: source.association, updatedAt: source.updatedAt });
    }
  }
  return { state: conflict || amounts.size > 1 ? 'conflicting' : claim ? 'claim_found' : found ? 'signal_only' : 'unknown', excerpts, coverage, labelOnly: found && !textSignal };
}
