/* =====================================================================
   HOME PAGE (index.html)
   Shows the product grid, filters, quick view and the cart drawer.
   Needs data/products.js to be loaded first.
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

const findProduct = id => PRODUCTS.find(product => product.id === id);

/* Small message at the bottom of the screen, e.g. "Added to cart". */
function toast(message) {
  const box = $("#toast");
  box.textContent = message;
  box.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => box.classList.remove("show"), 2200);
}


/* ---------- 2. State: current filters and the cart ---------- */

const filters = {
  use: null,      // "gaming", "work", "study" or null (all)
  category: "All",
  search: "",
  maxPrice: 2000,
  sort: "feat"    // "feat", "low", "high" or "rate"
};

/* The cart is saved in the browser so it survives a page refresh. */
let cart = [];
try {
  cart = JSON.parse(localStorage.getItem("nt-cart")) || [];
} catch (error) {}
cart = cart.filter(item => findProduct(item.id));   // drop products that no longer exist

function saveCart() {
  try {
    localStorage.setItem("nt-cart", JSON.stringify(cart));
  } catch (error) {}
}

/* Run a change on the cart, then clean up, save and redraw it. */
function updateCart(change) {
  change();
  cart = cart.filter(item => item.q > 0);
  saveCart();drawCart();
}


/* ---------- 3. Product grid ---------- */

/* Returns the products that match the current filters, sorted. */
function visibleProducts() {
  const matches = PRODUCTS.filter(product => {
    const text = (product.name + product.cat + product.specs.join(" ")).toLowerCase();
    return (!filters.use || product.use === filters.use)
        && (filters.category === "All" || product.cat === filters.category)
        && product.price <= filters.maxPrice
        && text.includes(filters.search);
  });

  const sorters = {
    low:  (a, b) => a.price - b.price,
    high: (a, b) => b.price - a.price,
    rate: (a, b) => b.rating - a.rating
  };
  const sorter = sorters[filters.sort];
  return sorter ? matches.sort(sorter) : matches;
}

/* HTML for one product card. */
function cardHtml(p) {
  const saleTag  = p.old ? `<span class="tag">Save ${money(p.old - p.price)}</span>` : "";
  const oldPrice = p.old ? `<s>${money(p.old)}</s>` : "";
  const lowStock = p.stock <= 6 ? `<div class="meta stock">Only ${p.stock} left</div>` : "";

  return `
    <article class="card">
      <button class="pic" data-view="${p.id}" aria-label="View ${esc(p.name)}">${pic(p)}${saleTag}</button>
      <div class="cb">
        <div class="meta">${p.cat} · ★ ${p.rating}</div>
        <h3><a href="productPage.html?id=${p.id}" style="color:inherit;text-decoration:none">${esc(p.name)}</a></h3>
        <div class="meta">${p.specs[0]}<br>${p.specs[1]}</div>
        ${lowStock}
        <div class="price"><b>${money(p.price)}</b>${oldPrice}</div>
        <button class="btn" data-add="${p.id}">Add to cart</button>
      </div>
    </article>`;
}

const EMPTY_GRID_HTML = `
  <div class="empty">
    <h3>No matches yet</h3>
    <p class="meta">Try a higher price limit or clear the search.</p><br>
    <button class="btn" id="reset">Clear filters</button>
  </div>`;

function drawProducts() {
  const products = visibleProducts();
  const count = `${products.length} product${products.length === 1 ? "" : "s"}`;

  $("#result").textContent = count + (filters.use ? ` for ${filters.use}` : "");
  $("#grid").innerHTML = products.length ? products.map(cardHtml).join("") : EMPTY_GRID_HTML;
}

/* Category buttons: All, Laptops, Desktops, ... (built from the product list). */
function drawCategories() {
  const categories = ["All", ...new Set(PRODUCTS.map(product => product.cat))];
  $("#chips").innerHTML = categories
    .map(name => `<button aria-pressed="${name === filters.category}" data-cat="${name}">${name}</button>`)
    .join("");
}


/* ---------- 4. Quick view window ---------- */

function openQuickView(id) {
  const p = findProduct(id);
  const oldPrice = p.old ? `<s>${money(p.old)}</s>` : "";
  const specs = p.specs.map(line => `<li>${line}</li>`).join("");

  $("#modal").innerHTML = `
    <div class="mg">
      <div class="pic">${pic(p)}</div>
      <div class="mb">
        <button class="x" data-close aria-label="Close">✕</button>
        <div class="meta">${p.cat} · ★ ${p.rating}</div>
        <h2 id="mTitle">${esc(p.name)}</h2>
        <ul>${specs}<li>2-year warranty · free delivery</li></ul>
        <div class="price"><b>${money(p.price)}</b>${oldPrice}</div>
        <button class="btn" data-add="${p.id}" data-close>Add to cart</button>
        <a href="productPage.html?id=${p.id}" class="meta">See full details</a>
      </div>
    </div>`;
  $("#modal").showModal();
}


/* ---------- 5. Cart drawer ---------- */

function cartRowHtml(item) {
  const p = findProduct(item.id);
  return `
    <div class="row">
      <b>${esc(p.name)}</b><b>${money(p.price * item.q)}</b>
      <div class="qty">
        <button data-dec="${p.id}" aria-label="Fewer">−</button>${item.q}<button data-inc="${p.id}" aria-label="More">+</button>
      </div>
      <button class="rm" data-rm="${p.id}">Remove</button>
    </div>`;
}

function drawCart() {
  const itemCount = cart.reduce((sum, item) => sum + item.q, 0);
  const total = cart.reduce((sum, item) => sum + item.q * findProduct(item.id).price, 0);

  $("#count").textContent = itemCount;

  $("#items").innerHTML = cart.length
    ? cart.map(cartRowHtml).join("")
    : `<div class="empty" style="margin-top:20px"><p class="meta">Your cart is empty. Pick something you like and it will show up here.</p></div>`;

  const deliveryNote = total >= 50
    ? "Free delivery included."
    : `Add ${money(50 - total)} more for free delivery.`;

  $("#cartFoot").innerHTML = cart.length ? `
    <div class="tot"><span>Total</span><span>${money(total)}</span></div>
    <p class="meta">${deliveryNote} Pay on delivery or bank transfer.</p>
    <a class="btn" href="checkoutPage.html" style="justify-content:center;display:flex;align-items:center;text-decoration:none">Checkout</a>` : "";
}

function setCartOpen(isOpen) {
  $("#cart").classList.toggle("open", isOpen);
  $("#cart").setAttribute("aria-hidden", !isOpen);
  $("#scrim").hidden = !isOpen;
  if (isOpen) $("#closeCart").focus();
}


/* ---------- 6. Actions (what each button does) ---------- */

function addToCart(id) {
  updateCart(() => {
    const item = cart.find(entry => entry.id === id);
    item ? item.q++ : cart.push({ id, q: 1 });
  });
  toast("Added to cart");
}

function chooseUse(use) {
  filters.use = filters.use === use ? null : use;   // click again to clear
  document.querySelectorAll(".uses button")
    .forEach(button => button.setAttribute("aria-pressed", button.dataset.use === filters.use));
  drawProducts();
  $("#shop").scrollIntoView();
}

function resetFilters() {
  Object.assign(filters, { use: null, category: "All", search: "", maxPrice: 2000 });
  $("#q").value = "";
  $("#price").value = 2000;
  $("#pout").textContent = "$2,000";
  document.querySelectorAll(".uses button").forEach(button => button.setAttribute("aria-pressed", false));
  drawCategories();
  drawProducts();
}


/* ---------- 7. Event listeners ---------- */

/* One listener handles every button on the page. */
document.addEventListener("click", event => {
  const target = event.target.closest(
    "[data-add],[data-view],[data-cat],[data-use],[data-inc],[data-dec],[data-rm],[data-close],#reset,#openCart,#closeCart,#scrim"
  );
  if (!target) return;
  const data = target.dataset;

  if (data.add)  addToCart(+data.add);
  if (data.view) openQuickView(+data.view);
  if (target.matches("[data-close]")) $("#modal").close();

  if (data.cat) { filters.category = data.cat; drawCategories(); drawProducts(); }
  if (data.use) chooseUse(data.use);

  if (data.inc) updateCart(() => cart.find(item => item.id == data.inc).q++);
  if (data.dec) updateCart(() => cart.find(item => item.id == data.dec).q--);
  if (data.rm)  updateCart(() => { cart = cart.filter(item => item.id != data.rm); });

  if (target.id === "reset")     resetFilters();
  if (target.id === "openCart")  setCartOpen(true);
  if (target.id === "closeCart" || target.id === "scrim") setCartOpen(false);
});

/* Click outside the quick view window to close it. */
$("#modal").addEventListener("click", event => {
  if (event.target.id === "modal") event.target.close();
});

/* Escape closes the cart drawer. */
document.addEventListener("keydown", event => {
  if (event.key === "Escape") setCartOpen(false);
});

/* Search box, sort menu and price slider. */
$("#q").addEventListener("input", event => {
  filters.search = event.target.value.toLowerCase().trim();
  drawProducts();
});

$("#sort").addEventListener("change", event => {
  filters.sort = event.target.value;
  drawProducts();
});

$("#price").addEventListener("input", event => {
  filters.maxPrice = +event.target.value;
  $("#pout").textContent = money(filters.maxPrice);
  drawProducts();
});


/* ---------- 8. Start ---------- */

drawCategories();
drawProducts();
drawCart();