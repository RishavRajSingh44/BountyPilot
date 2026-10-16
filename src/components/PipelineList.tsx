'use client';
import Link from 'next/link';
import { useState } from 'react';
import { savedStatus, type SavedRecord, type SavedSummary } from '@/lib/schemas';
import { requestData } from '@/lib/client';
export function PipelineList({initial}:{initial:SavedSummary[]}) {
  const [items,setItems]=useState(initial);const [busy,setBusy]=useState('');const [error,setError]=useState('');
  async function change(id:string,status?:string) {
    setBusy(id);setError('');
    try {
      if (status) { const record=await requestData<SavedRecord>(`/api/saved/${id}`,{method:'PATCH',body:JSON.stringify({status})});setItems(items=>items.map(item=>item.id===id?{...item,status:record.status,updatedAt:record.updatedAt}:item)); }
      else { await requestData(`/api/saved/${id}`,{method:'DELETE'});setItems(items=>items.filter(item=>item.id!==id)); }
    } catch(e) { setError(e instanceof Error?e.message:'Pipeline update failed.'); } finally { setBusy(''); }
  }
  return <><p>Saved on this computer. GitHub is checked only when you explicitly refresh a detail; no AI or network connection is required to read this list.</p><p role="status" aria-live="polite" className="error">{error}</p>{!items.length && <p>No saved opportunities yet. <Link href="/">Search GitHub</Link> and save one after reviewing the evidence.</p>}{items.map(item=><article key={item.id}><h2><Link href={`/opportunities/${item.owner}/${item.repo}/${item.number}`}>{item.title}</Link></h2><p>{item.owner}/{item.repo} #{item.number} · {item.state} · Payment evidence: {item.paidState.replaceAll('_',' ')} (unverified)</p><p className="muted">Source fetched {item.fetchedAt}. {item.analysisAt?`Last analysis: ${item.analysisAt}`:'No successful analysis saved.'}</p><div className="row"><label>Status for #{item.number}<select aria-label={`Status for ${item.title}`} disabled={Boolean(busy)} value={item.status} onChange={e=>void change(item.id,e.target.value)}>{savedStatus.options.map(status=><option key={status} value={status}>{status}</option>)}</select></label><button disabled={Boolean(busy)} onClick={()=>void change(item.id)}>Remove from pipeline</button></div></article>)}</>;
}
