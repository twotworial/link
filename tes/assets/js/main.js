// main.js
(()=>{
  const q=s=>document.querySelector(s), qa=s=>Array.from(document.querySelectorAll(s));
  const ready=fn=>(document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn());

  function initMenuPopup(){
    const btn=q('#menuButton'), menu=q('#popupMenu'); if(!btn||!menu) return;
    btn.addEventListener('click',e=>{e.stopPropagation();menu.classList.toggle('show');btn.setAttribute('aria-expanded',menu.classList.contains('show'));});
    document.addEventListener('click',e=>{ if(!menu.contains(e.target)) menu.classList.remove('show'); });
  }

  function initSlider(){
    if(!q('.main-slider') || !window.Swiper) return;
    new Swiper('.main-slider',{loop:true,speed:600,autoplay:{delay:3000,disableOnInteraction:false,pauseOnMouseEnter:true},pagination:{el:'.swiper-pagination',clickable:true}});
  }

  function initTabs(){
    const tabs=qa('.pd-tab'), panels=qa('.pd-tab-panel'); if(!tabs.length) return;
    tabs.forEach((t,i)=>t.addEventListener('click',()=>{
      tabs.forEach((x,j)=>{x.classList.toggle('active',i===j);x.setAttribute('aria-selected',i===j)});
      panels.forEach((p,j)=>p.classList.toggle('active',i===j));
    }));
  }

  function initProductGallery(){
    const main=q('#mainProductImg'), thumbs=qa('.pd-gallery-thumbs .thumb'); if(!main||!thumbs.length) return;
    thumbs.forEach((b,_,arr)=>b.addEventListener('click',()=>{const img=b.querySelector('img'); if(!img) return; main.src=img.src; main.alt=img.alt||''; arr.forEach(x=>x.classList.remove('active')); b.classList.add('active'); }));
  }

  ready(()=>{ initMenuPopup(); initSlider(); initTabs(); initProductGallery(); });
})();