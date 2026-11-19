/* =====================================================================
   PRODUCT PAGE (productPage.html)
   Open it with a product id in the link, e.g.  productPage.html?id=4
   Needs data/products.js and script/common.js to be loaded first
   (they provide $, money, esc, find, pic, addToCart and toast).
   ===================================================================== */


/* ---------- 1. Find the product from the link ---------- */

const productId = new URLSearchParams(location.search).get("id");
const product = find(productId);
const page = $("#product");


/* ---------- 2. Small pieces of HTML ---------- */

const NOT_FOUND_HTML = `
  <div class="empty">
    <h2>We couldn't find that product</h2>
    <p class="meta">It may have been removed.</p><br>
    <a class="btn" href="index.html#shop">Browse all products</a>
  </div>`;

/* "Only 4 left in stock" (when low) or "In stock". */
function stockHtml(p) {
  return p.stock <= 6
    ? `<p class="stock">Only ${p.stock} left in stock</p>`
    : `<p class="meta" style="color:var(--ok);font-weight:700">In stock</p>`;
}

/* The price, with the crossed-out old price when the product is on sale. */
function priceHtml(p) {
  const oldPrice = p.old ? `<s>${money(p.old)}</s>` : "";
  return `<div class="price"><b>${money(p.price)}</b>${oldPrice}</div>`;
}

/* The specifications table. The labels match the three spec lines in products.js. */
function specsHtml(p) {
  const labels = ["Main", "Storage / graphics", "Display / extras"];
  const rows = p.specs
    .map((line, index) => `<tr><th>${labels[index] || "Detail"}</th><td>${line}</td></tr>`)
    .join("");
  return `<table class="specs">${rows}<tr><th>Warranty</th><td>2 years</td></tr></table>`;
}

/* One small card in the "You may also like" row. */
function relatedCardHtml(p) {
  return `
    <a class="card" href="productPage.html?id=${p.id}">
      <div class="pic">${pic(p)}</div>
      <div class="cb">
        <h3>${esc(p.name)}</h3>
        ${priceHtml(p)}
      </div>
    </a>`;
}

/* Up to 4 other products from the same category or with the same use. */
function relatedProducts(p) {
  return PRODUCTS
    .filter(other => other.id !== p.id && (other.cat === p.cat || other.use === p.use))
    .slice(0, 4);
}

/* The whole page for one product. */
function productHtml(p) {
  const saleTag = p.old ? `<span class="tag">Save ${money(p.old - p.price)}</span>` : "";

  return `
    <nav class="crumbs">
      <a href="index.html">Home</a> / <a href="index.html#shop">${p.cat}</a> / ${esc(p.name)}
    </nav>

    <div class="pgrid">
      <div class="pic big">${pic(p)}${saleTag}</div>

      <div class="pinfo">
        <div class="meta">${p.cat} · ★ ${p.rating} rating</div>
        <h1>${esc(p.name)}</h1>
        ${priceHtml(p)}
        ${stockHtml(p)}

        <div class="buy">
          <div class="qty big">
            <button id="dec" aria-label="Fewer">−</button>
            <output id="qv">1</output>
            <button id="inc" aria-label="More">+</button>
          </div>
          <button class="btn" id="add">Add to cart</button>
          <button class="btn ghost" id="now">Buy now</button>
        </div>

        <ul class="perkl">
          <li>Free delivery on orders over $50</li>
          <li>2-year warranty</li>
          <li>30-day returns</li>
          <li>Pay on delivery or bank transfer</li>
        </ul>
      </div>
    </div>

    <h2>Specifications</h2>
    ${specsHtml(p)}

    <h2>You may also like</h2>
    <div class="grid">${relatedProducts(p).map(relatedCardHtml).join("")}</div>`;
}


/* ---------- 3. Show the page ---------- */

if (!product) {
  page.innerHTML = NOT_FOUND_HTML;
} else {
  document.title = product.name + " — NovaTech";
  page.innerHTML = productHtml(product);

  /* Quantity picker: from 1 up to the number in stock. */
  let quantity = 1;
  const setQuantity = value => {
    quantity = Math.max(1, Math.min(product.stock, value));
    $("#qv").textContent = quantity;
  };

  $("#inc").onclick = () => setQuantity(quantity + 1);
  $("#dec").onclick = () => setQuantity(quantity - 1);

  /* Add to cart: stay on the page and show a message. */
  $("#add").onclick = () => {
    addToCart(product.id, quantity);
    toast("Added to cart");
  };

  /* Buy now: add to cart and go straight to checkout. */
  $("#now").onclick = () => {
    addToCart(product.id, quantity);
    location.href = "checkoutPage.html";
  };
}