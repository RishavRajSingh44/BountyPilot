'use client';
import { useState } from 'react';
import type { OpportunityDetail as Detail, SavedRecord } from '@/lib/schemas';
import { requestData } from '@/lib/client';
import { EvidencePanel } from './EvidencePanel';
import { ScoreDetails } from './OpportunityCard';
export function OpportunityDetail({ identity, initial }: { identity:{owner:string;repo:string;number:number}; initial:Detail|null }) {
  const [detail,setDetail]=useState(initial); const [busy,setBusy]=useState(''); const [error,setError]=useState('');
  async function refresh() {
    setBusy('refresh');setError('');
    try { setDetail(await requestData<Detail>('/api/opportunities/refresh',{method:'POST',body:JSON.stringify(identity)})); }
    catch(e) { setError(e instanceof Error ? e.message : 'Refresh failed; prior data is preserved.'); }
    finally { setBusy(''); }
  }
  async function save() {
    if (!detail) return;setBusy('save');setError('');
    try {
      if (detail.saved) { await requestData(`/api/saved/${detail.id}`,{method:'DELETE'});setDetail({...detail,saved:null}); }
      else { const saved=await requestData<SavedRecord>(`/api/saved/${detail.id}`,{method:'PUT',body:'{}'});setDetail({...detail,saved}); }
    } catch(e) { setError(e instanceof Error ? e.message : 'Save failed.'); } finally { setBusy(''); }
  }
  return <><h1>{detail?.title || `${identity.owner}/${identity.repo} #${identity.number}`}</h1><div className="row"><button disabled={Boolean(busy)} onClick={()=>void refresh()}>{busy==='refresh'?'Retrieving…':detail?'Refresh from GitHub':'Load issue from GitHub'}</button>{detail && <button disabled={Boolean(busy)} onClick={()=>void save()}>{busy==='save'?'Saving…':detail.saved?'Remove from pipeline':'Save opportunity'}</button>}</div><p role="status" aria-live="polite" className="error">{error}</p>
    {detail && <><p>{detail.owner}/{detail.repo} #{detail.number} · {detail.state} · {detail.assignees.length ? `Assigned: ${detail.assignees.join(', ')}` : 'No assignees'} · language {detail.repository.language || 'unknown'}</p>{(detail.state==='closed'||detail.repository.archived) && <p className="notice">This issue is closed or its repository is archived. It is not ranked as available work.</p>}<p>Snapshot as of {detail.fetchedAt}. Refresh to check for changed terms. {detail.saved ? `Pipeline status: ${detail.saved.status}.` : 'Not saved.'}</p><ScoreDetails score={detail.score}/><p><a href={detail.url} target="_blank" rel="noreferrer">Original GitHub issue</a></p><EvidencePanel detail={detail}/><section><h2>Local analysis</h2><p>Grounded Gemma analysis arrives in milestone M4. Evidence and saving work independently of AI.</p></section></>}
  </>;
}
