import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';

const html = readFileSync('index.html', 'utf8');
const errors = [];
const virtualConsole = new VirtualConsole();
virtualConsole.on('jsdomError', error => errors.push(error.message));
const dom = new JSDOM(html, {
  url: 'https://genocide12.github.io/EDELNERA/',
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  virtualConsole,
  beforeParse(window) { window.scrollTo = () => {}; }
});
const { document, MouseEvent, KeyboardEvent } = dom.window;

try {
  assert.equal(document.querySelector('#about'), null, 'brand About page was not removed');
  assert.equal(document.querySelector('[data-go="about"]'), null, 'dead brand link found');
  assert.equal(document.querySelectorAll('#products .product').length, 8, 'catalogue should contain eight products');
  assert.equal(document.querySelectorAll('#featured .product').length, 4, 'homepage featured should contain four items');

  const media = document.querySelector('#products .kinetic-media');
  assert.ok(media, 'interactive product media missing');
  media.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  assert.ok(media.classList.contains('is-playing'), 'tap does not trigger animation');

  const media2 = document.querySelectorAll('#products .kinetic-media')[1];
  media2.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
  assert.ok(media2.classList.contains('is-playing'), 'keyboard Enter does not trigger animation');

  document.querySelector('[data-mode="malachite"]').click();
  assert.equal(document.body.dataset.theme, 'malachite', 'theme switching failed');

  document.querySelector('[data-detail="0"]').click();
  assert.ok(document.querySelector('#detail').classList.contains('active'), 'detail navigation failed');

  document.querySelector('[data-add="0"]').click();
  assert.ok(document.querySelector('#cart').classList.contains('active'), 'cart navigation failed');
  assert.equal(document.querySelector('#qty').textContent, '1', 'cart quantity failed');

  for (const file of [
    'docs/hero.jpg', 'docs/atelier-coat.jpg', 'docs/atelier-dress.jpg',
    'docs/atelier-bag.jpg', 'docs/atelier-suit.jpg', 'docs/architecture.svg'
  ]) assert.ok(existsSync(file), 'missing README image: '+file);

  assert.deepEqual(errors, [], 'browser script errors: '+errors.join('; '));
  console.log('PASS: pages, navigation, catalogue, animation tap/keyboard, themes, cart, README imagery');
} finally {
  dom.window.close();
}
