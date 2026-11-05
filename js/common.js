/* 共用：選取器、圖示與搜尋比對、自製下拉選單 */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const match=(s,f)=>(f.zone==='all'||s.z===f.zone)&&(f.cat==='all'||s.c===f.cat)&&(!f.q||(s.n+(s.t||'')+(s.d||'')+CATS[s.c]).toLowerCase().includes(f.q));
const icon=c=>`<span class="mk c-${c}"><svg class="ico" viewBox="0 0 24 24"><use href="#i-${c}"/></svg></span>`;

/* ===== 自製下拉選單元件 ===== */
(()=>{
  const open=new Set();
  const closeAll=except=>open.forEach(c=>{if(c!==except)c.close()});
  function make(input){
    const wrap=document.createElement('div');wrap.className='cb';input.parentNode.insertBefore(wrap,input);wrap.appendChild(input);
    input.setAttribute('role','combobox');input.setAttribute('aria-expanded','false');input.setAttribute('aria-autocomplete','list');
    const btn=document.createElement('button');btn.type='button';btn.className='cb-btn';btn.setAttribute('aria-label','展開或收合選單');btn.tabIndex=-1;
    btn.innerHTML='<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1 L9 5 L2 9Z"/></svg>';
    const ul=document.createElement('ul');ul.className='cb-list';ul.setAttribute('role','listbox');
    wrap.append(btn,ul);
    let items=[],act=-1;
    const ctl={close(){wrap.classList.remove('open');input.setAttribute('aria-expanded','false');open.delete(ctl);act=-1},
      show(filter){closeAll(ctl);const all=(input._opts?input._opts():[]);const q=(filter||'').trim().toLowerCase();
        items=q?all.filter(x=>x.toLowerCase().includes(q)):all;ul.textContent='';
        if(!items.length){const li=document.createElement('li');li.className='none';li.textContent='找不到符合的店家，可直接輸入';ul.appendChild(li)}
        items.forEach((x,i)=>{const li=document.createElement('li');li.setAttribute('role','option');li.textContent=x;li.dataset.i=i;if(x===input.value)li.classList.add('on');ul.appendChild(li)});
        wrap.classList.add('open');input.setAttribute('aria-expanded','true');open.add(ctl);
        const on=ul.querySelector('.on');if(on)ul.scrollTop=on.offsetTop-ul.clientHeight/2}};
    const pick=i=>{input.value=items[i];input.dispatchEvent(new Event('input',{bubbles:true}));ctl.close()};
    ul.addEventListener('mousedown',e=>e.preventDefault());
    ul.addEventListener('click',e=>{const li=e.target.closest('li[data-i]');if(li)pick(+li.dataset.i)});
    btn.addEventListener('click',()=>{wrap.classList.contains('open')?ctl.close():(ctl.show(''),input.focus({preventScroll:true}))});
    input.addEventListener('click',()=>{if(input.readOnly)wrap.classList.contains('open')?ctl.close():ctl.show('')});
    input.addEventListener('focus',()=>{if(!input.readOnly&&!wrap.classList.contains('open'))ctl.show('')});
    input.addEventListener('input',()=>{if(!input.readOnly)ctl.show(input.value)});
    input.addEventListener('keydown',e=>{
      const isOpen=wrap.classList.contains('open'),lis=[...ul.querySelectorAll('li[data-i]')];
      if(e.key==='Escape'&&isOpen){e.preventDefault();ctl.close();return}
      if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(!isOpen){ctl.show(input.readOnly?'':input.value);return}
        act=Math.min(lis.length-1,Math.max(0,act+(e.key==='ArrowDown'?1:-1)));lis.forEach((l,i)=>l.classList.toggle('on',i===act));lis[act]&&lis[act].scrollIntoView({block:'nearest'})}
      else if(e.key==='Enter'&&isOpen&&act>=0){e.preventDefault();pick(+lis[act].dataset.i)}
      else if(input.readOnly&&(e.key==='Enter'||e.key===' ')){e.preventDefault();isOpen?ctl.close():ctl.show('')}
    });
    input.addEventListener('blur',()=>setTimeout(()=>{if(!wrap.contains(document.activeElement))ctl.close()},120));
    return ctl;
  }
  document.addEventListener('pointerdown',e=>{open.forEach(c=>{})},true);
  document.addEventListener('click',e=>{open.forEach(c=>{})});
  addEventListener('DOMContentLoaded',()=>{});
  $$('.cbi').forEach(make);
  document.addEventListener('pointerdown',e=>{if(!e.target.closest('.cb'))closeAll()},true);
})();
