/* 人氣榜與回饋：每週三個榜單投票、回饋表單（資料存在共用資料庫） */
/* ===== 回饋表單：存到共用資料庫，由網站擁有者查看 ===== */
(()=>{
  {const r=new URLSearchParams(location.search).get('report');if(r){$('#fb-shop').value=r;$('#fb-type').value='補充資料'}}
  $('#fb-shop')._opts=()=>SHOPS.map(x=>x.n);$('#fb-type')._opts=()=>['補充資料','資料有誤','位置不對','已歇業','推薦新店'];
  const f=$('#fbform'),msg=$('#fb-msg'),btn=$('#fb-send');let db=null,user=null;
  (async()=>{try{[db,user]=await Promise.all([claude.use('db'),claude.use('user')])}catch(e){}})();
  f.addEventListener('submit',async e=>{
    e.preventDefault();
    const say=t=>{msg.textContent=t};
    if(!db||!user){say(typeof claude==='undefined'?'這是沒有資料庫的版本（例如 GitHub Pages），無法投票或送出回饋，請改用完整互動版：https://claude.ai/artifact/Vg5JBAWt93JmLdWMNWqHUz':(claude.fb?'資料庫連線失敗（'+(claude.err||'未知')+'），請重新整理後再試。':'目前無法送出，請確認已登入 Claude 並有權限開啟此頁面。'));return}
    btn.disabled=true;say('送出中…');
    try{
      const id='fb-'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
      const by=await user.id();
      await db.collection('feedback/'+by+'/items').doc(id).set({type:$('#fb-type').value,shop:$('#fb-shop').value.trim(),text:$('#fb-text').value.trim(),contact:$('#fb-contact').value.trim(),by,ts:Date.now(),status:'new'});
      f.reset();say('謝謝你！回饋已送出，我們會盡快整理。');
    }catch(err){say(err&&err.code==='not_granted'||/permission|denied|not_writer/i.test(String(err&&err.message))?'你目前只有檢視權限，無法送出回饋。':'送出失敗（'+(err&&(err.code||err.message)||'未知')+'）')}
    btn.disabled=false;
  });
})();


/* ===== 每週人氣榜（正餐／飲料／點心三榜）：每人一份文件 votes/<id>，weeks[週][類別]=店名 ===== */
(()=>{
  const weekOf=t=>{const d=new Date(t+8*36e5);d.setUTCHours(0,0,0,0);const day=(d.getUTCDay()+6)%7;d.setUTCDate(d.getUTCDate()-day+3);
    const y=d.getUTCFullYear(),j=new Date(Date.UTC(y,0,4));const w=1+Math.round(((d-j)/864e5-3+((j.getUTCDay()+6)%7))/7);return y+'-W'+String(w).padStart(2,'0')};
  const cur=weekOf(Date.now()),prev=weekOf(Date.now()-7*864e5);
  const NAMES={food:'正餐',drink:'飲料',snack:'點心'};
  const pod=$('#podium'),msg=$('#rk-msg'),go=$('#rk-go');
  $('#rk-week').textContent=' 本週：'+cur.replace('-W',' 年第 ')+' 週。';
  let db=null,user=null,me='',docs=[],mine={},tab='food';
  const idxOf=n=>SHOPS.findIndex(x=>x.n===n);
  const tally=(w,c)=>{const m=new Map();docs.forEach(d=>{const n=d.weeks&&d.weeks[w]&&d.weeks[w][c];if(n&&idxOf(n)>=0)m.set(n,(m.get(n)||0)+1)});
    return [...m].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'zh-Hant')).slice(0,3)};
  function setTab(c){tab=c;$$('#rk-tabs .chip').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.c===c)));
        $('#rk-shop').placeholder='輸入或選擇'+NAMES[c]+'店名';render()}
  $('#rk-shop')._opts=()=>SHOPS.filter(x=>x.c===tab).map(x=>x.n);
  $$('#rk-tabs .chip').forEach(b=>b.onclick=()=>setTab(b.dataset.c));
  function render(){
    const top=tally(cur,tab);pod.textContent='';
    for(let i=0;i<3;i++){const li=document.createElement('li');const t=top[i];
      if(!t){li.className='empty';li.innerHTML='<span class="no"></span><span class="nm">虛位以待</span><span class="ct">等你投票</span>';li.querySelector('.no').textContent=i+1}
      else{li.tabIndex=0;li.setAttribute('role','button');li.innerHTML='<span class="no"></span><span class="nm"></span><span class="ct"></span>';
        li.querySelector('.no').textContent=i+1;li.querySelector('.nm').textContent=t[0];li.querySelector('.ct').textContent=t[1]+' 票・點擊看簡介';
        const go2=()=>{const k=idxOf(t[0]);if(k>=0){$('.mapwrap').scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});select(k)}};
        li.onclick=go2;li.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go2()}}}
      pod.appendChild(li)}
    const lp=tally(prev,tab);
    $('#rk-last').textContent=lp.length?'上週'+NAMES[tab]+'榜前三名：'+lp.map((x,i)=>(i+1)+'. '+x[0]+'（'+x[1]+'）').join('　'):'';
    if(mine[tab])msg.textContent='你本週的'+NAMES[tab]+'票投給了「'+mine[tab]+'」，可以改投。';
  }
  setTab('food');
  (async()=>{
    try{[db,user]=await Promise.all([claude.use('db'),claude.use('user')])}catch(e){}
    if(!db)return;
    try{try{me=user?await user.id():''}catch(e){window.claude&&(claude.err=String(e&&(e.code||e.message)||e));me=''}
      db.collection('votes').onSnapshot(snap=>{
        docs=[];mine={};snap.docs.forEach(d=>{const v=d.data()||{};docs.push(v);if(d.id===me)mine=(v.weeks&&v.weeks[cur])||{}});render();
      });
    }catch(e){}
  })();
  async function vote(name){
    name=(name||'').trim();const k=idxOf(name);
    if(k<0){msg.textContent='請從清單選一間店。';return}
    const c=SHOPS[k].c;
    if(c!==tab){setTab(c);}
    if(!db||!user){msg.textContent=typeof claude==='undefined'?'這是沒有資料庫的版本（例如 GitHub Pages），無法投票或送出回饋，請改用完整互動版：https://claude.ai/artifact/Vg5JBAWt93JmLdWMNWqHUz':(claude.fb?'資料庫連線失敗（'+(claude.err||'未知')+'），請重新整理後再試。':'目前無法投票，請確認已登入 Claude 並有權限開啟此頁面。');return}
    go.disabled=true;msg.textContent='送出中…';
    try{
      if(!me)me=await user.id();const old=docs.find(d=>d&&d.uid===me);
      const weeks=Object.assign({},old&&old.weeks||{});
      weeks[cur]=Object.assign({},typeof weeks[cur]==='object'?weeks[cur]:{},{[c]:name});
      await db.collection('votes').doc(me).set({uid:me,weeks,ts:Date.now()});
      mine=weeks[cur];msg.textContent='已把本週'+NAMES[c]+'票投給「'+name+'」，謝謝！';
    }catch(err){msg.textContent=/permission|denied|not_writer|not_granted/i.test(String(err&&(err.code||err.message)))?'你目前只有檢視權限，無法投票。':'投票失敗（'+(err&&(err.code||err.message)||'未知')+'）'}
    go.disabled=false;
  }
  go.onclick=()=>vote($('#rk-shop').value);
  {const v=new URLSearchParams(location.search).get('vote');const k=SHOPS.findIndex(x=>x.n===v);if(k>=0){setTab(SHOPS[k].c);$('#rk-shop').value=SHOPS[k].n}}
})();

