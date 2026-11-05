/* 首頁：顯示本週三個榜單各自的最高票店家（讀取共用資料庫，沒有資料時維持「尚無投票」） */
(()=>{
  const weekOf=t=>{const d=new Date(t+8*36e5);d.setUTCHours(0,0,0,0);const day=(d.getUTCDay()+6)%7;d.setUTCDate(d.getUTCDate()-day+3);
    const y=d.getUTCFullYear(),j=new Date(Date.UTC(y,0,4));const w=1+Math.round(((d-j)/864e5-3+((j.getUTCDay()+6)%7))/7);return y+'-W'+String(w).padStart(2,'0')};
  const cur=weekOf(Date.now());
  (async()=>{
    let db=null;try{db=await claude.use('db')}catch(e){}
    if(!db)return;
    try{db.collection('votes').onSnapshot(snap=>{
      const m={food:new Map(),drink:new Map(),snack:new Map()};
      snap.docs.forEach(d=>{const w=((d.data()||{}).weeks||{})[cur]||{};for(const c in m){const n=w[c];if(n&&SHOPS.some(x=>x.n===n))m[c].set(n,(m[c].get(n)||0)+1)}});
      for(const c in m){const top=[...m[c]].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'zh-Hant'))[0];
        $('#hot-'+c).textContent=top?top[0]+'（'+top[1]+' 票）':'尚無投票'}
    })}catch(e){}
  })();
})();
