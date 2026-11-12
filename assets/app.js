(function edelneraApp(){
'use strict';
const STORAGE='edelnera:atelier-v3', PORTRAIT_MAX=8*1024*1024;
const money=n=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(Number(n)||0)+' ₽';
const x=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const asURL=v=>{let u=String(v||'').trim();return /^(https:\/\/|docs\/|assets\/|data:image\/(png|jpeg|webp);base64,|blob:)/i.test(u)?u:'';};
const image=p=>asURL(p?.image)||'docs/atelier-coat.jpg';
const baseProducts=[
{id:'coat-atelier',name:'Atelier Wool Coat',category:'Пальто',price:24900,compare:28900,stock:8,sizes:['XS','S','M','L'],image:'docs/atelier-coat.jpg',video:'',badge:'NEW EDITION',color:'Тёплый песок',material:'Шерсть / эластан',description:'Продуманный силуэт и мягкая линия плеча. Пальто, которое выбирает вас, а не наоборот.',featured:true},
{id:'dress-muse',name:'Muse Evening Dress',category:'Платья',price:18700,compare:0,stock:12,sizes:['XS','S','M','L','XL'],image:'docs/atelier-dress.jpg',video:'',badge:'EDITOR’S PICK',color:'Натуральный',material:'Вискоза / шёлк',description:'Лёгкая пластика ткани и чистая архитектура линий. Для важных моментов без лишних слов.',featured:true},
{id:'bag-elan',name:'Élan Signature Bag',category:'Аксессуары',price:13200,compare:0,stock:6,sizes:['ONE SIZE'],image:'docs/atelier-bag.jpg',video:'',badge:'LIMITED',color:'Карамель',material:'Экокожа',description:'Выразительная форма и тактильные детали. Минимум визуального шума.',featured:true},
{id:'suit-line',name:'Line Tailored Suit',category:'Костюмы',price:32900,compare:36900,stock:4,sizes:['S','M','L','XL'],image:'docs/atelier-suit.jpg',video:'',badge:'ATELIER',color:'Графит',material:'Шерсть / вискоза',description:'Строгий характер современной классики. Гармония структуры и движения.',featured:true},
{id:'coat-heritage',name:'Heritage Trench',category:'Пальто',price:21900,compare:0,stock:9,sizes:['S','M','L','XL'],image:'docs/atelier-coat.jpg',video:'',badge:'',color:'Песочный',material:'Хлопок / полиэстер',description:'Лаконичная форма, для города и путешествий.',featured:false},
{id:'dress-noire',name:'Noire Midi Dress',category:'Платья',price:16400,compare:19800,stock:5,sizes:['XS','S','M','L'],image:'docs/atelier-dress.jpg',video:'',badge:'SELECTED',color:'Чёрный',material:'Вискоза',description:'Чистая линия и элегантный силуэт.',featured:false},
{id:'bag-classic',name:'EDELNERA Small Tote',category:'Аксессуары',price:9800,compare:0,stock:13,sizes:['ONE SIZE'],image:'docs/atelier-bag.jpg',video:'',badge:'',color:'Шоколад',material:'Экокожа',description:'Всё необходимое, без ничего лишнего.',featured:false},
{id:'suit-studio',name:'Studio Blazer',category:'Костюмы',price:15400,compare:0,stock:7,sizes:['XS','S','M','L','XL'],image:'docs/atelier-suit.jpg',video:'',badge:'',color:'Тёмно-зелёный',material:'Твил',description:'Пластичная посадка, выразительные детали.',featured:false}
];
const seed=()=>({products:JSON.parse(JSON.stringify(baseProducts)),cart:[],favorites:[],orders:[],coupons:[{code:'WELCOME10',discount:10,active:true}],profile:{height:'',chest:'',waist:'',hips:'',shoulders:'',name:''},settings:{season:'AUTUMN / WINTER 2026—27',heroTitle:'Искусство\nбыть собой.',heroSubtitle:'Современная элегантность, созданная вокруг вашей индивидуальности.',heroVideo:'',announcement:'THE EDELNERA EDITION'},theme:'atelier'});
function load(){try{const raw=localStorage.getItem(STORAGE);if(!raw)return seed();const a=JSON.parse(raw);const s=seed();if(a&&typeof a==='object'){for(const key of ['products','cart','favorites','orders','coupons'])if(Array.isArray(a[key]))s[key]=a[key];if(a.profile&&typeof a.profile==='object')s.profile={...s.profile,...a.profile};if(a.settings&&typeof a.settings==='object')s.settings={...s.settings,...a.settings};if(['atelier','noir','malachite'].includes(a.theme))s.theme=a.theme;}return s}catch(e){return seed()}}
let db=load();
const view={route:'home',filter:'Все',sort:'featured',search:'',selectedSize:'M',adminTab:'dashboard',editId:null,pick:db.products[0]?.id,face:null,faceX:40,faceY:10,faceScale:1,motion:false,uploadedImage:null,appliedPromo:'',orderDone:null,adminSearch:'',videoPreview:null};
const el=id=>document.getElementById(id);
const product=id=>db.products.find(p=>p.id===id);
const categories=()=>['Все',...new Set(db.products.map(p=>p.category).filter(Boolean))];
const save=()=>{try{localStorage.setItem(STORAGE,JSON.stringify(db));return true}catch(e){notice('Мало места в хранилище браузера. Экспортируйте данные.');return false}};
let toastTimer;
function notice(text){const t=el('toast');t.textContent=text;t.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('visible'),3400)}
const rand=()=>Math.random().toString(36).slice(2,9).toUpperCase();
const productsLive=()=>db.products.filter(p=>p.stock>0);
const priceTotal=()=>db.cart.reduce((n,line)=>n+(product(line.id)?.price||0)*line.qty,0);
const discounted=()=>{const p=db.coupons.find(c=>c.active&&c.code===view.appliedPromo);return p?Math.round(priceTotal()*(1-Number(p.discount)/100)):priceTotal()};
const orderTotal=o=>o.items.reduce((s,it)=>s+(Number(it.price)||0)*(Number(it.qty)||0),0)-(Number(o.discount)||0);
const path=(slug='')=>'#/'+slug.replace(/^\//,'');
const nav=(slug)=>{location.hash=path(slug);if(!slug)render()};
const pageHeader=(k,title,description='')=>`<section class="container page-intro"><div class="kicker">${x(k)}</div><h1>${x(title)}</h1>${description?`<p class="muted">${x(description)}</p>`:''}</section>`;
const btn=(label,action,extra='')=>`<button type="button" class="btn ${extra}" data-action="${action}">${label}</button>`;
const imgTag=(p,cl='')=>`<img src="${x(image(p))}" alt="${x(p.name)}" class="${cl}" loading="lazy">`;
const iconHeart=on=>on?'♥':'♡';
function savedTheme(){document.body.dataset.theme=db.theme;document.querySelectorAll('[data-theme-pick]').forEach(b=>b.classList.toggle('active',b.dataset.themePick===db.theme));}
function promoDiscount(code){return db.coupons.find(c=>c.active&&c.code.toUpperCase()===String(code).toUpperCase())||null}
function card(p){
const fav=db.favorites.includes(p.id);
const video=asURL(p.video);
return `<article class="product-card" data-id="${x(p.id)}">
 <div class="product-media" tabindex="0" role="button" data-action="media" data-id="${x(p.id)}" aria-label="Оживить изображение: ${x(p.name)}">
 ${imgTag(p)}${video?`<video playsinline muted loop preload="none" src="${x(video)}" aria-label="Видео товара"></video>`:''}
 <span class="media-shimmer"></span><span class="media-progress"></span><span class="media-prompt">${video?'▶ WATCH MOTION':'✦ TOUCH TO ANIMATE'}</span>
 ${p.badge?`<span class="product-badge">${x(p.badge)}</span>`:''}
 </div><button class="wish ${fav?'active':''}" type="button" aria-label="${fav?'Убрать из избранного':'В избранное'}" data-action="favorite" data-id="${x(p.id)}">${iconHeart(fav)}</button>
 <div class="product-info"><span class="kicker muted">${x(p.category)}</span><h3><a href="${path('product/'+p.id)}">${x(p.name)}</a></h3><div class="product-price">${money(p.price)} ${p.compare>p.price?`<span class="strike">${money(p.compare)}</span>`:''}</div>
 <div class="product-foot"><a href="${path('product/'+p.id)}">Подробнее ↗</a><button data-action="quick-add" data-id="${x(p.id)}" type="button">${p.stock?'+ В корзину':'Нет в наличии'}</button></div></div>
 </article>`;
}
function cards(arr){return arr.length?`<div class="grid-products" id="catalog-grid">${arr.map(card).join('')}</div>`:empty('Ничего не найдено','Попробуйте другую категорию или запрос.','catalog','Открыть каталог');}
function empty(title,description,go='catalog',label='В каталог') {return `<div class="empty"><div class="kicker">EDELNERA / NO RESULTS</div><h2>${x(title)}</h2><p class="muted">${x(description)}</p><a class="btn" href="${path(go)}">${x(label)}</a></div>`;}
function home(){
const heroVideo=asURL(db.settings.heroVideo);
const headings=x(db.settings.heroTitle||'Искусство\nбыть собой.').replace(/\n/g,'<br>');
return `<section class="hero">
<div class="hero-content"><div class="kicker">EDELNERA / ${x(db.settings.season)}</div><h1>${headings}</h1>
<p class="hero-intro">${x(db.settings.heroSubtitle)}</p><div class="hero-buttons"><a class="btn light" href="#/catalog">СМОТРЕТЬ КОЛЛЕКЦИЮ <span>↗</span></a><a class="link-under" href="#/studio">ПРИМЕРОЧНАЯ ↗</a></div>
<div class="hero-side-mark">THE ART OF BEING YOURSELF</div></div>
<div class="hero-image">${heroVideo?`<video autoplay loop muted playsinline preload="metadata" poster="docs/hero.jpg" src="${x(heroVideo)}"></video>`:'<img src="docs/hero.jpg" alt="Editorial portrait, EDELNERA collection">'}
<div class="hero-chip">${heroVideo?'FASHION FILM / VIDEO':'EDITORIAL MOTION / PHOTO'}</div><div class="hero-pagination">01 / 03</div></div>
</section>
<div class="ticker"><span>MADE TO EXPRESS</span><span>YOUR SILHOUETTE</span><span>NEW EDITION 2027</span><span>STYLE, PERSONALIZED</span></div>
<section class="section container"><div class="spread" style="margin-bottom:38px"><div><div class="kicker">EXPLORE THE COLLECTION</div><h2 style="margin:15px 0 0">Форма вашей<br>индивидуальности.</h2></div><a class="link-under" href="#/catalog">Вся коллекция ↗</a></div>
<div class="feature-grid">${[
{cat:'Пальто',title:'Outerwear',img:'docs/atelier-coat.jpg',label:'01 / CITY ELEGANCE'},
{cat:'Платья',title:'Evening',img:'docs/atelier-dress.jpg',label:'02 / THE EVENING EDIT'},
{cat:'Костюмы',title:'Tailoring',img:'docs/atelier-suit.jpg',label:'03 / PRECISION'}
].map(t=>`<a class="feature-card" href="${path('catalog?category='+encodeURIComponent(t.cat))}"><img src="${t.img}" alt="${x(t.title)}"><div class="feature-caption"><span class="kicker">${t.label}</span><h3>${t.title} ↗</h3></div></a>`).join('')}</div></section>
<section class="section container" style="padding-top:0"><div class="spread" style="margin-bottom:35px"><div><div class="kicker">CURATED FOR YOU</div><h2 style="margin:15px 0 0">Выбор ателье.</h2></div><a class="link-under" href="#/catalog">Открыть каталог ↗</a></div>${cards(db.products.filter(p=>p.featured).slice(0,4))}</section>
<section class="container"><div class="banner"><div><div class="kicker">YOUR OWN SILHOUETTE</div><h2>Ваше лицо. Ваши мерки.<br>Ваш взгляд на стиль.</h2><p>Соберите свой профиль, выберите образ и посмотрите визуальный предпросмотр. Фотография остаётся только на вашем устройстве.</p></div><a class="btn light" href="#/studio">ПЕРЕЙТИ В STUDIO ↗</a></div></section>
<section class="section container"><div class="spread" style="margin-bottom:25px"><div><div class="kicker">THREE DESIGN DIRECTIONS</div><h2 style="margin-top:16px">Настроение EDELNERA.</h2></div></div><div class="grid-three">${[['atelier','01','ATELIER','Тёплая архитектура света'],['noir','02','NOIR','Современная глубина'],['malachite','03','MALACHITE','Свежесть природного минерала']].map(([theme,n,name,sub])=>`<button class="panel" type="button" data-theme-pick="${theme}" style="text-align:left"><div class="kicker">${n} / DIRECTION</div><h3 class="serif" style="font-size:2.1rem;margin:14px 0">${name}</h3><p class="muted small">${sub}</p><span class="link-under">Примерить оформление ↗</span></button>`).join('')}</div></section>`;
}
function filteredProducts(){
let arr=[...db.products];if(view.filter!=='Все')arr=arr.filter(p=>p.category===view.filter);
if(view.search.trim()){const q=view.search.toLocaleLowerCase('ru');arr=arr.filter(p=>[p.name,p.category,p.color,p.description].some(v=>String(v||'').toLocaleLowerCase('ru').includes(q)));}
if(view.sort==='price-asc')arr.sort((a,b)=>a.price-b.price);
if(view.sort==='price-desc')arr.sort((a,b)=>b.price-a.price);
if(view.sort==='name')arr.sort((a,b)=>a.name.localeCompare(b.name,'ru'));
if(view.sort==='featured')arr.sort((a,b)=>Number(b.featured)-Number(a.featured));
return arr;
}
function catalog(){
const arr=filteredProducts();
return `${pageHeader('COLLECTION / 2027','Коллекция.','Каждая вещь — продолжение характера. Наведите курсор или коснитесь фотографии, чтобы оживить кадр.')}
<section class="container"><div class="strip"><div class="filters">${categories().map(c=>`<button class="filter-pill ${c===view.filter?'active':''}" data-action="filter" data-value="${x(c)}">${x(c)}</button>`).join('')}</div><span class="muted tiny" id="item-count">${arr.length} товаров</span></div>
<div class="catalog-controls"><input id="catalog-search" class="field site-input" type="search" placeholder="Поиск по коллекции..." value="${x(view.search)}" aria-label="Поиск по каталогу">
<label class="small">Сортировка <select class="field" id="catalog-sort" style="margin-left:9px;width:auto;min-width:180px"><option value="featured" ${view.sort==='featured'?'selected':''}>Рекомендованные</option><option value="price-asc" ${view.sort==='price-asc'?'selected':''}>Сначала дешевле</option><option value="price-desc" ${view.sort==='price-desc'?'selected':''}>Сначала дороже</option><option value="name" ${view.sort==='name'?'selected':''}>По названию</option></select></label></div>
<div id="catalog-area">${cards(arr)}</div></section>`;
}
function detail(id){
const p=product(id);if(!p)return empty('Товар не найден','Эта модель отсутствует в текущем каталоге.');
const sizes=Array.isArray(p.sizes)&&p.sizes.length?p.sizes:['ONE SIZE'];
if(!sizes.includes(view.selectedSize))view.selectedSize=sizes[0];
const rec=recommend(p);
return `<div class="container"><div class="breadcrumb"><a href="#/">Главная</a> / <a href="#/catalog">Коллекция</a> / ${x(p.category)}</div>
<div class="detail-grid"><div class="detail-photo">${imgTag(p)}${asURL(p.video)?`<button class="btn small" type="button" data-action="product-video" data-id="${x(p.id)}" style="position:relative;bottom:56px;left:20px">▶ Посмотреть видео модели</button>`:''}</div>
<div class="detail-side"><div class="kicker">${x(p.category)} / EDELNERA EDITION</div><h1>${x(p.name)}</h1><div class="detail-price">${money(p.price)} ${p.compare>p.price?`<span class="strike">${money(p.compare)}</span>`:''}</div>
<p class="muted">${x(p.description)}</p><div class="info-table"><div><span>Материал</span><strong>${x(p.material)}</strong></div><div><span>Цвет</span><strong>${x(p.color)}</strong></div><div><span>На складе</span><strong>${Math.max(0,Number(p.stock)||0)} шт. (демо)</strong></div></div>
<div class="spread"><strong class="small">ВЫБЕРИТЕ РАЗМЕР</strong><a class="tiny muted" href="#/profile">Мои мерки ↗</a></div><div class="size-row">${sizes.map(size=>`<button class="size-pill ${view.selectedSize===size?'selected':''}" data-action="size" data-value="${x(size)}">${x(size)}</button>`).join('')}</div>
${rec?`<div class="notice"><strong>Ориентир по вашим меркам:</strong> ${x(rec)}. Проверьте таблицу конкретного производителя: это демонстрационный расчёт.</div>`:''}
<div class="detail-actions"><button class="btn" data-action="add" data-id="${x(p.id)}" ${p.stock<=0?'disabled':''}>ДОБАВИТЬ В КОРЗИНУ ↗</button><button class="btn outline" data-action="favorite" data-id="${x(p.id)}">${iconHeart(db.favorites.includes(p.id))} Сохранить</button></div>
<div class="spread"><a class="link-under" href="#/studio?item=${encodeURIComponent(p.id)}">Примерить образ ↗</a><button class="btn ghost small" data-action="share-product" data-id="${x(p.id)}">Поделиться ↗</button></div>
<div class="notice">Это демонстрационная коллекция. Характеристики, наличие, цены и изображения — примеры. Реальные покупки отключены.</div>
</div></div>
<div class="section"><div class="spread" style="margin-bottom:27px"><h2>Возможно, вам понравится.</h2><a class="link-under" href="#/catalog">Каталог ↗</a></div>${cards(db.products.filter(q=>q.id!==p.id).slice(0,4))}</div></div>`;
}
function recommend(p){
if(p.sizes?.includes('ONE SIZE'))return '';
const bust=Number(db.profile.chest);if(!bust)return '';
return bust<84?'XS':bust<92?'S':bust<100?'M':bust<110?'L':'XL';
}
function favorites(){
const arr=db.products.filter(p=>db.favorites.includes(p.id));
return pageHeader('YOUR SELECTION','Избранное.','Сохраняйте вещи, которые хочется увидеть снова.')+`<section class="container">${cards(arr)}</section>`;
}
function cart(){
const lines=db.cart.filter(l=>product(l.id));
const discount=priceTotal()-discounted();
return pageHeader('THE EDIT / YOUR BAG','Ваша корзина.','Соберите образ. Оформление заказа работает в демонстрационном режиме.')+
`<section class="container">${!lines.length?empty('Пока ничего нет','Сделайте первый выбор для своей коллекции.'):
`<div class="layout-aside"><div>${lines.map(l=>{const p=product(l.id);return `<div class="line-item">${imgTag(p)}<div class="grow"><div class="kicker muted">${x(p.category)}</div><h3><a href="${path('product/'+p.id)}">${x(p.name)}</a></h3><div class="muted tiny">Размер: ${x(l.size)}</div><div class="qty-controls" style="margin-top:13px"><button data-action="cart-qty" data-id="${x(p.id)}" data-size="${x(l.size)}" data-delta="-1" aria-label="Уменьшить количество">−</button><span>${l.qty}</span><button data-action="cart-qty" data-id="${x(p.id)}" data-size="${x(l.size)}" data-delta="1" aria-label="Увеличить количество">+</button></div></div><div style="text-align:right"><strong class="small">${money(p.price*l.qty)}</strong><br><button class="btn ghost small" data-action="cart-remove" data-id="${x(p.id)}" data-size="${x(l.size)}">Удалить</button></div></div>`}).join('')}</div>
<div class="panel cart-summary"><div class="kicker">ORDER SUMMARY</div><h3 class="serif" style="margin:17px 0 25px;font-size:1.8rem">Ваш выбор</h3>
<div class="summary-row"><span>Товары</span><strong>${money(priceTotal())}</strong></div><div class="summary-row"><span>Доставка</span><span>Определяется в заказе</span></div>
${discount?`<div class="summary-row"><span>Скидка</span><span>−${money(discount)}</span></div>`:''}
<div class="summary-row" style="font-size:1.2rem;border-top:1px solid var(--line);padding-top:19px"><span>Итого</span><strong>${money(discounted())}</strong></div>
<form id="coupon-form" class="field-group" style="margin:21px 0 10px"><label class="field-label" for="coupon">Промокод</label><div style="display:flex;gap:6px"><input class="field" id="coupon" name="code" placeholder="WELCOME10" value="${x(view.appliedPromo)}"><button class="btn small" type="submit">OK</button></div></form>
<a href="#/checkout" class="btn" style="width:100%">ДЕМО-ОФОРМЛЕНИЕ ↗</a><p class="file-note" style="margin:15px 0 0">Оплата и отправка заказа продавцу не выполняются. Данные останутся на этом устройстве.</p></div></div>`}</section>`;
}
function checkout(){
if(!db.cart.length)return empty('Корзина пуста','Добавьте товары перед оформлением.');
return pageHeader('CHECKOUT / DEMO','Оформление.','Вы увидите, как устроен заказ. Платёж, доставка и отправка данных в магазин отключены.')+
`<section class="container"><div class="layout-aside"><form id="checkout-form" class="panel"><h3 class="serif" style="font-size:2rem">Контактные данные</h3><div class="notice">Демо-режим. Используйте вымышленные данные: информация сохраняется только в этом браузере и не отправляется продавцу.</div>
<div class="grid-two"><div class="field-group"><label class="field-label">Имя для заказа<input class="field" name="customer" required maxlength="80" placeholder="Алексей"></label></div><div class="field-group"><label class="field-label">Email (необязательно)<input class="field" type="email" name="email" maxlength="110" placeholder="example@example.com"></label></div></div>
<div class="field-group"><label class="field-label">Получение</label><select class="field" name="delivery"><option>Курьер (демо)</option><option>Самовывоз (демо)</option></select></div>
<div class="field-group"><label class="field-label">Комментарий (необязательно)</label><textarea class="field" name="note" rows="3" maxlength="250" placeholder="Комментарий к демо-заказу"></textarea></div>
<label class="small"><input type="checkbox" name="agree" required> Я понимаю, что это демонстрация без оплаты и доставки.</label><br><button class="btn" type="submit" style="margin-top:24px">СОЗДАТЬ ДЕМО-ЗАКАЗ →</button></form>
<div class="panel cart-summary"><div class="kicker">ORDER PREVIEW</div><h3 class="serif" style="font-size:2rem">Ваш заказ</h3>${db.cart.map(l=>`<div class="summary-row"><span>${x(product(l.id)?.name||'Товар')} · ${l.qty} шт.</span><strong>${money((product(l.id)?.price||0)*l.qty)}</strong></div>`).join('')}<div class="summary-row" style="border-top:1px solid var(--line);padding-top:18px;font-size:1.15rem"><span>Итого</span><strong>${money(discounted())}</strong></div><p class="file-note">После подтверждения заказ появится в вашем профиле и локальной панели администратора.</p></div></div></section>`;
}
function ordersMarkup(orders,admin=false){
if(!orders.length)return `<div class="notice">Пока нет демонстрационных заказов. Добавьте товар в корзину и оформите тестовый заказ.</div>`;
return orders.map(o=>`<div class="order"><div class="order-meta"><div><div class="kicker">${x(o.id)}</div><div class="muted tiny" style="margin-top:7px">${x(new Date(o.date).toLocaleString('ru-RU'))}</div></div><span class="status">● ${x(o.status)}</span><strong>${money(o.total)}</strong></div>
<div class="order-items">${o.items.map(it=>`${x(it.name)} · ${x(it.size)} · ${it.qty} шт.`).join('<br>')}</div>
${admin?`<div class="spread" style="margin-top:16px"><span class="tiny muted">${x(o.customer)} · ${x(o.delivery)}</span><label class="tiny">СТАТУС <select class="field" data-order-status="${x(o.id)}" style="margin-left:9px;width:auto"><option ${o.status==='Новый'?'selected':''}>Новый</option><option ${o.status==='Собирается'?'selected':''}>Собирается</option><option ${o.status==='Отправлен'?'selected':''}>Отправлен</option><option ${o.status==='Завершён'?'selected':''}>Завершён</option><option ${o.status==='Отменён'?'selected':''}>Отменён</option></select></label></div>`:''}
</div>`).join('');
}
function profile(){
const p=db.profile;
return pageHeader('YOUR MEASUREMENTS','Мой силуэт.','Сохраните размеры и загрузите только фото лица. Фото не отправляется на сервер и исчезает после обновления страницы.')+
`<section class="container"><div class="profile-grid">
<div class="panel"><div class="kicker">01 / FACE PORTRAIT</div><h3 class="serif" style="font-size:2rem;margin:17px 0">Ваше лицо.</h3>
<div class="upload-tile" id="portrait-preview">${view.face?`<img src="${x(view.face)}" alt="Фото лица">`:'<div><div class="placeholder">◎</div><p class="small muted">Только портрет лица<br>JPG, PNG, WebP · до 8 МБ</p></div>'}
<div class="upload-tools"><label class="btn small file-label">Загрузить фото<input type="file" id="face-file" accept="image/jpeg,image/png,image/webp"></label><button class="btn outline small" data-action="clear-face">Очистить</button></div></div>
<p class="file-note">Фотография доступна только в этой вкладке и не включается в экспорт JSON. Для настоящей AI-примерки потребуется отдельный сервис и ваше согласие на обработку.</p></div>
<div class="panel"><div class="kicker">02 / BODY PROFILE</div><h3 class="serif" style="font-size:2rem;margin:17px 0">Ваши мерки.</h3>
<form id="profile-form"><div class="grid-two">${[['height','Рост, см',165],['chest','Грудь, см',92],['waist','Талия, см',76],['hips','Бёдра, см',96],['shoulders','Плечи, см',44]].map(([id,label,example])=>`<div class="field-group"><label class="field-label">${label}<input class="field" type="number" name="${id}" min="20" max="250" step="0.5" value="${x(p[id])}" placeholder="${example}"></label></div>`).join('')}</div>
<div class="field-group"><label class="field-label">Имя профиля (необязательно)<input class="field" name="name" maxlength="60" value="${x(p.name)}" placeholder="Мой образ"></label></div>
<button class="btn" type="submit">СОХРАНИТЬ МЕРКИ</button><button class="btn ghost" type="button" data-action="clear-profile">Очистить</button></form>
<div class="notice">${p.chest?`Ориентировочный размер по груди: <b>${recommend({sizes:['XS','S','M','L']})}</b>.`:'Введите обхват груди для предварительной рекомендации размера.'} Это не гарантирует посадку. Нужна таблица размеров каждого изделия.</div>
<a class="link-under" href="#/studio">Перейти в примерочную →</a></div></div>
<div class="section" style="padding-bottom:0"><div class="spread"><div><div class="kicker">YOUR ORDERS</div><h2 style="margin:13px 0 26px">Мои демо-заказы.</h2></div></div>${ordersMarkup(db.orders)}</div></section>`;
}
function studio(){
const p=product(view.pick)||db.products[0];
const face=view.face;
const rec=p?recommend(p):'';
return pageHeader('EDELNERA PERSONAL STUDIO','Примерочная.','Выберите вещь, добавьте лицо и вручную настройте положение портрета. Это композиционный предпросмотр — не физическая AI-примерка.')+
`<section class="container"><div class="studio-layout"><div><div class="stage ${view.motion?'stage-motion':''}" id="studio-stage" style="--face-x:${view.faceX}%;--face-y:${view.faceY}%;--face-scale:${view.faceScale}">
${p?`<img class="stage-image" src="${x(image(p))}" alt="Образ: ${x(p.name)}">`:''}
${face?`<img id="studio-face" class="stage-face" src="${x(face)}" alt="Наложенный портрет лица" draggable="false">`:''}
<div class="stage-tag">VISUAL CONCEPT · NOT AI TRY-ON</div></div>
<div class="notice"><strong>Как это работает:</strong> фото лица можно перетаскивать по кадру. Кнопка «Оживить» добавляет плавное движение изображения; она не создаёт видео с вашим участием. Для реалистичной замены лица и подбора одежды по телу нужна AI-интеграция.</div></div>
<div><div class="panel"><div class="kicker">01 / BUILD YOUR LOOK</div><h3 class="serif" style="font-size:2.2rem;margin:18px 0">Ваш образ.</h3>
<div class="field-group"><label class="field-label">Модель одежды</label><select class="field" id="studio-item">${db.products.map(i=>`<option value="${x(i.id)}" ${i.id===view.pick?'selected':''}>${x(i.name)}</option>`).join('')}</select></div>
${p?`<div class="spread" style="margin-bottom:22px"><strong>${money(p.price)}</strong><span class="muted small">${x(p.category)}</span></div>`:''}
<div class="grid-two"><a class="btn outline" href="#/profile">${face?'Изменить фото':'Добавить лицо'} ↗</a><button class="btn outline" type="button" data-action="stage-motion">${view.motion?'Остановить':'✦ Оживить кадр'}</button></div>
<div style="margin:26px 0 16px"><div class="kicker">02 / PORTRAIT POSITION</div></div>
${[['face-x','По горизонтали',view.faceX,0,80],['face-y','По вертикали',view.faceY,0,70],['face-scale','Масштаб',view.faceScale,.5,2]].map(([id,label,val,min,max])=>`<label class="slider-row"><span>${label}</span><input id="${id}" type="range" min="${min}" max="${max}" step="${id==='face-scale'?'0.05':'1'}" value="${val}"></label>`).join('')}
<div class="notice">${rec?`Ориентир по вашей мерке груди: <b>${rec}</b>.<br>`:''}Ваши параметры: ${x(db.profile.height||'—')} см / грудь ${x(db.profile.chest||'—')} см / талия ${x(db.profile.waist||'—')} см / бёдра ${x(db.profile.hips||'—')} см.</div>
<button class="btn" data-action="add" data-id="${x(p?.id||'')}" style="width:100%" ${!p?.stock?'disabled':''}>ДОБАВИТЬ В КОРЗИНУ ↗</button></div>
<div class="panel" style="margin-top:16px"><div class="kicker">03 / NEXT-GEN EXPERIENCE</div><h3 class="serif" style="font-size:1.6rem;margin:16px 0">Как будет работать AI-версия.</h3><p class="small muted" style="line-height:1.8">В будущем: фото лица с вашим согласием, точный аватар по меркам, примерка ткани и размеров, генерация фото и видео. Сейчас эта часть не подключена.</p></div></div></div></section>`;
}
function admin(){
const menu=[['dashboard','Обзор'],['products','Товары'],['orders','Заказы'],['promos','Промокоды'],['content','Контент и медиа'],['data','Импорт / экспорт']];
const title=menu.find(([n])=>n===view.adminTab)?.[1]||'Обзор';
let content='';
if(view.adminTab==='dashboard'){
 const total=db.orders.reduce((s,o)=>s+Number(o.total||0),0);
 content=`<div class="stat-grid"><div class="stat"><div class="stat-label">ТОВАРОВ</div><div class="stat-value">${db.products.length}</div></div><div class="stat"><div class="stat-label">ДЕМО-ЗАКАЗОВ</div><div class="stat-value">${db.orders.length}</div></div><div class="stat"><div class="stat-label">СУММА ДЕМО</div><div class="stat-value" style="font-size:1.7rem">${money(total)}</div></div><div class="stat"><div class="stat-label">ОСТАТКОВ ВСЕГО</div><div class="stat-value">${db.products.reduce((s,p)=>s+Math.max(0,Number(p.stock)||0),0)}</div></div></div>
 <div class="panel" style="margin-top:21px"><div class="kicker">ADMIN STUDIO / LOCAL MODE</div><h3 class="serif" style="font-size:2rem;margin:14px 0">Магазин под вашим управлением.</h3><p class="muted small" style="max-width:660px;line-height:1.9">Товары, заказы, цены, промокоды и материалы меняются только в вашем браузере. Это демонстрационная админка без авторизации, не общая панель управления сайтом на GitHub. Чтобы перенести изменения, экспортируйте JSON; публикация для всех покупателей потребует защищённого сервера.</p><div class="grid-two"><button class="btn" data-admin-tab="products">Управлять товарами ↗</button><button class="btn outline" data-admin-tab="data">Сохранить каталог ↗</button></div></div>
 <div class="panel" style="margin-top:18px"><div class="kicker">RECENT DEMO ORDERS</div><div style="margin-top:18px">${ordersMarkup(db.orders.slice(0,3),true)}</div></div>`;
}else if(view.adminTab==='products'){
 content=`<div class="spread" style="margin-bottom:20px"><input class="field site-input" type="search" id="admin-search" placeholder="Найти товар..." value="${x(view.adminSearch)}"><button class="btn" data-action="product-new">+ НОВЫЙ ТОВАР</button></div>
 <div class="table-wrap"><table class="admin-table"><thead><tr><th>ФОТО</th><th>НАИМЕНОВАНИЕ</th><th>КАТЕГОРИЯ</th><th>ЦЕНА</th><th>ОСТАТОК</th><th>ДЕЙСТВИЯ</th></tr></thead><tbody id="admin-product-rows">${adminRows()}</tbody></table></div>`;
}else if(view.adminTab==='orders'){
 content=`<div class="panel"><div class="kicker">DEMONSTRATION ORDER MANAGEMENT</div><p class="file-note">Изменение статуса влияет только на заказы, созданные в этом браузере. Сервис доставки и уведомления не подключены.</p>${ordersMarkup(db.orders,true)}</div>`;
}else if(view.adminTab==='promos'){
 content=`<div class="panel"><div class="kicker">PROMO / DISCOUNTS</div><h3 class="serif" style="font-size:2rem;margin:16px 0">Промокоды.</h3><form id="promo-form" class="grid-three"><label class="field-label">Код<input class="field" name="code" pattern="[A-Za-z0-9_-]{3,22}" placeholder="STUDIO15" required></label><label class="field-label">Скидка, %<input class="field" name="discount" type="number" min="1" max="80" value="10" required></label><button class="btn" type="submit" style="align-self:end">ДОБАВИТЬ</button></form>
 <div style="margin-top:30px">${db.coupons.map(p=>`<div class="line-item" style="justify-content:space-between"><strong class="promo-code">${x(p.code)}</strong><span>${Number(p.discount)}%</span><button class="btn outline small" data-action="coupon-toggle" data-value="${x(p.code)}">${p.active?'Выключить':'Включить'}</button><button class="btn ghost small" data-action="coupon-delete" data-value="${x(p.code)}">Удалить</button></div>`).join('')}</div></div>`;
}else if(view.adminTab==='content'){
 content=`<div class="panel"><div class="kicker">CONTENT / MEDIA</div><h3 class="serif" style="font-size:2rem;margin:17px 0">Главная и видео.</h3><form id="settings-form">
 <div class="grid-two"><label class="field-group"><span class="field-label">Сезон</span><input class="field" name="season" value="${x(db.settings.season)}" required></label>
 <label class="field-group"><span class="field-label">Текст анонса</span><input class="field" name="announcement" value="${x(db.settings.announcement)}"></label></div>
 <div class="field-group"><label class="field-label">Заголовок главной (перенос Enter)</label><textarea class="field" name="heroTitle" rows="3">${x(db.settings.heroTitle)}</textarea></div>
 <div class="field-group"><label class="field-label">Подзаголовок</label><textarea class="field" name="heroSubtitle" rows="3">${x(db.settings.heroSubtitle)}</textarea></div>
 <div class="field-group"><label class="field-label">Видео на главной — HTTPS ссылка на .mp4/.webm</label><input class="field" type="url" name="heroVideo" placeholder="https://.../fashion.mp4" value="${x(db.settings.heroVideo)}"><div class="field-hint">Пустое поле — анимированная редакционная фотография. Загрузите собственный лицензированный ролик на хостинг и вставьте прямой URL. Токены и секреты сюда не вводите.</div></div>
 <button class="btn" type="submit">СОХРАНИТЬ КОНТЕНТ</button></form></div><div class="panel" style="margin-top:17px"><h3 class="serif" style="font-size:1.8rem">Три оформления</h3><p class="muted small">Изменения темы видны в этом браузере, общую палитру задаёт CSS проекта.</p><div class="filters">${[['atelier','ATELIER'],['noir','NOIR'],['malachite','MALACHITE']].map(([id,label])=>`<button class="filter-pill" data-theme-pick="${id}">${label}</button>`).join('')}</div></div>`;
}else if(view.adminTab==='data'){
 content=`<div class="panel"><div class="kicker">LOCAL STORE / BACKUP</div><h3 class="serif" style="font-size:2rem;margin:17px 0">Экспорт и импорт.</h3><p class="small muted" style="line-height:1.9">Сохраните каталог, заказы и настройки в JSON. Импорт заменяет локальные данные. Фото лица в экспорт не включается. Для общедоступной админки понадобится безопасный backend.</p>
 <div class="grid-two"><button class="btn" data-action="export-json">↓ СКАЧАТЬ JSON</button><label class="btn outline file-label">↑ ИМПОРТИРОВАТЬ JSON<input id="import-json" type="file" accept=".json,application/json"></label></div>
 <div class="notice" style="margin-top:25px">Админские изменения из одного браузера не появляются автоматически у других посетителей GitHub Pages. Это ограничение статического хостинга.</div>
 <button class="btn danger small" data-action="reset-demo">СБРОСИТЬ ВСЕ ДЕМО-ДАННЫЕ</button></div>`;
}
return `<section class="container page-intro" style="padding-bottom:0"><div class="kicker">EDELNERA / STUDIO ADMIN</div><h1>Управление.</h1><p class="muted">Система управления демонстрационным магазином · данные хранятся локально.</p></section>
<section class="container"><div class="admin-shell"><aside class="admin-sidebar"><div class="kicker" style="margin-bottom:21px">CONTROL CENTER / v0.3</div>${menu.map(([id,l])=>`<button data-admin-tab="${id}" class="${view.adminTab===id?'active':''}">${x(l)} <span style="margin-left:auto">↗</span></button>`).join('')}</aside><div class="admin-main">
 <div class="admin-top"><div><div class="kicker">STUDIO ADMIN / ${x(view.adminTab)}</div><h1 style="margin:13px 0 0">${x(title)}</h1></div><a class="btn outline small" href="#/catalog">Смотреть витрину ↗</a></div>
 <div class="notice" style="margin-bottom:22px"><strong>ЛОКАЛЬНАЯ ДЕМО-ПАНЕЛЬ.</strong> Это не защищённая админка с общими данными: любой посетитель видит эту демоверсию, а изменения действуют только в его браузере. Настоящие заказы и платежи отключены.</div>${content}</div></div></section>`;
}
function adminRows(){
return db.products.filter(p=>`${p.name} ${p.category}`.toLowerCase().includes(view.adminSearch.toLowerCase())).map(p=>`<tr><td>${imgTag(p)}</td><td><b>${x(p.name)}</b><div class="muted tiny">${x(p.id)}</div></td><td>${x(p.category)}</td><td>${money(p.price)}</td><td>${Number(p.stock)||0}</td><td><div class="table-actions"><button data-action="product-edit" data-id="${x(p.id)}">Изменить</button><button data-action="product-delete" data-id="${x(p.id)}">×</button></div></td></tr>`).join('')||'<tr><td colspan="6">Товар не найден</td></tr>';
}
function project(){
const prompt=`Ты — команда senior full-stack, UI/UX, QA, fashion creative и security architects. Создай EDELNERA, премиальную интерактивную платформу fashion e-commerce 2027. Три переключаемых дизайн-направления Atelier (светлый), Noir (контрастный) и Malachite (светлый малахит). Живые фото и видео моделей: hover на ПК, tap на iPhone, reduced-motion и fallback. Каталог, фильтры, размерные таблицы, избранное, корзина, промокоды, заказы, кабинет, настоящая защищённая админка с CRUD, загрузкой медиа, импортом и экспортом данных. По желанию пользователя — только фото лица и мерки тела, затем AI-аватар, реалистичная примерка одежды, фотографии и видео с явным согласием. Включи backend с RBAC, приватностью, обработкой изображений, тестированием, мониторингом, аудитом и публикацией. Никаких выдуманных интеграций: не выдавай локальные прототипы, CSS-анимации и демонстрационные расчёты за AI, платежи или серверные функции. Отдельная страница с описанием проекта, функциями, архитектурой и копируемым промптом. GitHub Pages для публичного демо и понятная система релизов.`;
return pageHeader('PROJECT DOSSIER / EDELNERA','За кадром.','Функции, стек, этапы реализации и мастер-промпт, который можно перенести в новый проект.')+
`<section class="container"><div class="project-grid">
${[['01','МАГАЗИН','Каталог, категории, фильтры, поиск, избранное, корзина и демо-оформление.'],
['02','ADMIN STUDIO','Локальный CRUD товаров, управление заказами, промокодами и медиа, экспорт/импорт JSON.'],
['03','ЛИЧНЫЙ СИЛУЭТ','Мерки, рекомендация размера по груди и локальный портрет лица.'],
['04','STYLE STUDIO','Ручная композиция лица поверх демонстрационного фото. Это не AI-примерка.'],
['05','MOTION / VIDEO','CSS-живые кадры и поддержка настоящего MP4/WebM для лицензированных роликов.'],
['06','ТРИ НАПРАВЛЕНИЯ','ATELIER, NOIR, MALACHITE — мобильная и десктопная версии.']].map(([n,h,p])=>`<div class="project-item"><div class="kicker">${n} / DELIVERED IN DEMO</div><h3 style="margin:17px 0">${h}</h3><p>${p}</p></div>`).join('')}</div>
<div class="panel" style="margin-top:24px"><div class="kicker">IMPLEMENTATION STATUS</div><h2 style="margin:16px 0">Что настоящее, а что — следующий этап.</h2>
<p class="muted" style="line-height:1.85">Текущая версия: HTML5, CSS3, JavaScript и localStorage. Нет платного сервера, авторизации, обработки платежей, AI-движка, общих заказов и управления каталогом для всех пользователей. Для полноценного магазина необходим backend, аутентификация, база, CMS, защищённая медиа-пайплайн, проверка лицензий и согласие на фото/видео.</p>
<p class="small">Репозиторий: <a class="link-under" href="https://github.com/Genocide12/EDELNERA" target="_blank" rel="noopener">GITHUB ↗</a> · <a class="link-under" href="https://github.com/Genocide12/EDELNERA/releases" target="_blank" rel="noopener">РЕЛИЗЫ ↗</a></p></div>
<div class="panel" style="margin-top:24px"><div class="spread"><div><div class="kicker">PORTABLE PROJECT BRIEF</div><h2 style="margin:15px 0">Мастер-промпт.</h2></div><button class="btn" type="button" data-action="copy-prompt">СКОПИРОВАТЬ ↗</button></div>
<pre class="project-code" id="master-prompt">${x(prompt)}</pre></div>
</section>`;
}
function render(){
const hash=(location.hash||'#/').replace(/^#\/?/,'');const [raw,qs]=hash.split('?');const [name='home',id]=raw.split('/');view.route=name||'home';
if(name==='catalog'&&qs){const q=new URLSearchParams(qs);if(q.has('category'))view.filter=q.get('category');}
if(name==='studio'&&qs){const q=new URLSearchParams(qs);if(q.has('item')&&product(q.get('item')))view.pick=q.get('item');}
let html;
switch(name){
case '':case 'home':html=home();break;case 'catalog':html=catalog();break;case 'product':html=detail(id);break;
case 'favorites':html=favorites();break;case 'cart':html=cart();break;case 'checkout':html=checkout();break;
case 'profile':html=profile();break;case 'studio':html=studio();break;case 'admin':html=admin();break;
case 'project':html=project();break;default:html=empty('Страница не найдена','Вернуться на витрину EDELNERA.','', 'На главную');
}
el('app').innerHTML=html;
el('cart-count').textContent=db.cart.reduce((n,l)=>n+l.qty,0);el('cart-count').hidden=!db.cart.length;
el('mobile-nav').hidden=true;document.querySelector('.menu-toggle').setAttribute('aria-expanded','false');
el('theme-popover').hidden=true;
if(el('announcement'))el('announcement').firstElementChild.textContent=db.settings.announcement;
savedTheme();
document.querySelectorAll('img').forEach(img=>{img.addEventListener('error',()=>{if(!img.dataset.fallback){img.dataset.fallback='1';img.src='docs/atelier-coat.jpg';}})});
}
function add(id,size=view.selectedSize){
const p=product(id);if(!p||p.stock<=0){notice('Товар сейчас недоступен');return}
if(!p.sizes.includes(size))size=p.sizes[0]||'ONE SIZE';
const line=db.cart.find(l=>l.id===id&&l.size===size);const owned=db.cart.filter(l=>l.id===id).reduce((n,l)=>n+l.qty,0);
if(owned>=p.stock){notice('Достигнут демонстрационный остаток');return}
line?line.qty++:db.cart.push({id,size,qty:1});
save();notice('Добавлено в корзину · '+p.name);render();
}
function animatedMedia(media){
if(!media)return;const video=media.querySelector('video');
if(media._motionTimer)clearTimeout(media._motionTimer);
media.classList.remove('is-playing');void media.offsetWidth;media.classList.add('is-playing');
if(video){video.classList.add('is-ready');video.play().catch(()=>{});}
media._motionTimer=setTimeout(()=>{media.classList.remove('is-playing');if(video&&!media.matches(':hover')){video.pause();video.currentTime=0;video.classList.remove('is-ready')}},3300);
}
function modal(content){
el('modal-root').innerHTML=`<div class="modal-backdrop" data-action="modal-backdrop"><section role="dialog" aria-modal="true" class="modal" aria-label="Редактирование EDELNERA"><button class="modal-close" data-action="modal-close" aria-label="Закрыть">×</button>${content}</section></div>`;
document.body.classList.add('modal-open');el('modal-root').querySelector('.modal-close').focus();
}
function closeModal(){el('modal-root').innerHTML='';document.body.classList.remove('modal-open');view.uploadedImage=null;}
function productModal(id){
const p=id?product(id):null;const data=p||{id:'',name:'',category:'Пальто',price:'',compare:'',stock:1,sizes:['S','M','L'],color:'',material:'',description:'',image:'docs/atelier-coat.jpg',video:'',badge:'',featured:false};
modal(`<div class="kicker">EDELNERA / CATALOGUE EDITOR</div><h2 style="margin:14px 0 25px">${p?'Изменить товар.':'Новый товар.'}</h2>
<form id="product-form"><input name="id" type="hidden" value="${x(data.id)}">
<div class="grid-two"><div class="field-group"><label class="field-label">Название<input class="field" name="name" maxlength="100" value="${x(data.name)}" required></label></div>
<div class="field-group"><label class="field-label">Категория<input class="field" name="category" list="product-categories" maxlength="70" value="${x(data.category)}" required></label><datalist id="product-categories">${categories().slice(1).map(c=>`<option value="${x(c)}">`).join('')}</datalist></div></div>
<div class="grid-three"><label class="field-group"><span class="field-label">Цена, ₽</span><input class="field" type="number" name="price" min="0" value="${x(data.price)}" required></label>
<label class="field-group"><span class="field-label">Старая цена, ₽</span><input class="field" type="number" name="compare" min="0" value="${x(data.compare)}"></label>
<label class="field-group"><span class="field-label">Остаток, шт.</span><input class="field" type="number" name="stock" min="0" value="${x(data.stock)}"></label></div>
<div class="grid-two"><label class="field-group"><span class="field-label">Цвет</span><input class="field" name="color" maxlength="80" value="${x(data.color)}"></label>
<label class="field-group"><span class="field-label">Состав</span><input class="field" name="material" maxlength="100" value="${x(data.material)}"></label></div>
<div class="grid-two"><label class="field-group"><span class="field-label">Размеры через запятую</span><input class="field" name="sizes" maxlength="150" value="${x((data.sizes||[]).join(', '))}"></label>
<label class="field-group"><span class="field-label">Плашка на фото</span><input class="field" name="badge" maxlength="25" value="${x(data.badge)}"></label></div>
<label class="field-group"><span class="field-label">Описание</span><textarea class="field" rows="3" name="description" maxlength="600">${x(data.description)}</textarea></label>
<label class="field-group"><span class="field-label">URL изображения (HTTPS или путь docs/...)</span><input class="field" name="image" value="${x(data.image)}" placeholder="docs/atelier-coat.jpg"></label>
<div class="field-group"><label class="field-label">Или загрузите свою фотографию</label><input type="file" id="admin-image" accept="image/png,image/jpeg,image/webp" class="field"><div class="field-hint">Фото будет сжато и сохранено локально; другие пользователи его не увидят. Для общего каталога нужен сервер.</div></div>
<label class="field-group"><span class="field-label">Видео товара — прямой URL MP4/WebM</span><input class="field" type="url" name="video" value="${x(data.video)}" placeholder="https://.../model.mp4"></label>
<label class="small"><input type="checkbox" name="featured" ${data.featured?'checked':''}> Показывать в подборке на главной</label>
<div class="spread" style="margin-top:25px;flex-wrap:wrap"><button class="btn" type="submit">${p?'СОХРАНИТЬ ТОВАР':'ДОБАВИТЬ ТОВАР'}</button><button class="btn outline" type="button" data-action="modal-close">Отмена</button></div></form>`);
}
function videoModal(p){
const url=asURL(p.video);if(!url)return;
modal(`<div class="kicker">THE MOVING EDIT</div><h2>${x(p.name)}</h2><video controls playsinline autoplay muted loop style="width:100%;max-height:75vh;background:#000" src="${x(url)}"></video><p class="muted small" style="margin:15px 0 0">Это видео предоставлено ссылкой в каталоге. Реальную AI-примерку оно не выполняет.</p>`);
}
function reset(){if(!confirm('Удалить все локальные товары, заказы, мерки, избранное и промокоды этого браузера?'))return;db=seed();view.face=null;view.appliedPromo='';view.pick=db.products[0]?.id;save();render();notice('Демо-данные восстановлены');}
function exportJSON(){
const output={format:'EDELNERA-export-v3',exportedAt:new Date().toISOString(),data:db};
const blob=new Blob([JSON.stringify(output,null,2)],{type:'application/json'});
const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='EDELNERA-backup-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
notice('Файл экспорта подготовлен');
}
function safeImported(o){
if(!o||o.format!=='EDELNERA-export-v3'||!o.data||!Array.isArray(o.data.products)||!Array.isArray(o.data.orders))throw Error('Это не экспорт EDELNERA версии 3');
if(o.data.products.length>500||o.data.orders.length>5000)throw Error('Экспорт слишком большой');
const s=seed();s.products=o.data.products.filter(p=>p&&typeof p.name==='string'&&typeof p.id==='string').map(p=>({
 id:String(p.id).slice(0,80),name:String(p.name).slice(0,100),category:String(p.category||'Другое').slice(0,70),
 price:Math.max(0,Number(p.price)||0),compare:Math.max(0,Number(p.compare)||0),stock:Math.max(0,Math.floor(Number(p.stock)||0)),
 sizes:Array.isArray(p.sizes)?p.sizes.slice(0,20).map(v=>String(v).slice(0,20)):['ONE SIZE'],
 image:asURL(p.image)||'docs/atelier-coat.jpg',video:asURL(p.video),badge:String(p.badge||'').slice(0,25),
 color:String(p.color||'').slice(0,80),material:String(p.material||'').slice(0,100),description:String(p.description||'').slice(0,600),featured:!!p.featured
}));
s.orders=o.data.orders.slice(0,5000).filter(p=>p&&Array.isArray(p.items)&&typeof p.id==='string');
s.favorites=Array.isArray(o.data.favorites)?o.data.favorites.filter(id=>s.products.some(p=>p.id===id)):[];
s.cart=Array.isArray(o.data.cart)?o.data.cart.filter(l=>s.products.some(p=>p.id===l.id)).map(l=>({...l,qty:Math.min(99,Math.max(1,Number(l.qty)||1))})):[];
s.coupons=Array.isArray(o.data.coupons)?o.data.coupons.filter(p=>p&&typeof p.code==='string').slice(0,100):[];
if(o.data.profile&&typeof o.data.profile==='object'){for(const k of Object.keys(s.profile))s.profile[k]=String(o.data.profile[k]||'').slice(0,80);}
if(o.data.settings&&typeof o.data.settings==='object'){for(const k of Object.keys(s.settings))s.settings[k]=String(o.data.settings[k]||'').slice(0,500);}
if(['atelier','noir','malachite'].includes(o.data.theme))s.theme=o.data.theme;
return s;
}
const resizeImage=(file,onDone)=>{const fr=new FileReader();fr.onerror=()=>notice('Не удалось открыть фото');fr.onload=()=>{const im=new Image();im.onload=()=>{const canvas=document.createElement('canvas'),ratio=Math.min(1,800/im.width,980/im.height);canvas.width=Math.max(1,Math.round(im.width*ratio));canvas.height=Math.max(1,Math.round(im.height*ratio));canvas.getContext('2d').drawImage(im,0,0,canvas.width,canvas.height);onDone(canvas.toDataURL('image/jpeg',.78))};im.src=fr.result};fr.readAsDataURL(file)};
function onAction(button,e){
const act=button.dataset.action,id=button.dataset.id,val=button.dataset.value;
if(act==='menu'){el('mobile-nav').hidden=!el('mobile-nav').hidden;button.setAttribute('aria-expanded',String(!el('mobile-nav').hidden));return;}
if(act==='announcement-close'){el('announcement').remove();return;}
if(act==='theme-popover'){el('theme-popover').hidden=!el('theme-popover').hidden;return;}
if(act==='search-focus'){nav('catalog');setTimeout(()=>el('catalog-search')?.focus(),0);return;}
if(act==='favorite'){db.favorites=db.favorites.includes(id)?db.favorites.filter(k=>k!==id):[...db.favorites,id];save();render();notice(db.favorites.includes(id)?'Добавлено в избранное':'Убрано из избранного');return;}
if(act==='filter'){view.filter=val;render();return;}
if(act==='media'){animatedMedia(button);return;}
if(act==='size'){view.selectedSize=val;render();return;}
if(act==='quick-add'||act==='add'){add(id,view.selectedSize);return;}
if(act==='share-product'){const url=location.origin+location.pathname+path('product/'+id);if(navigator.share)navigator.share({url,title:product(id)?.name}).catch(()=>{});else if(navigator.clipboard)navigator.clipboard.writeText(url).then(()=>notice('Ссылка на товар скопирована')).catch(()=>notice('Не удалось скопировать'));return;}
if(act==='product-video'){videoModal(product(id));return;}
if(act==='cart-remove'){db.cart=db.cart.filter(l=>!(l.id===id&&l.size===button.dataset.size));save();render();return;}
if(act==='cart-qty'){const line=db.cart.find(l=>l.id===id&&l.size===button.dataset.size);if(!line)return;let change=Number(button.dataset.delta);let total=db.cart.filter(l=>l.id===id).reduce((n,l)=>n+l.qty,0);if(change>0&&total>=(product(id)?.stock||0)){notice('Достигнут остаток');return}line.qty+=change;if(line.qty<=0)db.cart=db.cart.filter(l=>l!==line);save();render();return;}
if(act==='clear-face'){view.face=null;render();return;}
if(act==='clear-profile'){db.profile={height:'',chest:'',waist:'',hips:'',shoulders:'',name:''};save();render();return;}
if(act==='stage-motion'){view.motion=!view.motion;render();return;}
if(act==='product-new'){productModal();return;}
if(act==='product-edit'){productModal(id);return;}
if(act==='product-delete'){if(!confirm('Удалить товар '+product(id)?.name+'?'))return;db.products=db.products.filter(p=>p.id!==id);db.cart=db.cart.filter(l=>l.id!==id);db.favorites=db.favorites.filter(v=>v!==id);save();render();notice('Товар удалён из демо-каталога');return;}
if(act==='coupon-toggle'){const c=db.coupons.find(p=>p.code===val);if(c)c.active=!c.active;save();render();return;}
if(act==='coupon-delete'){db.coupons=db.coupons.filter(p=>p.code!==val);save();render();return;}
if(act==='export-json'){exportJSON();return;}
if(act==='reset-demo'){reset();return;}
if(act==='copy-prompt'){let src=el('master-prompt').textContent;if(navigator.clipboard)navigator.clipboard.writeText(src).then(()=>notice('Мастер-промпт скопирован')).catch(()=>notice('Не получилось скопировать'));else notice('Выделите и скопируйте текст вручную');return;}
if(act==='modal-close'){closeModal();return;}
if(act==='modal-backdrop'&&e.target===button){closeModal();return;}
}
document.addEventListener('click',e=>{
const pick=e.target.closest('[data-theme-pick]');if(pick){db.theme=pick.dataset.themePick;save();savedTheme();el('theme-popover').hidden=true;notice('Тема: '+db.theme);return;}
const adminTab=e.target.closest('[data-admin-tab]');if(adminTab){view.adminTab=adminTab.dataset.adminTab;render();return;}
const button=e.target.closest('[data-action]');if(button){if(button.dataset.action==='media')e.preventDefault();onAction(button,e);}
});
document.addEventListener('keydown',e=>{
if(e.key==='Escape')closeModal();
const t=e.target.closest?.('.product-media');if(t&&(e.key==='Enter'||e.key===' ')){e.preventDefault();animatedMedia(t);}
});
document.addEventListener('mouseover',e=>{
if(matchMedia('(hover:hover) and (pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
 const m=e.target.closest('.product-media');if(m&&m.querySelector('video')&&!m.contains(e.relatedTarget)){const v=m.querySelector('video');v.classList.add('is-ready');v.play().catch(()=>{});}
}
});
document.addEventListener('mouseout',e=>{
const m=e.target.closest('.product-media');if(m&&m.querySelector('video')&&!m.contains(e.relatedTarget)){const v=m.querySelector('video');v.pause();v.classList.remove('is-ready');}
});
document.addEventListener('input',e=>{
if(e.target.id==='catalog-search'){view.search=e.target.value;const area=el('catalog-area');if(area)area.innerHTML=cards(filteredProducts());const count=el('item-count');if(count)count.textContent=filteredProducts().length+' товаров';}
if(e.target.id==='admin-search'){view.adminSearch=e.target.value;const tbody=el('admin-product-rows');if(tbody)tbody.innerHTML=adminRows();}
const slider=e.target;if(['face-x','face-y','face-scale'].includes(slider.id)){view[{'face-x':'faceX','face-y':'faceY','face-scale':'faceScale'}[slider.id]]=Number(slider.value);const st=el('studio-stage');if(st){st.style.setProperty('--face-x',view.faceX+'%');st.style.setProperty('--face-y',view.faceY+'%');st.style.setProperty('--face-scale',view.faceScale)}}
});
document.addEventListener('change',e=>{
if(e.target.id==='catalog-sort'){view.sort=e.target.value;render();}
if(e.target.id==='studio-item'){view.pick=e.target.value;render();}
if(e.target.dataset.orderStatus){const o=db.orders.find(o=>o.id===e.target.dataset.orderStatus);if(o)o.status=e.target.value;save();render();}
if(e.target.id==='face-file'){const file=e.target.files?.[0];if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>PORTRAIT_MAX){notice('Выберите JPG/PNG/WebP до 8 МБ');return}resizeImage(file,v=>{view.face=v;render();notice('Портрет загружен только в эту вкладку')});}
if(e.target.id==='admin-image'){const file=e.target.files?.[0];if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>PORTRAIT_MAX){notice('Выберите JPG/PNG/WebP до 8 МБ');return}resizeImage(file,v=>{view.uploadedImage=v;notice('Фото подготовлено. Теперь сохраните товар.')});}
if(e.target.id==='import-json'){const f=e.target.files?.[0];if(!f)return;if(f.size>7*1024*1024){notice('JSON должен быть не более 7 МБ');return}const rd=new FileReader();rd.onload=()=>{try{const next=safeImported(JSON.parse(rd.result));if(!confirm('Заменить локальные данные импортированными?'))return;db=next;view.pick=db.products[0]?.id;view.appliedPromo='';save();render();notice('Каталог импортирован')}catch(err){notice('Ошибка импорта: '+err.message)}};rd.readAsText(f);}
});
document.addEventListener('submit',e=>{
const f=e.target;if(!['coupon-form','checkout-form','profile-form','product-form','promo-form','settings-form'].includes(f.id))return;e.preventDefault();
const d=Object.fromEntries(new FormData(f));
if(f.id==='coupon-form'){let code=String(d.code||'').trim().toUpperCase();if(!promoDiscount(code)){notice('Промокод не найден или выключен');return}view.appliedPromo=code;render();notice('Промокод применён');return;}
if(f.id==='checkout-form'){
if(!db.cart.length)return;
const ordered=db.cart.filter(l=>product(l.id)).map(l=>{const p=product(l.id);return{id:p.id,name:p.name,price:p.price,size:l.size,qty:l.qty}});
const discount=priceTotal()-discounted();
const o={id:'ED-'+Date.now().toString().slice(-6)+'-'+rand().slice(0,3),date:new Date().toISOString(),customer:String(d.customer).slice(0,80),email:String(d.email||'').slice(0,110),note:String(d.note||'').slice(0,250),delivery:String(d.delivery),items:ordered,discount,total:discounted(),status:'Новый'};
db.orders.unshift(o);
db.cart.forEach(l=>{const p=product(l.id);if(p)p.stock=Math.max(0,p.stock-l.qty)});
db.cart=[];view.appliedPromo='';save();view.orderDone=o.id;
nav('profile');render();notice('Демо-заказ '+o.id+' создан и виден в профиле');return;
}
if(f.id==='profile-form'){
for(const key of Object.keys(db.profile)){const val=d[key]??'';db.profile[key]=key==='name'?String(val).slice(0,60):(val===''?'':Math.min(250,Math.max(0,Number(val)||0)));}
save();render();notice('Ваши мерки сохранены на устройстве');return;
}
if(f.id==='product-form'){
const id=String(d.id||'');const exists=product(id);
const item={id:exists?.id||'ed-'+Date.now().toString(36)+'-'+rand().slice(0,4).toLowerCase(),name:String(d.name||'').trim().slice(0,100),category:String(d.category||'Другое').slice(0,70),price:Math.max(0,Number(d.price)||0),compare:Math.max(0,Number(d.compare)||0),stock:Math.max(0,Math.floor(Number(d.stock)||0)),
sizes:String(d.sizes||'ONE SIZE').split(',').map(v=>v.trim()).filter(Boolean).slice(0,20),color:String(d.color||'').slice(0,80),material:String(d.material||'').slice(0,100),description:String(d.description||'').slice(0,600),image:view.uploadedImage||asURL(d.image)||'docs/atelier-coat.jpg',video:asURL(d.video),badge:String(d.badge||'').slice(0,25),featured:d.featured==='on'};
if(!item.name){notice('Укажите название');return}
if(exists)Object.assign(exists,item);else db.products.unshift(item);
save();closeModal();render();notice(exists?'Товар обновлён':'Товар добавлен');return;
}
if(f.id==='promo-form'){const code=String(d.code||'').toUpperCase();if(db.coupons.some(c=>c.code===code)){notice('Такой код уже существует');return}db.coupons.push({code,discount:Math.min(80,Math.max(1,Number(d.discount)||1)),active:true});save();render();notice('Промокод добавлен');return;}
if(f.id==='settings-form'){for(const key of ['season','heroTitle','heroSubtitle','announcement'])db.settings[key]=String(d[key]||'').slice(0,500);db.settings.heroVideo=asURL(d.heroVideo);save();render();notice('Настройки локально сохранены');return;}
});
let drag=null;
document.addEventListener('pointerdown',e=>{if(e.target.id==='studio-face'){drag={pointer:e.pointerId};e.target.setPointerCapture(e.pointerId);e.preventDefault()}});
document.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.pointer)return;const s=el('studio-stage');if(!s)return;const box=s.getBoundingClientRect();view.faceX=Math.max(0,Math.min(80,Math.round((e.clientX-box.left)/box.width*100)-10));view.faceY=Math.max(0,Math.min(70,Math.round((e.clientY-box.top)/box.height*100)-7));s.style.setProperty('--face-x',view.faceX+'%');s.style.setProperty('--face-y',view.faceY+'%')});
document.addEventListener('pointerup',()=>{drag=null});
window.addEventListener('hashchange',()=>{render();window.scrollTo({top:0,behavior:'instant'});});
savedTheme();render();
})();