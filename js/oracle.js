/* 今日吃什麼：天使豬與惡魔豬吵架，聖廚豬端出答案 */
(()=>{
/* ===== 水晶球占卜：先問想吃什麼，再從該類別（依目前區域）隨機挑一間 ===== */
const st={zone:'all'};let last=null;
const orb=$('#orb'),otxt=$('#orb-txt'),ores=$('#ores'),again=$('#again'),odet=$('#o-detail');
const ansBtns=$$('#oa .ans');let ans=null,rolling=0;const tos=[];
const poolOf=c=>SHOPS.map((s,i)=>i).filter(i=>SHOPS[i].c===c&&(st.zone==='all'||SHOPS[i].z===st.zone));
const shortName=s=>s.l||s.n;
function setBall(t){otxt.textContent=t;const n=[...t].length;otxt.classList.toggle('long',n>6)}
function counts(){ansBtns.forEach(b=>{b.querySelector('small').textContent=poolOf(b.dataset.ans).length+' 間'})}
function lock(on){ansBtns.forEach(b=>{b.disabled=on})}
function ask(c){
  ans=c;clearInterval(rolling);tos.forEach(clearTimeout);tos.length=0;
  ansBtns.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.ans===c)));
  again.hidden=true;odet.hidden=true;orb.classList.remove('revealed','popped','rolling','p-chat','p-fight','p-chef');
  const pool=poolOf(c);
  if(!pool.length){setBall('沒有店');ores.textContent='這個區域沒有這一類的店，請換個區域或換個答案。';return}
  const cand=pool.length>1?pool.filter(i=>i!==last):pool;
  const pick=cand[Math.floor(Math.random()*cand.length)];
  const done=()=>{
    orb.classList.remove('rolling','p-chat','p-fight','p-chef');orb.classList.add('revealed','popped');otxt.removeAttribute('aria-hidden');
    const s=SHOPS[pick];setBall(shortName(s));
    const b=document.createElement('b');b.textContent=s.n;
    const sp=document.createElement('span');sp.textContent=`${ZONES[s.z]}・${CATS[s.c]}・從 ${pool.length} 間中抽出`;
    ores.replaceChildren(document.createTextNode('聖廚豬端出：'),b,sp);
    lock(false);again.hidden=false;odet.hidden=false;
    last=pick;odet.href='map.html?shop='+pick;
  };
  ores.textContent='';
  if(reduce||pool.length===1){done();return}
  lock(true);orb.classList.add('rolling','p-chat');otxt.setAttribute('aria-hidden','true');setBall('要吃什麼？');
  const at=(ms,f)=>tos.push(setTimeout(f,ms));
  at(2200,()=>{orb.classList.replace('p-chat','p-fight');setBall('吵架中…');
    rolling=setInterval(()=>setBall(shortName(SHOPS[pool[Math.floor(Math.random()*pool.length)]])),90)});
  at(4300,()=>{clearInterval(rolling);orb.classList.replace('p-fight','p-chef');setBall('聖廚來了…')});
  at(5500,()=>{setBall(shortName(SHOPS[pick]));orb.classList.add('popped')});
  at(6500,done);
}
ansBtns.forEach(b=>b.addEventListener('click',()=>ask(b.dataset.ans)));
again.addEventListener('click',()=>{if(ans)ask(ans)});

counts();

})();
