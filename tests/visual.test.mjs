import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import fs from 'node:fs';
fs.mkdirSync('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const errors=[];
const base='http://127.0.0.1:4173/';
async function load(page){page.on('pageerror',e=>errors.push(e.message));await page.goto(base,{waitUntil:'domcontentloaded'});await page.locator('.hero').waitFor();await page.locator('.hero-image img').waitFor();}
async function noOverflow(page,mode){const ok=await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2);assert.ok(ok,mode+' has horizontal overflow');}
try{
 const desktop=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 await load(desktop);await noOverflow(desktop,'desktop');
 await desktop.screenshot({path:'artifacts/home-viewport.png'});
 await desktop.screenshot({path:'artifacts/01-home-atelier.png',fullPage:true});
 await desktop.locator('.theme-toggle').click();await desktop.locator('.theme-popover [data-theme-pick="noir"]').click();
 await desktop.screenshot({path:'artifacts/02-home-noir.png',fullPage:true});
 await desktop.locator('.theme-toggle').click();await desktop.locator('.theme-popover [data-theme-pick="malachite"]').click();
 await desktop.screenshot({path:'artifacts/03-home-malachite.png',fullPage:true});
 await desktop.goto(base+'#/catalog');await desktop.locator('.product-card').first().waitFor();
 assert.equal(await desktop.locator('.product-card').count(),24);
 assert.ok(await desktop.locator('#item-count').textContent().then(t=>t.includes('1406')),'catalog inventory count is visible');
 assert.ok(await desktop.locator('.product-card img').first().evaluate(el=>el.complete&&el.naturalWidth>0),'catalog image not loaded');
 await desktop.locator('.product-zoom').first().click();
 await desktop.locator('.quick-view-modal').waitFor();
 assert.ok(await desktop.locator('#quick-photo').evaluate(el=>el.complete&&el.naturalWidth>0),'large photo not loaded');
 await desktop.locator('.modal-close').click();
 await desktop.locator('.product-media').first().click();
 assert.ok(await desktop.locator('.product-media').first().evaluate(el=>el.classList.contains('is-playing')),'click motion missing');
 await desktop.screenshot({path:'artifacts/04-catalog-motion.png',fullPage:true});
 await desktop.goto(base+'#/admin');await desktop.locator('.admin-shell').waitFor();
 await desktop.screenshot({path:'artifacts/05-admin-dashboard.png',fullPage:true});
 await desktop.locator('.admin-sidebar [data-admin-tab="products"]').click();
 await desktop.screenshot({path:'artifacts/06-admin-products.png',fullPage:true});
 await desktop.locator('[data-action="product-new"]').click();
 const front=fs.readFileSync('docs/atelier-coat.jpg'),back=fs.readFileSync('docs/atelier-dress.jpg');
 await desktop.locator('#admin-images').setInputFiles([
  {name:'front.jpg',mimeType:'image/jpeg',buffer:front},
  {name:'back.jpg',mimeType:'image/jpeg',buffer:back}
 ]);
 await desktop.locator('.admin-image-thumb').nth(1).waitFor();
 assert.equal(await desktop.locator('.admin-image-thumb').count(),2,'multiple photos are previewed in admin');
 await desktop.locator('#admin-image-preview').scrollIntoViewIfNeeded();
 await desktop.screenshot({path:'artifacts/admin-multi-photo-upload.png'});
 await desktop.locator('#product-form [name="name"]').fill('Gallery upload check');
 await desktop.locator('#product-form [name="category"]').fill('Тестовая коллекция');
 await desktop.locator('#product-form [name="price"]').fill('1000');
 await desktop.locator('#product-form button[type="submit"]').click();
 await desktop.locator('#admin-search').fill('Gallery upload check');
 await desktop.locator('[data-action="product-edit"]').click();
 assert.equal(await desktop.locator('.admin-image-thumb').count(),2,'uploaded photos persist after saving');
 await desktop.locator('.modal-close').click();
 await desktop.goto(base+'#/catalog');await desktop.locator('#catalog-search').fill('Gallery upload check');
 await desktop.locator('.product-zoom').click();await desktop.locator('.quick-view-modal').waitFor();
 assert.equal(await desktop.locator('#quick-photo-count').textContent(),'1 / 2');
 await desktop.locator('[data-action="quick-move"][data-delta="1"]').click();
 assert.equal(await desktop.locator('#quick-photo-count').textContent(),'2 / 2','gallery next photo works');
 await desktop.waitForTimeout(3600);
 await desktop.screenshot({path:'artifacts/product-gallery-modal.png'});
 await desktop.locator('.modal-close').click();
 await desktop.goto(base+'#/studio');await desktop.locator('#studio-stage').waitFor();
 await desktop.screenshot({path:'artifacts/07-studio.png',fullPage:true});
 await noOverflow(desktop,'studio');
 const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 await load(mobile);await noOverflow(mobile,'mobile home');
 await mobile.screenshot({path:'artifacts/08-iphone-home.png',fullPage:true});
 await mobile.goto(base+'#/catalog');await mobile.locator('.product-card').first().waitFor();
 await noOverflow(mobile,'mobile catalog');
 await mobile.locator('.product-media').first().tap();
 assert.ok(await mobile.locator('.product-media').first().evaluate(el=>el.classList.contains('is-playing')),'touch motion missing');
 await mobile.screenshot({path:'artifacts/09-iphone-catalog.png',fullPage:true});
 await mobile.goto(base+'#/admin');await mobile.locator('.admin-shell').waitFor();await noOverflow(mobile,'mobile admin');
 await mobile.screenshot({path:'artifacts/10-iphone-admin.png',fullPage:true});
 assert.deepEqual(errors,[],'browser errors');
 console.log('PASS: screenshots across 3 themes, desktop/mobile layouts, catalog, hover/touch media, admin, studio; no browser errors');
}finally{await browser.close();}
