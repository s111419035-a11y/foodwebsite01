/* 沒有 Claude 資料庫時（例如 GitHub Pages）改用 Firebase（匿名登入 + Firestore）。
   在 Claude 頁面裡 window.claude 已存在，這支檔案不會做任何事。 */
(()=>{
if(typeof claude!=='undefined'||/claude|anthropic/i.test(location.hostname))return;
const cfg={apiKey:"AIzaSyDACZ-P8dvi0sQyMFZZjlMaxm7BxNLiwLg",authDomain:"foodmap-d50e3.firebaseapp.com",projectId:"foodmap-d50e3",storageBucket:"foodmap-d50e3.firebasestorage.app",messagingSenderId:"782343681743",appId:"1:782343681743:web:f92eb1d8334cd3225929ba"};
const V='10.14.1',B='https://www.gstatic.com/firebasejs/'+V+'/';
let boot=null;
const load=()=>boot||(boot=(async()=>{
  const [A,Au,F]=await Promise.all([import(B+'firebase-app.js'),import(B+'firebase-auth.js'),import(B+'firebase-firestore.js')]);
  const app=A.initializeApp(cfg),auth=Au.getAuth(app),fs=F.getFirestore(app);
  let uidP=null;
  const uid=()=>uidP||(uidP=(async()=>{
    if(auth.currentUser)return auth.currentUser.uid;
    const c=await Au.signInAnonymously(auth);return c.user.uid;
  })());
  return {Au,F,fs,uid};
})());
const dbApi={
  collection(path){return{
    doc(id){return{set:async data=>{const {F,fs}=await load();return F.setDoc(F.doc(fs,path,id),data)}}},
    onSnapshot(cb,err){load().then(({F,fs})=>F.onSnapshot(F.collection(fs,path),s=>cb({docs:s.docs.map(d=>({id:d.id,data:()=>d.data()}))}),e=>{if(err)err(e)})).catch(e=>{if(err)err(e)});return()=>{}}
  }}
};
const userApi={id:async()=>(await load()).uid(),isOwner:()=>false,canEdit:()=>false};
window.claude={fb:true,use:async n=>{try{await load()}catch(e){return null}return n==='db'?dbApi:n==='user'?userApi:null}};
})();
