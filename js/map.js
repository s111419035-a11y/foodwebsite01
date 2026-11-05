/* 美食地圖：街道底圖、縮放拖曳、圖標與泡泡、篩選、清單、店家簡介 */
(()=>{
/* ===== 位置：118巷與311巷依門牌順序左右交錯排列；學餐放在校內右側；學校右邊四間放在臥龍街東側 ===== */
(()=>{
  const L={'118':{x:[560,640],y0:320,dy:40},across:{x:[1150,1240],y0:205,dy:-31}};
  let ci=0;const L118={},n118=SHOPS.filter(s=>s.z==='118'&&!s.pos).length;
  SHOPS.forEach(s=>{
    if(s.pos){s.x=s.pos[0];s.y=s.pos[1];s.side=s.pos[2]||'r';return}
    if(s.z==='campus'){
      const col=ci%2,row=ci>>1;s.x=1385+col*95;s.y=655+row*75;s.side=col?'r':'l';ci++;return;
    }
    if(s.z==='118'){
      const i=(L118.i=(L118.i??-1)+1),left=i%2===0,k=i>>1,col=k%2,row=k>>1;
      const rows=Math.ceil(n118/4),pitch=rows>1?Math.min(62,860/(rows-1)):62;
      s.x=left?(col?480:550):(col?720:650);s.y=320+row*pitch;s.side=left?'l':'r';s.lh=col===0;return;
    }
    const c=L[s.z];const i=c.n=(c.n??-1)+1;if(s.z==='across'){if(i<4){s.x=1240;s.y=205-56*i;s.side='r'}else{const j=i-4;s.x=j%2?1240:1150;s.y=10-27*j;s.side=j%2?'r':'l'}return}const left=i%2===0;
    s.x=c.x[left?0:1];s.y=c.y0+i*c.dy;s.side=left?'l':'r';
  });
})();

/* ===== 街道（座標與截圖像素一致） ===== */
const ROADS=[
  ['M205 170 L205 1240',22,'lane'],
  ['M200 305 L598 357',14,'lane'],['M200 428 L598 480',14,'lane'],['M200 525 L598 575',14,'lane'],
  ['M200 627 L598 660',14,'lane'],['M200 740 L598 752',14,'lane'],['M160 848 L750 850',14,'lane'],
  ['M190 935 L598 955',14,'lane'],['M190 1040 L598 1062',14,'lane'],
  ['M600 235 L600 1240',24,'lane'],
  ['M880 290 L880 1015',12,'lane'],
  ['M1050 400 L1440 405',10,'lane'],['M1050 400 L1048 600',10,'lane'],['M1212 400 L1210 600',10,'lane'],
  ['M910 515 L1048 515',10,'lane'],['M1048 600 L1430 604',10,'lane'],['M1300 604 L1295 880',10,'lane'],
  ['M1585 558 L1850 566',14,'lane'],['M1585 667 L1850 672',14,'lane'],
  ['M1195 270 L1195 -550 L760 -550',20,'lane'],['M898 262 L898 -550',14,'lane'],['M962 -505 L1195 -497',12,'lane'],['M1195 -497 L1430 -480',12,'lane'],['M1195 -190 L1520 -178',10,'lane'],
  ['M1590 462 L2000 470',32,'major'],
  ['M1570 300 L1570 870 L1650 1010 L1760 1260',34,'major'],
  ['M-100 1215 L500 1192 L900 1215',46,'major'],
  ['M752 -720 L752 1260',64,'major'],
  ['M-150 95 L300 148 L745 236 L1100 264 L1470 296 L2000 324',66,'major']
];
(()=>{
  const NS='http://www.w3.org/2000/svg',cg=$('#casings'),fg=$('#fills');
  ROADS.forEach(([d,w,k])=>{
    const a=document.createElementNS(NS,'path');a.setAttribute('d',d);a.setAttribute('class','rc rc-'+k);a.setAttribute('stroke-width',w+6);cg.appendChild(a);
    const b=document.createElementNS(NS,'path');b.setAttribute('d',d);b.setAttribute('class','rf rf-'+k);b.setAttribute('stroke-width',w);fg.appendChild(b);
  });
})();

/* ===== 地圖與縮放 ===== */
const NS='http://www.w3.org/2000/svg';
const svg=$('#map'),VB={x:80,y:-680,w:1760,h:1900};
let view={x:VB.x,y:VB.y,w:VB.w,h:VB.h},raf=0,inited=false;
const size=()=>{const r=svg.getBoundingClientRect();return{cw:r.width||1,ch:r.height||1}};
const sFit=()=>{const{cw,ch}=size();return Math.min(cw/VB.w,ch/VB.h)};
function apply(){
  const{cw,ch}=size();view.h=view.w*ch/cw;
  const mx=view.w*.2,my=view.h*.2;
  const lx=VB.x-mx,hx=VB.x+VB.w-view.w+mx,ly=VB.y-my,hy=VB.y+VB.h-view.h+my;
  view.x=hx<lx?VB.x+(VB.w-view.w)/2:Math.min(Math.max(view.x,lx),hx);
  view.y=hy<ly?VB.y+(VB.h-view.h)/2:Math.min(Math.max(view.y,ly),hy);
  svg.setAttribute('viewBox',`${view.x} ${view.y} ${view.w} ${view.h}`);
  const s=cw/view.w;
  svg.classList.toggle('labels',s>=.4);svg.classList.toggle('labels2',s>=.9);
  svg.style.setProperty('--ls',1);
  try{const k=Math.min(1,.47/s).toFixed(3);if(k!==lastK){pinEls.forEach((p,i)=>p.setAttribute('transform',`translate(${SHOPS[i].x} ${SHOPS[i].y}) scale(${k})`));lastK=k;$('#hov').textContent=''}}catch(e){}
  try{cluster(s)}catch(e){}
}

/* 縮小時把鄰近圖釘合併成帶數字的泡泡，放大再展開 */
let lastClu='',lastK='';
function cluster(s){
  const g=$('#clusters');if(!g)return;
  const sel=document.querySelector('.pin.sel');
  const on=s<.62;
  const cells=[];
  if(on){
    const R=105;
    pinEls.forEach((p,i)=>{
      if(p.classList.contains('off')||p===sel)return;
      const sh=SHOPS[i];let best=null,bd=1e9;
      for(const c of cells){const d=Math.hypot(c.cx-sh.x,c.cy-sh.y);if(d<R&&d<bd){bd=d;best=c}}
      if(best){best.a.push(i);best.cx=best.a.reduce((t,j)=>t+SHOPS[j].x,0)/best.a.length;best.cy=best.a.reduce((t,j)=>t+SHOPS[j].y,0)/best.a.length}
      else cells.push({a:[i],cx:sh.x,cy:sh.y});
    });
  }
  const list=cells.map(c=>c.a).filter(a=>a.length>1);
  const key=list.map(a=>a.join('.')).join('|');
  if(key===lastClu)return;lastClu=key;
  g.textContent='';
  pinEls.forEach(p=>p.classList.remove('cl'));
  list.forEach(a=>{
    a.forEach(i=>pinEls[i].classList.add('cl'));
    const m=a.map(i=>SHOPS[i]),cx=m.reduce((t,x)=>t+x.x,0)/m.length,cy=m.reduce((t,x)=>t+x.y,0)/m.length;
    const c=el('g',{class:'clu',transform:`translate(${cx} ${cy})`,role:'button',tabindex:0,'aria-label':`${m.length} 間店，點擊放大`},g);
    el('circle',{r:Math.min(52,30+m.length*2.2)},c);
    const t=el('text',{},c);t.textContent=m.length;
    const go=()=>fitBox(boxOf(m),110,true);
    c.addEventListener('click',e=>{e.stopPropagation();go()});
    c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}});
  });
}
function zoomAt(f,px,py){
  const{cw}=size();const s=cw/view.w;const ns=Math.min(Math.max(s*f,sFit()*.85),2.5);
  const wx=view.x+px/s,wy=view.y+py/s;
  view.w=cw/ns;view.x=wx-px/ns;view.y=wy-py/ns;apply();
}
function panBy(dx,dy){const s=size().cw/view.w;view.x-=dx/s;view.y-=dy/s;apply()}
function cancelAnim(){cancelAnimationFrame(raf)}
function animateTo(t){
  cancelAnim();
  if(reduce){view.x=t.x;view.y=t.y;view.w=t.w;apply();return}
  const f={...view},t0=performance.now(),D=380;
  (function step(now){
    const k=Math.min(1,(now-t0)/D),e=1-Math.pow(1-k,3);
    view.x=f.x+(t.x-f.x)*e;view.y=f.y+(t.y-f.y)*e;view.w=f.w+(t.w-f.w)*e;apply();
    if(k<1)raf=requestAnimationFrame(step);
  })(t0);
}
function fitBox(b,pad,animate){
  const{cw,ch}=size();
  const bw=b.x1-b.x0+pad*2,bh=b.y1-b.y0+pad*2;
  const ns=Math.max(Math.min(cw/bw,ch/bh,1.3),sFit()*.9);
  const w=cw/ns,h=ch/ns;
  const t={x:(b.x0+b.x1)/2-w/2,y:(b.y0+b.y1)/2-h/2,w};
  if(animate)animateTo(t);else{cancelAnim();view.x=t.x;view.y=t.y;view.w=t.w;apply()}
}
const boxOf=l=>({x0:Math.min(...l.map(s=>s.x)),x1:Math.max(...l.map(s=>s.x)),y0:Math.min(...l.map(s=>s.y)),y1:Math.max(...l.map(s=>s.y))});
const fitAll=a=>fitBox(boxOf(SHOPS),120,a);
function focusShop(s){
  const{cw,ch}=size();const ns=Math.min(Math.max(cw/view.w,.7),2.5);
  animateTo({x:s.x-cw/ns/2,y:s.y-ch/ns/2,w:cw/ns});
}

let toastT=0;
function toast(msg){const t=$('#maptoast');t.firstElementChild.textContent=msg;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),1700)}

/* 拖曳、雙指縮放、滾輪：滑鼠拖曳移動；Ctrl/⌘＋滾輪縮放；手機單指捲動頁面、雙指移動與縮放 */
const ptrs=new Map();let moved=false,startPt=null,lastDist=0,lastMid=null;
const pinch=()=>{const a=[...ptrs.values()];return{d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)||1,m:{x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2}}};
svg.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse'&&e.button>0)return;
  cancelAnim();ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(ptrs.size===1){moved=false;startPt={x:e.clientX,y:e.clientY}}
  else if(ptrs.size===2){const p=pinch();lastDist=p.d;lastMid=p.m;moved=true}
});
addEventListener('pointermove',e=>{
  if(!ptrs.has(e.pointerId))return;
  const prev=ptrs.get(e.pointerId),cur={x:e.clientX,y:e.clientY};ptrs.set(e.pointerId,cur);
  if(ptrs.size===1){
    if(!moved&&Math.hypot(cur.x-startPt.x,cur.y-startPt.y)>6){moved=true;svg.classList.add('drag')}
    if(moved){
      if(e.pointerType==='touch'){window.scrollBy(0,-(cur.y-prev.y));toast('用兩指移動或縮放地圖')}
      else panBy(cur.x-prev.x,cur.y-prev.y);
    }
  }else if(ptrs.size>=2){
    const p=pinch(),r=svg.getBoundingClientRect();
    zoomAt(p.d/lastDist,p.m.x-r.left,p.m.y-r.top);panBy(p.m.x-lastMid.x,p.m.y-lastMid.y);
    lastDist=p.d;lastMid=p.m;
  }
});
const endPtr=e=>{ptrs.delete(e.pointerId);if(!ptrs.size)svg.classList.remove('drag')};
addEventListener('pointerup',endPtr);addEventListener('pointercancel',endPtr);
svg.addEventListener('wheel',e=>{
  e.preventDefault();cancelAnim();const r=svg.getBoundingClientRect();
  zoomAt(Math.min(1.25,Math.max(.8,Math.exp(-e.deltaY*(e.deltaMode===0&&Math.abs(e.deltaY)<50?.01:.003)))),e.clientX-r.left,e.clientY-r.top);
},{passive:false});
$('#zin').onclick=()=>{const{cw,ch}=size();zoomAt(1.4,cw/2,ch/2)};
$('#zout').onclick=()=>{const{cw,ch}=size();zoomAt(1/1.4,cw/2,ch/2)};
$('#zfit').onclick=()=>fitAll(true);
new ResizeObserver(()=>{if(!inited){inited=true;fitAll(false)}else apply()}).observe(svg);

/* ===== 圖標 ===== */
const pinEls=[];
const el=(tag,at,parent)=>{const n=document.createElementNS(NS,tag);for(const k in at)n.setAttribute(k,at[k]);parent&&parent.appendChild(n);return n};
SHOPS.forEach((s,i)=>{
  const g=el('g',{class:`pin c-${s.c} z-${s.z}${s.lh?' lh':''}`,transform:`translate(${s.x} ${s.y})`,tabindex:0,role:'button','aria-label':`${s.n}，${ZONES[s.z]}，${CATS[s.c]}`,'data-id':i},$('#pins'));
  el('title',{},g).textContent=s.n;
  el('circle',{r:36,fill:'transparent'},g);
  const b=el('g',{class:'body'},g);
  el('circle',{class:'dot',r:28},b);
  const u=el('use',{class:'ico',x:-16,y:-16,width:32,height:32},b);u.setAttribute('href','#i-'+s.c);
  const t=el('text',{class:'lbl'},g);t.textContent=s.l||s.n;
  if(s.side==='l'){t.setAttribute('x',-38);t.setAttribute('y',9);t.setAttribute('text-anchor','end')}
  else if(s.side==='t'){t.setAttribute('x',0);t.setAttribute('y',-38);t.setAttribute('text-anchor','middle')}
  else if(s.side==='b'){t.setAttribute('x',0);t.setAttribute('y',60);t.setAttribute('text-anchor','middle')}
  else{t.setAttribute('x',38);t.setAttribute('y',9);t.setAttribute('text-anchor','start')}
  g.addEventListener('click',()=>{if(!moved)select(i)});
  g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(i)}});
  const lift=()=>{const h=$('#hov');h.textContent='';const c=g.cloneNode(true);c.removeAttribute('tabindex');c.removeAttribute('role');c.classList.add('hov');c.classList.remove('off','cl');h.appendChild(c)};
  g.addEventListener('pointerenter',lift);
  g.addEventListener('focus',lift);
  g.addEventListener('pointerleave',()=>{$('#hov').textContent=''});
  g.addEventListener('blur',()=>{$('#hov').textContent=''});
  pinEls.push(g);
});

/* ===== 篩選、清單、簡介 ===== */
const st={zone:'all',cat:'all',q:''};let sel=null;

const closed=new Set(['118','across','campus','mrt']);
function renderList(){
  const box=$('#list');let html='';
  ['118','across','campus','mrt'].forEach(z=>{
    const items=SHOPS.map((s,i)=>[s,i]).filter(([s])=>s.z===z&&match(s,st));
    if(!items.length)return;
    const open=!closed.has(z);
    html+=`<section class="grp${open?'':' closed'}" data-z="${z}"><h3><button class="gh" type="button" aria-expanded="${open}"><svg class="tri" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1 L9 5 L2 9Z"/></svg><span class="gt">${ZONES[z]}</span><span class="gc">${items.length} 間・${ZSUB[z]}</span></button></h3><div class="gb">`;
    items.forEach(([s,i])=>{
      html+=`<button class="item${i===sel?' sel':''}" data-id="${i}">${icon(s.c)}<span class="nm"><b>${s.n}</b><small>${[s.loc,s.t].filter(Boolean).join('・')||CATS[s.c]}</small></span>${s.r?`<span class="rt">${s.r.toFixed(1)}</span>`:''}</button>`;
    });
    html+='</div></section>';
  });
  box.innerHTML=html||'<p class="none">找不到符合的店家。試試調整區域、類別或搜尋字詞。</p>';
  box.querySelectorAll('.gh').forEach(b=>b.addEventListener('click',()=>{
    const g=b.closest('.grp'),z=g.dataset.z,nowClosed=!g.classList.contains('closed');
    g.classList.toggle('closed',nowClosed);b.setAttribute('aria-expanded',String(!nowClosed));
    nowClosed?closed.add(z):closed.delete(z);
  }));
  box.querySelectorAll('.item').forEach(b=>b.addEventListener('click',()=>{select(+b.dataset.id);if(matchMedia('(max-width:959px)').matches)goDetail()}));
}
function markList(){
  const box=$('#list');
  box.querySelectorAll('.item').forEach(b=>b.classList.toggle('sel',+b.dataset.id===sel));
  const it=box.querySelector('.item.sel');
  if(it&&box.scrollHeight>box.clientHeight)box.scrollTop=Math.max(0,it.offsetTop-box.clientHeight/2+it.offsetHeight/2);
}
function renderDetail(){
  const box=$('#detail');
  if(sel==null){box.innerHTML='<p class="empty">點地圖上的圖標，或從清單選一間店，就會在這裡看到簡介。</p>';return}
  const s=SHOPS[sel],tbd='<span class="tbd">待補</span>';
  const meta=[ZONES[s.z],CATS[s.c],s.loc,s.t].filter(Boolean).join('・');
  const q=s.a&&!/待補/.test(s.a)?(s.l||s.n)+' '+s.a:(s.l||s.n)+' '+(s.z==='118'?'和平東路二段118巷':'國立臺北教育大學');
  box.innerHTML=`<div class="d-top">${icon(s.c)}<div><h2>${s.n}</h2><p class="d-meta">${meta}</p></div><button class="x" id="close" aria-label="關閉簡介">×</button></div>
  <p class="d-desc">${s.d||'<span class="tbd">簡介待補。</span>'}</p>${s.dr?'<p class="note">這段簡介依店家類型暫擬，尚未確認。</p>':''}${s.nt?`<p class="note">${s.nt}</p>`:''}${s.a?'<p class="note">地址取自你提供的名單，尚未逐一核對。</p>':''}
  <dl class="facts"><div><dt>價位</dt><dd>${s.p||tbd}</dd></div><div><dt>評分</dt><dd>${s.r?'Google '+s.r.toFixed(1):tbd}</dd></div><div><dt>營業時間</dt><dd>${s.h||tbd}</dd></div><div><dt>地址</dt><dd>${s.a||tbd}</dd></div></dl>
  <div class="d-actions"><a class="btn" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}" target="_blank" rel="noopener">在 Google 地圖開啟</a><a class="btn ghost" href="rank.html?vote=${encodeURIComponent(s.n)}#rank">投這家一票</a><a class="btn ghost" href="rank.html?report=${encodeURIComponent(s.n)}#feedback">回報這家店</a><button class="btn ghost" id="back" type="button">回到地圖</button></div>`;
  $('#close').onclick=()=>select(null);
  $('#back').onclick=()=>$('.mapwrap').scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
}
function renderPeek(){
  const p=$('#peek');
  if(sel==null){p.hidden=true;return}
  const s=SHOPS[sel];
  $('#peek-ico').innerHTML=icon(s.c);
  $('#peek-name').textContent=s.n;
  $('#peek-meta').textContent=[ZONES[s.z],CATS[s.c],s.loc,s.t].filter(Boolean).join('・');
  p.hidden=false;
}
function goDetail(){
  const c=$('#detail-card');
  c.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
  const h=c.querySelector('h2');
  if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true})}
}
function select(id,pan=true){
  sel=id;
  pinEls.forEach((p,i)=>p.classList.toggle('sel',i===id));
  if(id!=null){const p=pinEls[id];p.parentNode.appendChild(p)}
  renderDetail();renderPeek();markList();
  if(id!=null){
    if(pan)focusShop(SHOPS[id]);
  }
}
function refresh(fit){
  pinEls.forEach((p,i)=>p.classList.toggle('off',!match(SHOPS[i],st)));
  lastClu='';try{cluster(size().cw/view.w)}catch(e){}
  if(sel!=null&&!match(SHOPS[sel],st))select(null);
  $$('#zones .chip').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.zone===st.zone));b.querySelector('.n').textContent=SHOPS.filter(s=>match(s,{...st,zone:b.dataset.zone})).length});
  $$('#cats .chip').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.cat===st.cat));b.querySelector('.n').textContent=SHOPS.filter(s=>match(s,{...st,cat:b.dataset.cat})).length});
  const vis=SHOPS.filter(s=>match(s,st));
  $('#status').textContent=`顯示 ${vis.length} / ${SHOPS.length} 間`;
  renderList();markList();
  if(fit&&inited&&vis.length){
    if(st.zone==='all'&&st.cat==='all'&&!st.q)fitAll(true);
    else fitBox(boxOf(vis),140,true);
  }
}
$('#zones').addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;st.zone=b.dataset.zone;refresh(true)});
$('#cats').addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;st.cat=b.dataset.cat;refresh(true)});
let qt=0;
$('#q').addEventListener('input',e=>{clearTimeout(qt);qt=setTimeout(()=>{st.q=e.target.value.trim().toLowerCase();refresh(true)},180)});


renderDetail();refresh(false);
{const q=new URLSearchParams(location.search).get('shop');if(q!==null&&SHOPS[+q])setTimeout(()=>select(+q),500)}
})();
