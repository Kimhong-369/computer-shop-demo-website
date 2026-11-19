/* =====================================================================
   COMMON CODE — shared by productPage.html and checkoutPage.html
   (the home page has its own copy of these helpers inside app.js).
   Needs data/products.js to be loaded first.
   Other files rely on these names, so do not rename them:
   $, money, esc, find, cart, save, total, countUI, addToCart, toast
   ===================================================================== */


/* ---------- 1. Small helpers ---------- */

const $ = selector => document.querySelector(selector);

const money = amount => "$" + amount.toLocaleString("en-US");

/* Makes text safe to place inside HTML. */
const esc = text => String(text).replace(/[&<>"']/g, char => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[char]));

/* Look up a product by its id. */
const find = id => PRODUCTS.find(product => product.id == id);

/* Small message at the bottom of the screen, e.g. "Added to cart". */
function toast(message) {
  const box = $("#toast");
  box.textContent = message;
  box.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => box.classList.remove("show"), 2200);
}


/* ---------- 2. The cart ---------- */

/* The cart is a list like [{ id: 4, q: 2 }] (product id and quantity).
   It is saved in the browser, so it survives a page refresh.
   Products that no longer exist in products.js are dropped automatically. */
let cart = [];
try {
  cart = (JSON.parse(localStorage.getItem("nt-cart")) || []).filter(item => find(item.id));
} catch (error) {}

/* Save the cart and update the number on the Cart button. */
function save() {
  try {
    localStorage.setItem("nt-cart", JSON.stringify(cart));
  } catch (error) {}
  countUI();
}

/* Total price of everything in the cart (before delivery). */
const total = () => cart.reduce((sum, item) => sum + item.q * find(item.id).price, 0);

/* Show how many items are in the cart on the Cart button. */
function countUI() {
  const badge = $("#count");
  if (badge) badge.textContent = cart.reduce((sum, item) => sum + item.q, 0);
}

/* Add a product to the cart (quantity defaults to 1). */
function addToCart(id, quantity = 1) {
  const existing = cart.find(item => item.id == id);
  if (existing) {
    existing.q += quantity;
  } else {
    cart.push({ id: +id, q: quantity });
  }
  save();
}


/* ---------- 3. Start ---------- */

countUI();