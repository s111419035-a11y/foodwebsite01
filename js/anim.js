/* 捲動進場動畫：元素進入畫面時淡入上移；偏好減少動態時不執行 */
(()=>{
const rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
if(rm||!('IntersectionObserver' in window))return;
document.documentElement.classList.add('js-anim');
const sel='.sec,.fcard,.hot3 li,.steps li,.hotlink,.foot-grid>div,.podium,.rk-last,.rk-vote,.fb-card';
const els=[...document.querySelectorAll(sel)];
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const t=e.target;t.classList.add('in');io.unobserve(t);setTimeout(()=>t.classList.remove('rv','in'),900)}}),{threshold:.12,rootMargin:'0px 0px -40px 0px'});
els.forEach((el,i)=>{el.classList.add('rv');el.style.setProperty('--d',i%4);io.observe(el)});
})();
