/* 沒有 Claude 資料庫時（例如 GitHub Pages）改用 Firebase（匿名登入 + Firestore）。
   在 Claude 頁面裡 window.claude 已存在，這支檔案不會做任何事。 */
(()=>{
if(typeof claude!=='undefined'||/claude|anthropic/i.test(location.hostname))return;
const cfg={apiKey:"AIzaSyDACZ-P8dvi0sQyMFZZjlMaxm7BxNLiwLg",authDomain:"foodmap-d50e3.firebaseapp.com",projectId:"foodmap-d50e3",storageBucket:"foodmap-d50e3.firebasestorage.app",messagingSenderId:"782343681743",appId:"1:782343681743:web:f92eb1d8334cd3225929ba"};
const V='10.14.1',B='https://www.gstatic.com/firebasejs/'+V+'/';
let boot=null;
const load=()=>boot||(boot=(async()=>{
  const [A,Au,F]=await Promise.all([import(B+'firebase-app.js'),import(B+'firebase-auth.js'),import(B+'firebase-firestore.js')]);
  const app=A.initializeApp(cfg),auth=Au.getAuth(app),fs=F.initializeFirestore(app,{experimentalAutoDetectLongPolling:true,useFetchStreams:false});
  let uidP=null;
  const uid=()=>uidP||(uidP=(async()=>{
    await auth.authStateReady();
    if(auth.currentUser)return auth.currentUser.uid;
    const c=await Au.signInAnonymously(auth);return c.user.uid;
  })());
  return {Au,F,fs,uid};
})());
const dbApi={
  collection(path){return{
    doc(id){return{set:async data=>{const {F,fs}=await load();return F.setDoc(F.doc(fs,path,id),data)}}},
    onSnapshot(cb,err){
      const note=t=>{const m=document.getElementById('rk-msg');if(m&&!m.dataset.keep)m.textContent=t};
      let got=false;const tm=setTimeout(()=>{if(!got)note('榜單連線較慢，仍在嘗試…（v4）')},8000);
      const fail=e=>{window.claude.err=String(e&&(e.code||e.message)||e);note('榜單讀取失敗（'+window.claude.err+'）');if(err)err(e)};
      load().then(({F,fs})=>F.onSnapshot(F.collection(fs,path),s=>{got=true;clearTimeout(tm);cb({docs:s.docs.map(d=>({id:d.id,data:()=>d.data()}))})},fail)).catch(fail);return()=>{}}
  }}
};
const userApi={id:async()=>(await load()).uid(),isOwner:()=>false,canEdit:()=>false};
window.claude={fb:true,err:'',use:async n=>{try{await load()}catch(e){window.claude.err=String(e&&(e.code||e.message)||e);return null}return n==='db'?dbApi:n==='user'?userApi:null}};
})();
