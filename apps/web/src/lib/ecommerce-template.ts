/**
 * E-commerce fashion store template generator.
 * Produces high-fidelity HTML that matches luxury fashion e-commerce sites
 * (monochrome palette, editorial layout, product grids, split promo banners).
 */

import type { ScanResult } from './scanner'
import type { MotionPreset } from './motion-presets'
import { generateMotionCSS } from './motion-css'
import { generateMotionJS } from './motion-runtime'

// ---------------------------------------------------------------------------
// Baby clothes Unsplash photo IDs (curated)
// ---------------------------------------------------------------------------

const BABY_PRODUCT_PHOTOS = [
  '1622290291165-d341f1938b8a', // baby clothes flat lay
  '1560506840-ec148e82a604', // baby outfit on hanger
  '1585850317985-e30dad0bdb2c', // baby shoes
  '1569974641446-22542de88536', // baby clothing folded
  '1607453998774-d533f65dac99', // infant dress
  '1559454403-b8fb88521f11', // baby romper
  '1590086782957-93c06ef21604', // baby accessories
  '1635874714425-c342060a4c58', // cute baby outfit
  '1556905055-8f358a7a47b2', // children fashion
  '1542387960-f8197d82db42', // baby blanket
]

const BABY_HERO_PHOTOS = [
  '1542385151-efd9000785a0', // mother and baby
  '1542386227-e92d1906acb4', // baby in cute outfit
]

const BABY_CATEGORY_PHOTOS = [
  '1522771930-78848d9293e8', // onesies
  '1585850317985-e30dad0bdb2c', // shoes
  '1590086782957-93c06ef21604', // accessories
  '1569974641446-22542de88536', // sets
  '1607453998774-d533f65dac99', // dresses
  '1559454403-b8fb88521f11', // rompers
  '1542387960-f8197d82db42', // blankets
  '1635874714425-c342060a4c58', // hats
]

const BABY_PROMO_PHOTOS = [
  '1555116106-45c3a80b87d1', // promo 1
  '1588770493582-7f1ed365cffb', // promo 2
  '1560328056-c09c585b9a4e', // promo 3
  '1558576997-a29a7b11a56c', // promo 4
]

const unsplash = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80`

// ---------------------------------------------------------------------------
// Product data for baby clothes
// ---------------------------------------------------------------------------

type Product = { name: string; price: string; img1: string; img2: string }

const BABY_PRODUCTS: Product[] = [
  { name: 'Organic Cotton Onesie', price: '89', img1: BABY_PRODUCT_PHOTOS[0], img2: BABY_PRODUCT_PHOTOS[1] },
  { name: 'Knitted Baby Booties', price: '59', img1: BABY_PRODUCT_PHOTOS[2], img2: BABY_PRODUCT_PHOTOS[3] },
  { name: 'Floral Romper Set', price: '129', img1: BABY_PRODUCT_PHOTOS[4], img2: BABY_PRODUCT_PHOTOS[5] },
  { name: 'Soft Muslin Blanket', price: '79', img1: BABY_PRODUCT_PHOTOS[9], img2: BABY_PRODUCT_PHOTOS[6] },
  { name: 'Ribbed Leggings', price: '49', img1: BABY_PRODUCT_PHOTOS[7], img2: BABY_PRODUCT_PHOTOS[8] },
  { name: 'Embroidered Dress', price: '149', img1: BABY_PRODUCT_PHOTOS[4], img2: BABY_PRODUCT_PHOTOS[0] },
  { name: 'Waffle Henley Set', price: '99', img1: BABY_PRODUCT_PHOTOS[3], img2: BABY_PRODUCT_PHOTOS[1] },
  { name: 'Linen Bloomers', price: '69', img1: BABY_PRODUCT_PHOTOS[5], img2: BABY_PRODUCT_PHOTOS[7] },
  { name: 'Cable Knit Cardigan', price: '119', img1: BABY_PRODUCT_PHOTOS[8], img2: BABY_PRODUCT_PHOTOS[2] },
  { name: 'Terry Cloth Bib Set', price: '39', img1: BABY_PRODUCT_PHOTOS[6], img2: BABY_PRODUCT_PHOTOS[9] },
]

// ---------------------------------------------------------------------------
// Category data
// ---------------------------------------------------------------------------

type Category = { name: string; img: string }

const CATEGORIES_3: Category[] = [
  { name: 'ONESIES', img: BABY_CATEGORY_PHOTOS[0] },
  { name: 'ACCESSORIES', img: BABY_CATEGORY_PHOTOS[2] },
  { name: 'SHOES', img: BABY_CATEGORY_PHOTOS[1] },
]

const CATEGORIES_8: Category[] = [
  { name: 'Onesies', img: BABY_CATEGORY_PHOTOS[0] },
  { name: 'Sets', img: BABY_CATEGORY_PHOTOS[3] },
  { name: 'Dresses', img: BABY_CATEGORY_PHOTOS[4] },
  { name: 'Accessories', img: BABY_CATEGORY_PHOTOS[2] },
  { name: 'Rompers', img: BABY_CATEGORY_PHOTOS[5] },
  { name: 'Blankets', img: BABY_CATEGORY_PHOTOS[6] },
  { name: 'Shoes', img: BABY_CATEGORY_PHOTOS[1] },
  { name: 'Hats & Bibs', img: BABY_CATEGORY_PHOTOS[7] },
]

// ---------------------------------------------------------------------------
// Template sections
// ---------------------------------------------------------------------------

const announcementBar = () => `
<div class="announcement-bar">
  <div class="announcement-text">FREE SHIPPING ON ORDERS OVER ₪299 &nbsp;&bull;&nbsp; NEW ARRIVALS EVERY WEEK</div>
</div>`

const header = (siteName: string) => `
<header class="site-header" id="site-header">
  <div class="header-inner">
    <div class="header-left">
      <button class="header-icon" aria-label="Search">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
      </button>
    </div>
    <a href="/" class="site-logo">${siteName}</a>
    <div class="header-right">
      <button class="header-icon" aria-label="Account">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </button>
      <button class="header-icon" aria-label="Wishlist">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      </button>
      <button class="header-icon cart-icon" aria-label="Cart">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <span class="cart-count">0</span>
      </button>
    </div>
  </div>
  <nav class="main-nav" id="main-nav">
    <a href="#">NEW IN</a>
    <a href="#">ONESIES</a>
    <a href="#">SETS</a>
    <a href="#">DRESSES</a>
    <a href="#">ROMPERS</a>
    <a href="#">ACCESSORIES</a>
    <a href="#">SHOES</a>
    <a href="#">BLANKETS</a>
    <a href="#">GIFT SETS</a>
    <a href="#">SALE</a>
  </nav>
</header>`

const heroSlideshow = () => `
<section class="hero-slideshow">
  <div class="hero-slide active" style="background-image: url('${unsplash(BABY_HERO_PHOTOS[0], 1600, 900)}')">
    <div class="hero-content">
      <h1 class="hero-title">NEW COLLECTION</h1>
      <p class="hero-subtitle">SPRING / SUMMER 2026</p>
    </div>
  </div>
</section>`

const categoryGrid3 = () => {
  const items = CATEGORIES_3.map(
    (cat) => `
    <a href="#" class="cat-grid-item">
      <img src="${unsplash(cat.img, 600, 800)}" alt="${cat.name}" loading="lazy" />
      <span class="cat-label">${cat.name}</span>
    </a>`,
  ).join('')

  return `
<section class="category-grid-3">
  ${items}
</section>`
}

const categoryGrid8 = () => {
  const items = CATEGORIES_8.map(
    (cat) => `
    <a href="#" class="cat-grid-8-item">
      <img src="${unsplash(cat.img, 400, 600)}" alt="${cat.name}" loading="lazy" />
      <span class="cat-label">${cat.name}</span>
    </a>`,
  ).join('')

  return `
<section class="category-grid-8">
  <div class="cat-grid-8-inner">
    ${items}
  </div>
</section>`
}

const productGrid = (title: string, products: Product[]) => {
  const cards = products
    .map(
      (p, i) => `
      <div class="product-card" data-aos="fade-up" data-aos-delay="${i * 50}">
        <a href="#" class="product-image-wrap">
          <img src="${unsplash(p.img1, 400, 600)}" alt="${p.name}" class="product-img primary" loading="lazy" />
          <img src="${unsplash(p.img2, 400, 600)}" alt="${p.name}" class="product-img secondary" loading="lazy" />
          <button class="wishlist-btn" aria-label="Add to wishlist">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
        </a>
        <div class="product-info">
          <h3 class="product-title">${p.name}</h3>
          <p class="product-price">₪${p.price}</p>
        </div>
      </div>`,
    )
    .join('')

  return `
<section class="product-grid-section">
  <h2 class="section-heading">${title}</h2>
  <div class="product-grid">
    ${cards}
  </div>
</section>`
}

const promoBanner = (
  title: string,
  subtitle: string,
  img1: string,
  img2: string,
  reversed = false,
) => {
  const large = `
    <div class="promo-panel promo-large" style="background-image: url('${unsplash(img1, 1000, 800)}')">
      <div class="promo-overlay-text">
        <p class="promo-sub">${subtitle}</p>
        <h2 class="promo-title">${title}</h2>
        <a href="#" class="promo-link">SHOP NOW</a>
      </div>
    </div>`
  const small = `
    <div class="promo-panel promo-small" style="background-image: url('${unsplash(img2, 600, 800)}')"></div>`

  return `
<section class="promo-banner ${reversed ? 'reversed' : ''}">
  ${reversed ? small + large : large + small}
</section>`
}

const newsletter = () => `
<section class="newsletter-section">
  <div class="newsletter-images">
    <img src="${unsplash(BABY_PROMO_PHOTOS[0], 300, 400)}" alt="" loading="lazy" />
    <img src="${unsplash(BABY_PROMO_PHOTOS[1], 300, 400)}" alt="" loading="lazy" />
  </div>
  <div class="newsletter-form">
    <h2 class="newsletter-heading">BE THE FIRST TO KNOW ABOUT NEW ARRIVALS & EXCLUSIVE SALES</h2>
    <form onsubmit="event.preventDefault()">
      <input type="email" placeholder="Your email address" class="newsletter-input" />
      <button type="submit" class="newsletter-btn">SUBSCRIBE</button>
    </form>
  </div>
</section>`

const footer = (siteName: string) => `
<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-col">
      <a href="/" class="footer-logo">${siteName}</a>
      <p class="footer-tagline">Premium baby fashion,<br/>designed with love.</p>
    </div>
    <div class="footer-col">
      <h4 class="footer-heading">SHOP</h4>
      <a href="#" class="footer-link">New Arrivals</a>
      <a href="#" class="footer-link">Best Sellers</a>
      <a href="#" class="footer-link">Gift Sets</a>
      <a href="#" class="footer-link">Sale</a>
    </div>
    <div class="footer-col">
      <h4 class="footer-heading">HELP</h4>
      <a href="#" class="footer-link">Shipping & Returns</a>
      <a href="#" class="footer-link">Size Guide</a>
      <a href="#" class="footer-link">Contact Us</a>
      <a href="#" class="footer-link">FAQ</a>
    </div>
    <div class="footer-col">
      <h4 class="footer-heading">FOLLOW US</h4>
      <div class="social-icons">
        <a href="#" aria-label="Instagram">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
        </a>
        <a href="#" aria-label="Facebook">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
        </a>
        <a href="#" aria-label="TikTok">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.92 2.92 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.57 6.33 6.33 0 0 0 9.37 22a6.33 6.33 0 0 0 6.45-6.21V9.4a8.16 8.16 0 0 0 4.77 1.52V7.49a4.85 4.85 0 0 1-1-.8z"/></svg>
        </a>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <p>&copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
  </div>
</footer>`

// ---------------------------------------------------------------------------
// Full page CSS (matching seestarz.com DNA)
// ---------------------------------------------------------------------------

const generateEcommerceCSS = (motion: MotionPreset) => `
/* === RESET & BASE === */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { font-family: 'Jost', sans-serif; font-weight: 300; font-size: 14px; color: #000; background: #fff; letter-spacing: 0.35px; line-height: 1.4; -webkit-font-smoothing: antialiased; }
a { color: inherit; text-decoration: none; }
img { display: block; max-width: 100%; height: auto; }
button { cursor: pointer; background: none; border: none; font-family: inherit; }

/* === ANNOUNCEMENT BAR === */
.announcement-bar {
  background: #000; color: #fff; text-align: center;
  padding: 10px 20px; font-size: 11px; font-weight: 300;
  letter-spacing: 2px; text-transform: uppercase;
  overflow: hidden; white-space: nowrap;
}
.announcement-text { animation: marquee 20s linear infinite; display: inline-block; }
@keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }

/* === HEADER === */
.site-header {
  position: sticky; top: 0; z-index: 100; background: #fff;
  border-bottom: 1px solid #f0f0f0;
}
.header-inner {
  max-width: 1420px; margin: 0 auto; padding: 12px 50px;
  display: flex; align-items: center; justify-content: space-between;
}
.site-logo {
  font-size: 28px; font-weight: 300; letter-spacing: 12px;
  text-transform: uppercase; color: #000; text-align: center;
  flex: 1; display: flex; justify-content: center;
}
.header-left, .header-right { display: flex; align-items: center; gap: 16px; min-width: 120px; }
.header-right { justify-content: flex-end; }
.header-icon { color: #000; padding: 4px; position: relative; }
.cart-count {
  position: absolute; top: -4px; right: -6px; background: #000; color: #fff;
  font-size: 9px; width: 16px; height: 16px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; font-weight: 700;
}

/* === MAIN NAV === */
.main-nav {
  display: flex; justify-content: center; gap: 28px;
  padding: 8px 50px 12px; border-top: 1px solid #f5f5f5;
}
.main-nav a {
  font-size: 11px; font-weight: 300; letter-spacing: 1.5px;
  text-transform: uppercase; color: #000; transition: opacity 0.2s;
  white-space: nowrap;
}
.main-nav a:hover { opacity: 0.5; }

/* === HERO === */
.hero-slideshow { position: relative; width: 100%; height: 85vh; max-height: 700px; overflow: hidden; }
.hero-slide {
  width: 100%; height: 100%; background-size: cover; background-position: center;
  display: flex; align-items: center; justify-content: center;
}
.hero-content { text-align: center; color: #fff; position: relative; z-index: 2; }
.hero-slideshow .hero-slide::after {
  content: ''; position: absolute; inset: 0;
  background: rgba(0,0,0,0.15);
}
.hero-title {
  font-size: 42px; font-weight: 700; letter-spacing: 6px;
  text-transform: uppercase; margin-bottom: 8px; position: relative; z-index: 2;
}
.hero-subtitle {
  font-size: 14px; font-weight: 300; letter-spacing: 4px;
  text-transform: uppercase; position: relative; z-index: 2;
}

/* === CATEGORY GRID 3-COL === */
.category-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
.cat-grid-item {
  position: relative; overflow: hidden; aspect-ratio: 3/4;
  display: block;
}
.cat-grid-item img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.6s ease;
}
.cat-grid-item:hover img { transform: scale(1.05); }
.cat-label {
  position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);
  font-size: 24px; font-weight: 300; letter-spacing: 4px; text-transform: uppercase;
  color: #000; background: rgba(255,255,255,0.85); padding: 10px 24px;
}

/* === CATEGORY GRID 8 (4x2) === */
.category-grid-8 { padding: 0; }
.cat-grid-8-inner { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; }
.cat-grid-8-item {
  position: relative; overflow: hidden; aspect-ratio: 2/3; display: block;
}
.cat-grid-8-item img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.6s ease;
}
.cat-grid-8-item:hover img { transform: scale(1.05); }
.cat-grid-8-item .cat-label {
  font-size: 16px; letter-spacing: 3px; padding: 8px 16px; bottom: 30px;
}

/* === SECTION HEADING === */
.section-heading {
  text-align: center; font-size: 28px; font-weight: 300;
  letter-spacing: 3px; text-transform: uppercase; color: #000;
  padding: 60px 0 40px;
}

/* === PRODUCT GRID === */
.product-grid-section { max-width: 1420px; margin: 0 auto; padding: 0 50px; }
.product-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px; padding-bottom: 60px; }
.product-card { position: relative; }
.product-image-wrap {
  position: relative; display: block; overflow: hidden;
  aspect-ratio: 2/3; background: #f8f8f8;
}
.product-img {
  width: 100%; height: 100%; object-fit: cover;
  transition: opacity 0.4s ease;
}
.product-img.secondary {
  position: absolute; inset: 0; opacity: 0;
}
.product-image-wrap:hover .product-img.primary { opacity: 0; }
.product-image-wrap:hover .product-img.secondary { opacity: 1; }
.wishlist-btn {
  position: absolute; top: 12px; left: 12px; color: #000;
  background: rgba(255,255,255,0.8); border-radius: 50%;
  width: 32px; height: 32px; display: flex; align-items: center;
  justify-content: center; opacity: 0; transition: opacity 0.3s;
}
.product-card:hover .wishlist-btn { opacity: 1; }
.product-info { padding: 12px 0; }
.product-title {
  font-size: 11px; font-weight: 700; letter-spacing: 2.4px;
  text-transform: uppercase; color: #000; margin-bottom: 4px;
  line-height: 1.4;
}
.product-price {
  font-size: 12px; font-weight: 300; color: #000;
}

/* === PROMO BANNER === */
.promo-banner {
  display: grid; grid-template-columns: 60% 40%;
  max-width: 1420px; margin: 20px auto; gap: 0;
}
.promo-banner.reversed { grid-template-columns: 40% 60%; }
.promo-panel {
  position: relative; min-height: 500px;
  background-size: cover; background-position: center;
}
.promo-large { min-height: 600px; }
.promo-overlay-text {
  position: absolute; bottom: 60px; left: 50px; color: #fff; z-index: 2;
}
.promo-panel::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%);
}
.promo-overlay-text * { position: relative; z-index: 3; }
.promo-sub {
  font-size: 11px; font-weight: 300; letter-spacing: 3px;
  text-transform: uppercase; margin-bottom: 8px;
}
.promo-title {
  font-size: 28px; font-weight: 300; letter-spacing: 4px;
  text-transform: uppercase; margin-bottom: 16px;
}
.promo-link {
  font-size: 12px; font-weight: 700; letter-spacing: 2.6px;
  text-transform: uppercase; border-bottom: 1px solid #fff;
  padding-bottom: 4px; color: #fff;
}
.promo-link:hover { opacity: 0.8; }

/* === NEWSLETTER === */
.newsletter-section {
  display: grid; grid-template-columns: 1fr 1fr; gap: 0;
  max-width: 1420px; margin: 60px auto; padding: 0 50px;
  align-items: center;
}
.newsletter-images { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.newsletter-images img { width: 100%; aspect-ratio: 3/4; object-fit: cover; }
.newsletter-form { padding: 40px 60px; }
.newsletter-heading {
  font-size: 24px; font-weight: 300; letter-spacing: 2px;
  text-transform: uppercase; line-height: 1.5; margin-bottom: 30px;
}
.newsletter-input {
  width: 100%; border: 0.8px solid #000; padding: 12px 16px;
  font-family: 'Jost', sans-serif; font-size: 13px; font-weight: 300;
  margin-bottom: 12px; border-radius: 0; outline: none;
  transition: border-color 0.2s;
}
.newsletter-input:focus { border-color: #666; }
.newsletter-btn {
  width: 100%; background: #000; color: #fff; border: none;
  padding: 14px 20px; font-family: 'Jost', sans-serif;
  font-size: 12px; font-weight: 700; letter-spacing: 2.6px;
  text-transform: uppercase; cursor: pointer; border-radius: 0;
  transition: opacity 0.2s;
}
.newsletter-btn:hover { opacity: 0.85; }

/* === FOOTER === */
.site-footer { border-top: 1px solid #e5e5e5; padding: 60px 0 30px; }
.footer-inner {
  max-width: 1420px; margin: 0 auto; padding: 0 50px;
  display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 40px;
}
.footer-logo {
  font-size: 22px; font-weight: 300; letter-spacing: 8px;
  text-transform: uppercase; color: #000; display: block; margin-bottom: 12px;
}
.footer-tagline { font-size: 13px; color: #666; line-height: 1.6; }
.footer-heading {
  font-size: 11px; font-weight: 700; letter-spacing: 2px;
  text-transform: uppercase; margin-bottom: 16px;
}
.footer-link {
  display: block; font-size: 13px; color: #444; margin-bottom: 10px;
  transition: color 0.2s;
}
.footer-link:hover { color: #000; }
.social-icons { display: flex; gap: 16px; }
.social-icons a { color: #000; transition: opacity 0.2s; }
.social-icons a:hover { opacity: 0.5; }
.footer-bottom {
  max-width: 1420px; margin: 0 auto; padding: 30px 50px 0;
  border-top: 1px solid #e5e5e5; margin-top: 40px; text-align: center;
}
.footer-bottom p { font-size: 12px; color: #999; }

/* === AOS-STYLE SCROLL ANIMATIONS === */
[data-aos] { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease, transform 0.6s ease; }
[data-aos].aos-animate { opacity: 1; transform: translateY(0); }

/* === RESPONSIVE === */
@media (max-width: 1024px) {
  .product-grid { grid-template-columns: repeat(3, 1fr); }
  .promo-banner, .promo-banner.reversed { grid-template-columns: 1fr 1fr; }
  .promo-large { min-height: 400px; }
  .cat-grid-8-inner { grid-template-columns: repeat(2, 1fr); }
  .header-inner, .main-nav, .product-grid-section, .newsletter-section, .footer-inner, .footer-bottom { padding-left: 24px; padding-right: 24px; }
  .newsletter-section { grid-template-columns: 1fr; }
  .newsletter-images { display: none; }
  .main-nav { gap: 16px; overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .main-nav::-webkit-scrollbar { display: none; }
}
@media (max-width: 768px) {
  .category-grid-3 { grid-template-columns: 1fr; }
  .product-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .promo-banner, .promo-banner.reversed { grid-template-columns: 1fr; }
  .promo-small { display: none; }
  .hero-title { font-size: 28px; letter-spacing: 4px; }
  .site-logo { font-size: 20px; letter-spacing: 8px; }
  .footer-inner { grid-template-columns: 1fr 1fr; }
  .main-nav { padding-left: 16px; padding-right: 16px; justify-content: flex-start; }
}
@media (max-width: 480px) {
  .footer-inner { grid-template-columns: 1fr; }
  .header-inner { padding: 10px 16px; }
  .site-logo { font-size: 18px; letter-spacing: 6px; }
}

/* === MOTION SYSTEM === */
${generateMotionCSS(motion)}
`

const generateEcommerceJS = (motion: MotionPreset) => `
// AOS-style scroll reveal
(function() {
  const els = document.querySelectorAll('[data-aos]');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = parseInt(e.target.getAttribute('data-aos-delay') || '0', 10);
        setTimeout(() => e.target.classList.add('aos-animate'), delay);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
})();

// Sticky header shadow on scroll
(function() {
  const header = document.getElementById('site-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 10 ? '0 2px 20px rgba(0,0,0,0.08)' : 'none';
  }, { passive: true });
})();

${generateMotionJS(motion)}
`

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export type EcommerceOptions = {
  siteName: string
  motion: MotionPreset
  scan?: ScanResult
}

/**
 * Generate a full e-commerce fashion store HTML page.
 * Clones the design DNA of luxury fashion stores (seestarz.com pattern).
 */
export const generateEcommerceSite = (opts: EcommerceOptions): string => {
  const { siteName, motion } = opts

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${siteName} — Premium Baby Fashion</title>
  <link href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;700&display=swap" rel="stylesheet">
  <style>${generateEcommerceCSS(motion)}</style>
</head>
<body>
${announcementBar()}
${header(siteName)}
${heroSlideshow()}
${categoryGrid3()}
${categoryGrid8()}
${productGrid('NEW THIS WEEK', BABY_PRODUCTS.slice(0, 10))}
${promoBanner('THE SOFTEST COLLECTION', 'ORGANIC COTTON FOR YOUR LITTLE ONE', BABY_PROMO_PHOTOS[0], BABY_PROMO_PHOTOS[1])}
${promoBanner('GIFT SETS', 'THE PERFECT PRESENT FOR NEW PARENTS', BABY_PROMO_PHOTOS[2], BABY_PROMO_PHOTOS[3], true)}
${productGrid('YOU MAY ALSO LIKE', BABY_PRODUCTS.slice(5, 10))}
${newsletter()}
${footer(siteName)}
<script>${generateEcommerceJS(motion)}</script>
</body>
</html>`
}
