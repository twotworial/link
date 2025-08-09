// cart.js
(function(){
  const STORAGE_KEY='customin_cart_v1';
  const fmtIDR = n => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n);
  const parseIDR = s => Number(String(s).replace(/[^0-9]/g,'')||0);

  const Cart={
    _sub:[],
    _load(){ try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]')}catch{return[]} },
    _save(items){ localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); this._emit(); },
    _emit(){ const c=this.count(); document.querySelectorAll('[data-cart-count]').forEach(el=>{ el.textContent=c; el.closest('.js-cart-btn,.mini-nav-btn,a,button')?.classList.toggle('has-items',c>0); }); this._sub.forEach(fn=>fn(this.items())); },
    subscribe(fn){ this._sub.push(fn); fn(this.items()); },
    items(){ return this._load(); },
    count(){ return this._load().reduce((a,b)=>a+b.qty,0); },
    total(){ return this._load().reduce((a,b)=>a+b.qty*b.price,0); },
    add(item){ const arr=this._load(); const i=arr.findIndex(x=>x.id===item.id); if(i>-1) arr[i].qty += item.qty||1; else arr.push({...item, qty:item.qty||1}); this._save(arr); },
    update(id,qty){ const arr=this._load().map(x=>x.id===id?{...x,qty:Math.max(1,qty)}:x); this._save(arr); },
    remove(id){ this._save(this._load().filter(x=>x.id!==id)); },
    clear(){ localStorage.removeItem(STORAGE_KEY); this._emit(); },
    open(){ ensureDrawer(); render(); show(true); },
    close(){ show(false); },
    checkoutWA(){ const items=this.items(); if(!items.length) return; const lines=items.map(i=>`• ${i.name} x${i.qty} — ${fmtIDR(i.qty*i.price)}`); const text=`Halo Customin.co,%0ASaya ingin order:%0A${lines.join('%0A')}%0A%0ATotal: ${fmtIDR(this.total())}%0A%0AAlamat: %0AMetode Bayar:`; const url=`https://wa.me/628888085772?text=${text}`; window.open(url,'_blank'); }
  }; window.Cart=Cart;

  function ensureDrawer(){ if(document.getElementById('cartDrawer')) return;
    const overlay=document.createElement('div'); overlay.id='cartDrawerOverlay'; overlay.addEventListener('click',()=>Cart.close()); document.body.appendChild(overlay);
    const box=document.createElement('div'); box.id='cartDrawer'; box.innerHTML=`
      <div class="cart-head">
        <h3>Keranjang</h3>
        <button class="cart-close" aria-label="Tutup"><span class="iconify" data-icon="mdi:close"></span></button>
      </div>
      <div class="cart-body" id="cartBody"></div>
      <div class="cart-foot">
        <div class="cart-total"><span>Total</span><strong id="cartTotal">Rp 0</strong></div>
        <div class="cart-actions">
          <button class="btn" id="clearCart">Hapus Semua</button>
          <button class="btn btn-primary" id="checkoutWA">Checkout via WhatsApp</button>
        </div>
      </div>`; document.body.appendChild(box);
    box.querySelector('.cart-close').addEventListener('click',()=>Cart.close());
    box.querySelector('#clearCart').addEventListener('click',()=>{Cart.clear(); render();});
    box.querySelector('#checkoutWA').addEventListener('click',()=>Cart.checkoutWA());
  }
  function show(v){ document.getElementById('cartDrawer')?.classList.toggle('show',v); document.getElementById('cartDrawerOverlay')?.classList.toggle('show',v); }
  function render(){ const body=document.getElementById('cartBody'), total=document.getElementById('cartTotal'); if(!body||!total) return;
    const items=Cart.items(); if(!items.length){ body.innerHTML=`<div class="cart-empty">Keranjang kosong.</div>`; } else { body.innerHTML=items.map(i=>`
      <div class="cart-item" data-id="${i.id}">
        <img src="${i.image||''}" alt="${i.name}">
        <div>
          <div class="ci-name">${i.name}</div>
          <div class="ci-qty">
            <button class="ci-dec" aria-label="Kurangi">−</button>
            <span class="ci-val">${i.qty}</span>
            <button class="ci-inc" aria-label="Tambah">+</button>
          </div>
        </div>
        <div class="ci-price">${fmtIDR(i.price*i.qty)}</div>
      </div>`).join(''); }
    total.textContent = fmtIDR(Cart.total());
    body.querySelectorAll('.cart-item').forEach(row=>{
      const id=row.dataset.id;
      row.querySelector('.ci-dec').addEventListener('click',()=>{ const cur=Number(row.querySelector('.ci-val').textContent); Cart.update(id, Math.max(1, cur-1)); render(); });
      row.querySelector('.ci-inc').addEventListener('click',()=>{ const cur=Number(row.querySelector('.ci-val').textContent); Cart.update(id, cur+1); render(); });
      row.querySelector('.ci-price').addEventListener('dblclick',()=>{ Cart.remove(id); render(); });
    });
  }
  function bindGlobal(){
    document.querySelectorAll('.js-cart-btn').forEach(btn=>btn.addEventListener('click',e=>{ e.preventDefault(); ensureDrawer(); render(); show(true);}));
    // Add-to-cart handler if a page has product detail CTA
    const addBtn = document.querySelector('.pd-addcart-btn');
    if(addBtn){
      addBtn.addEventListener('click', (e)=>{
        // If it's an <a href="..."> to WA, prevent and add to cart instead
        e.preventDefault();
        const title = (document.querySelector('.pd-title')?.textContent || 'Produk').trim();
        const priceText = (document.querySelector('.pd-price')?.textContent || '0');
        const price = parseIDR(priceText);
        const qty = Number(document.querySelector('.qty-value')?.textContent || '1');
        const img = document.getElementById('mainProductImg')?.getAttribute('src') || '';
        const id = (title+'|'+price).toLowerCase().replace(/[^a-z0-9]+/g,'-');
        Cart.add({id,name:title,price,image:img,qty});
        ensureDrawer(); render(); show(true);
      });
    }
  }
  Cart.subscribe(()=>{});
  document.addEventListener('DOMContentLoaded', ()=>{ bindGlobal(); ensureDrawer(); Cart._emit(); });
})();