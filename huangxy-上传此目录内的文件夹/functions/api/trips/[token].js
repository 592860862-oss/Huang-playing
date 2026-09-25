// Link possession permits checklist changes. Only whitelisted published item IDs are writable.
export async function onRequest({request,env,params}){
 const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'};
 const answer=(x,status=200)=>new Response(JSON.stringify(x),{status,headers});
 const token=params.token;if(!/^[a-zA-Z0-9_-]{20,80}$/.test(token))return answer({error:'分享不存在'},404);
 const url=new URL(request.url);
 const asset=await env.ASSETS.fetch(new Request(new URL('/trips/'+token+'/state.json',url)));
 if(!asset.ok)return answer({error:'分享不存在或已撤回'},404);
 let trip;try{trip=await asset.json()}catch{return answer({error:'分享数据无效'},500)}
 if(!env.VOYAGE_DB)return answer({error:'尚未连接共享清单数据库'},503);
 if(request.method==='POST'){
  if(request.headers.get('Origin')&&request.headers.get('Origin')!==url.origin)return answer({error:'来源不允许'},403);
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))return answer({error:'格式不正确'},415);
  const raw=await request.text();if(raw.length>2048)return answer({error:'请求过大'},413);
  let patch;try{patch=JSON.parse(raw)}catch{return answer({error:'格式不正确'},400)}
  if(typeof patch.done!=='boolean'||!trip.checklist.some(x=>x.id===patch.id))return answer({error:'待办不存在'},400);
  await env.VOYAGE_DB.prepare('INSERT INTO todo(trip,item,done,updated) VALUES(?,?,?,?) ON CONFLICT(trip,item) DO UPDATE SET done=excluded.done,updated=excluded.updated').bind(token,patch.id,patch.done?1:0,Date.now()).run();
 }else if(request.method!=='GET')return answer({error:'方法不允许'},405);
 const rows=await env.VOYAGE_DB.prepare('SELECT item,done,updated FROM todo WHERE trip=?').bind(token).all();
 const byId=new Map(rows.results.map(x=>[x.item,x]));
 return answer({version:trip.version,checklist:trip.checklist.map(x=>({...x,done:byId.has(x.id)?!!byId.get(x.id).done:!!x.done}))});
}
