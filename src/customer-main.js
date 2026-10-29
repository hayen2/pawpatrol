// src/customer-main.js
import { supabase } from "./supabase.js";
import { initStorePage } from "./pages/store.js";

const ICONS = {
  logo: '<circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/>',
  bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  paw: '<circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/>',
  box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  truck: '<path d="M1 3h14v13H1zM15 8h4l4 4v4h-8"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
  store: '<path d="M3 9l2-5h14l2 5"/><path d="M3 9v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9"/><path d="M9 22V12h6v10"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>'
};

const icon = (n, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${ICONS[n] || ''}</svg>`;

const theme = {
  get: () => document.documentElement.getAttribute('data-theme') || 'light',
  set(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('mp_theme', t); } catch {}
    const b = document.getElementById('theme-toggle'); 
    if(b) { b.innerHTML = icon(t === 'dark' ? 'sun' : 'moon'); }
  },
  toggle() { this.set(this.get() === 'dark' ? 'light' : 'dark'); }
};

async function bootstrap() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
      window.location.replace("/customer-login.html");
      return;
  }

  // 1. Setup Topbar
  document.getElementById('brand-mark').innerHTML = icon('logo');
  document.getElementById('topbar-avatar').innerHTML = icon('user');
  
  // I-set ang topbar name
  const metaName = session.user.user_metadata?.full_name;
  const displayName = metaName || "Field 1: Christian Villanueva";
  document.getElementById('topbar-name').textContent = displayName;
  
  document.getElementById('theme-toggle').innerHTML = icon('moon');

  // 2. Setup Sidebar
  document.getElementById('nav-browse').innerHTML = icon('cart');
  document.getElementById('nav-cart').innerHTML = icon('cart');
  document.getElementById('nav-pets').innerHTML = icon('paw');
  document.getElementById('nav-orders').innerHTML = icon('box');
  document.getElementById('nav-account').innerHTML = icon('user');
  document.getElementById('nav-logout').innerHTML = icon('logout');
  
  // 3. Setup Account Tiles
  document.getElementById('avatar-holder').innerHTML = icon('user');
  document.getElementById('tile-cart').innerHTML = icon('cart');
  document.getElementById('tile-pets').innerHTML = icon('paw');
  document.getElementById('tile-orders').innerHTML = icon('box');
  
  // 4. Setup Checkout Modal
  document.getElementById('pay-cod').innerHTML = `${icon('truck')} Cash on Delivery`;
  document.getElementById('pay-store').innerHTML = `${icon('store')} Store Pick-up`;
  document.getElementById('close-checkout').innerHTML = icon('x');

  theme.set(theme.get() || 'dark');
  document.getElementById('theme-toggle').addEventListener('click', () => theme.toggle());

  // 5. Init Store
  await initStorePage();
}

bootstrap().catch(err => {
  console.error("❌ Failed to initialize store:", err);
  window.location.replace("/customer-login.html");
});