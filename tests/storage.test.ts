import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Snapshot } from '@/lib/schemas';
import { githubIssue } from './fixtures/github';
let directory:string;
let store:typeof import('@/lib/server/db');
beforeEach(async()=>{
  vi.resetModules();mkdirSync('.cache',{recursive:true});directory=mkdtempSync(resolve('.cache','storage test-'));vi.stubEnv('DATABASE_PATH',resolve(directory,'test.sqlite'));store=await import('@/lib/server/db');
});
afterEach(()=>{store.database().close();vi.unstubAllGlobals();vi.unstubAllEnvs();rmSync(directory,{recursive:true,force:true});});
const comment=(id:number,body='Synthetic discussion')=>({id,body,updated_at:'2026-10-16T00:00:00Z',user:{login:'synthetic-author'},author_association:'NONE'});
async function retrieve(comments=0, pages:Record<string,unknown>={}) {
  vi.stubGlobal('fetch',vi.fn().mockImplementation(async(url:string)=>{
    const path=new URL(url).pathname;
    if(path.endsWith('/comments')) return Response.json(pages[new URL(url).searchParams.get('page')!] || []);
    return Response.json(path.endsWith('/issues/7')?{...githubIssue,comments}:{private:false,archived:false,language:'TypeScript'});
  }));
  const {refreshOpportunity}=await import('@/lib/server/opportunities');return refreshOpportunity({owner:'synthetic-owner',repo:'fixture',number:7});
}
function clone(snapshot:Snapshot,id:number) { const copy=structuredClone(snapshot);copy.issue.id=String(id);copy.issue.number=id+10000;copy.issue.url=`https://github.com/synthetic-owner/fixture/issues/${copy.issue.number}`;copy.hash=`synthetic-${id}`;return copy; }

describe('retrieval and source preservation',()=>{
  it('retrieves tail comments, preserves exact source quotes and explicit incomplete coverage',async()=>{
    const detail=await retrieve(101,{'1':Array.from({length:100},(_,i)=>comment(i+1)),'2':[comment(101,'Reward withdrawn; no bounty remains.')]});
    expect(detail.coverage).toMatchObject({commentsFetched:100,commentsComplete:false});expect(detail.sources.filter(s=>s.kind==='comment')[0].id).toBe('comment:2');expect(detail.paidEvidence.state).toBe('conflicting');
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(4);
    const {refreshOpportunity}=await import('@/lib/server/opportunities');const again=await refreshOpportunity({owner:'synthetic-owner',repo:'fixture',number:7});expect(again.snapshotHash).toBe(detail.snapshotHash);
  });
  it.each([0,1,100,200,201])('bounds comment calls at reported count %s',async(count)=>{
    const last=Math.ceil(count/100);const lastSize=count?((count-1)%100)+1:0;const pages:Record<string,unknown>={};
    if(last){pages[String(last)]=Array.from({length:lastSize},(_,i)=>comment((last-1)*100+i+1));if(last>1&&lastSize<100)pages[String(last-1)]=Array.from({length:100},(_,i)=>comment((last-2)*100+i+1));}
    const detail=await retrieve(count,pages);expect(detail.coverage.commentsFetched).toBe(Math.min(count,100));expect(vi.mocked(fetch).mock.calls.length).toBeLessThanOrEqual(4);
  });
  it('flags a count race and enforces the 512 KiB byte budget with Unicode',async()=>{
    const partial=await retrieve(5,{'1':[comment(1)]});expect(partial.coverage.commentsComplete).toBe(false);expect(partial.coverage.fetchWarnings.join(' ')).toMatch(/changed/);
    const large=await retrieve(100,{'1':Array.from({length:100},(_,i)=>comment(i+1,'€'.repeat(2000)))});const snapshot=store.getSnapshot(large.id)!;
    expect(Buffer.byteLength(JSON.stringify(snapshot))).toBeLessThanOrEqual(512*1024);expect(large.coverage.sourceTruncated).toBe(true);
  });
  it('does not overwrite a good snapshot when discussion retrieval fails',async()=>{
    const first=await retrieve();vi.stubGlobal('fetch',vi.fn().mockImplementation(async(url:string)=>new URL(url).pathname.endsWith('/issues/7')?Response.json({...githubIssue,comments:1}):new URL(url).pathname.endsWith('/comments')?new Response('',{status:503}):Response.json({private:false,archived:false,language:null})));
    const {refreshOpportunity}=await import('@/lib/server/opportunities');await expect(refreshOpportunity({owner:'synthetic-owner',repo:'fixture',number:7})).rejects.toMatchObject({status:502});expect(store.getSnapshot(first.id)?.hash).toBe(first.snapshotHash);
  });
  it('rejects private repositories before fetching an issue, and rejects PRs',async()=>{
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue(Response.json({private:true,archived:false,language:null})));
    const {refreshOpportunity}=await import('@/lib/server/opportunities');await expect(refreshOpportunity({owner:'synthetic-owner',repo:'fixture',number:7})).rejects.toMatchObject({status:422});expect(fetch).toHaveBeenCalledTimes(1);
    vi.stubGlobal('fetch',vi.fn().mockImplementation(async(url:string)=>Response.json(new URL(url).pathname.endsWith('/issues/7')?{...githubIssue,pull_request:{}}:{private:false,archived:false,language:null})));
    await expect(refreshOpportunity({owner:'synthetic-owner',repo:'fixture',number:7})).rejects.toMatchObject({code:'PULL_REQUEST'});
  });
});

describe('saved pipeline',()=>{
  it('saves idempotently, preserves status/timestamps, unsaves locally and lists metadata only',async()=>{
    const detail=await retrieve();const saved=store.saveOpportunity(detail.id);store.updateSaved(detail.id,'pursuing');const repeated=store.saveOpportunity(detail.id);
    expect(repeated.status).toBe('pursuing');expect(repeated.savedAt).toBe(saved.savedAt);expect(store.listSaved()).toHaveLength(1);expect(store.listSaved()[0]).not.toHaveProperty('sources');
    store.unsaveOpportunity(detail.id);store.unsaveOpportunity(detail.id);expect(store.listSaved()).toEqual([]);expect(store.getSnapshot(detail.id)).not.toBeNull();
  });
  it('caps saved rows at 500 without evicting saved evidence or rejecting repeat saves',async()=>{
    const detail=await retrieve();const snapshot=store.getSnapshot(detail.id)!;
    for(let i=1;i<=500;i++){store.storeSnapshot(clone(snapshot,i));store.saveOpportunity(String(i));}
    store.storeSnapshot(clone(snapshot,501));expect(()=>store.saveOpportunity('501')).toThrow('500');expect(store.saveOpportunity('1').status).toBe('saved');expect(store.listSaved()).toHaveLength(500);expect(store.getSnapshot('1')).not.toBeNull();
  });
  it('prunes unsaved cache only, and rolls back identity conflicts',async()=>{
    const detail=await retrieve();const snapshot=store.getSnapshot(detail.id)!;store.saveOpportunity(detail.id);
    for(let i=1000;i<1501;i++)store.storeSnapshot(clone(snapshot,i));
    expect(store.database().prepare('SELECT count(*) AS n FROM opportunities').get()?.n).toBe(501);expect(store.getSnapshot(detail.id)).not.toBeNull();
    const conflict=clone(snapshot,999);conflict.issue.number=7;expect(()=>store.storeSnapshot(conflict)).toThrow();expect(store.getSnapshot(detail.id)?.hash).toBe(snapshot.hash);expect(store.getSnapshot('999')).toBeNull();
  });
  it('validates API JSON, body limit, IDs and status without touching real user data',async()=>{
    const detail=await retrieve();const routes=await import('@/app/api/saved/[issueId]/route');const context={params:Promise.resolve({issueId:detail.id})};
    const req=(body:string)=>new Request('http://127.0.0.1:3000/api/saved/123',{method:'PUT',headers:{'content-type':'application/json'},body});
    expect((await routes.PUT(req('{}'),context)).status).toBe(200);expect((await routes.PUT(req('{'),context)).status).toBe(400);expect((await routes.PUT(req(JSON.stringify({padding:'x'.repeat(9000)})),context)).status).toBe(413);
    expect((await routes.PATCH(req('{"status":"paid"}'),context)).status).toBe(400);expect((await routes.PUT(req('{}'),{params:Promise.resolve({issueId:'bad-id'})})).status).toBe(400);
    expect(store.getSaved(detail.id)?.status).toBe('saved');
  });
});
