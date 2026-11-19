/* =====================================================================
   CHECKOUT PAGE (checkoutPage.html)
   Three steps:  1. Your details  ->  2. Review  ->  3. Order placed
   Needs data/products.js and script/common.js to be loaded first
   (they provide $, money, esc, find, cart, save and total).
   ===================================================================== */


/* ---------- 1. Settings and state ---------- */

const FREE_DELIVERY_FROM = 50;   // orders at or above this amount ship free
const DELIVERY_FEE = 5;          // otherwise this fee is added

const root = $("#checkout");
let step = 1;                    // 1 = details, 2 = review, 3 = done

/* What the customer has typed so far. */
const customer = { name: "", phone: "", address: "", note: "", pay: "cod" };

const deliveryCost = () => total() >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;


/* ---------- 2. Small pieces of HTML ---------- */

/* The progress bar at the top: Your details / Review / Done. */
function stepsHtml() {
  const names = ["Your details", "Review", "Done"];
  const items = names.map((name, index) => {
    const number = index + 1;
    const state = number === step ? "on" : number < step ? "ok" : "";
    return `<li class="${state}">${name}</li>`;
  });
  return `<ol class="steps">${items.join("")}</ol>`;
}

/* One line in the order summary. On step 1 it also has + / − / Remove buttons. */
function summaryRowHtml(item, editable) {
  const p = find(item.id);
  const quantityText = editable ? "" : ` × ${item.q}`;
  const controls = editable ? `
    <div class="qty">
      <button data-dec="${p.id}" aria-label="Fewer">−</button>${item.q}<button data-inc="${p.id}" aria-label="More">+</button>
    </div>
    <button class="rm" data-rm="${p.id}">Remove</button>` : "";

  return `
    <div class="row">
      <span>${esc(p.name)}${quantityText}</span><b>${money(p.price * item.q)}</b>
      ${controls}
    </div>`;
}

/* The box on the right with items, delivery and the total. */
function summaryHtml(editable) {
  const delivery = deliveryCost();
  return `
    <aside class="sum">
      <h2>Order summary</h2>
      ${cart.map(item => summaryRowHtml(item, editable)).join("")}
      <div class="line"><span>Subtotal</span><span>${money(total())}</span></div>
      <div class="line"><span>Delivery</span><span>${delivery ? money(delivery) : "Free"}</span></div>
      <div class="tot"><span>Total</span><span>${money(total() + delivery)}</span></div>
    </aside>`;
}


/* ---------- 3. The three screens ---------- */

const EMPTY_CART_HTML = `
  <div class="empty">
    <h2>Your cart is empty</h2>
    <p class="meta">Add a product and it will show up here.</p><br>
    <a class="btn" href="index.html#shop">Start shopping</a>
  </div>`;

function detailsHtml() {
  return stepsHtml() + `
    <div class="cgrid">
      <form id="f" novalidate>
        <h2>Your details</h2>
        <label>Full name<input name="name" autocomplete="name" value="${esc(customer.name)}"></label>
        <label>Phone number<input name="phone" inputmode="tel" autocomplete="tel" value="${esc(customer.phone)}"></label>
        <label>Delivery address<input name="address" autocomplete="street-address" value="${esc(customer.address)}"></label>
        <label>Note for delivery (optional)<input name="note" value="${esc(customer.note)}"></label>

        <fieldset>
          <legend>Payment</legend>
          <label class="opt"><input type="radio" name="pay" value="cod" ${customer.pay === "cod" ? "checked" : ""}> Pay on delivery</label>
          <label class="opt"><input type="radio" name="pay" value="bank" ${customer.pay === "bank" ? "checked" : ""}> Bank transfer (we send details after you order)</label>
        </fieldset>

        <p class="err" id="err" role="alert"></p>
        <button class="btn" type="submit">Continue to review</button>
      </form>
      ${summaryHtml(true)}
    </div>`;
}

function reviewHtml() {
  const note = customer.note ? `<p class="meta">Note: ${esc(customer.note)}</p>` : "";
  const payment = customer.pay === "cod" ? "Pay on delivery" : "Bank transfer";

  return stepsHtml() + `
    <div class="cgrid">
      <div>
        <h2>Review your order</h2>
        <div class="box">
          <p><b>${esc(customer.name)}</b><br>${esc(customer.phone)}<br>${esc(customer.address)}</p>
          ${note}
          <p class="meta">Payment: ${payment}</p>
        </div>
        <br>
        <div class="buy">
          <button class="btn ghost" id="back">Edit details</button>
          <button class="btn" id="place">Place order</button>
        </div>
        <p class="err" id="err"></p>
      </div>
      ${summaryHtml(false)}
    </div>`;
}

function doneHtml(orderNumber) {
  const bankNote = customer.pay === "bank" ? " We'll also send you our bank details." : "";
  return stepsHtml() + `
    <div class="done">
      <h2>Order placed</h2>
      <p>Your order number is <b>${orderNumber}</b>.</p>
      <p class="meta">Thank you, ${esc(customer.name)}! We'll call ${esc(customer.phone)} shortly to confirm delivery.${bankNote}</p><br>
      <a class="btn" href="index.html">Back to shop</a>
    </div>`;
}

/* Shows the right screen for the current step. */
function draw() {
  if (step === 3) return;                       // the "done" screen is drawn once, after ordering
  if (!cart.length) { root.innerHTML = EMPTY_CART_HTML; return; }
  root.innerHTML = step === 1 ? detailsHtml() : reviewHtml();
}


/* ---------- 4. Actions ---------- */

/* Copy whatever is typed in the form into the customer object. */
function readForm() {
  const form = $("#f");
  if (form) Object.assign(customer, Object.fromEntries(new FormData(form)));
}

/* Step 1 -> 2: check the form, then show the review screen. */
function submitDetails(event) {
  event.preventDefault();
  readForm();
  ["name", "phone", "address", "note"].forEach(key => customer[key] = (customer[key] || "").trim());

  const phoneDigits = customer.phone.replace(/\D/g, "");
  if (!customer.name || phoneDigits.length < 8 || !customer.address) {
    $("#err").textContent = "Please enter your name, a phone number with at least 8 digits, and your address.";
    return;
  }
  step = 2;
  draw();
  scrollTo(0, 0);
}

/* + / − / Remove buttons in the order summary (step 1 only). */
function changeQuantity(button) {
  const id = button.dataset.inc || button.dataset.dec || button.dataset.rm;

  if (button.dataset.rm) {
    cart = cart.filter(item => item.id != id);
  } else {
    cart.find(item => item.id == id).q += button.dataset.inc ? 1 : -1;
  }
  cart = cart.filter(item => item.q > 0);
  save();
  readForm();      // keep what the customer already typed
  draw();
}

/* Step 2 -> 3: send the order and show the thank-you screen. */
async function placeOrder(button) {
  button.disabled = true;
  button.textContent = "Placing order…";

  const order = { ...customer, items: cart, total: total() + deliveryCost() };
  const orderNumber = "NT-" + Date.now().toString().slice(-6);

  try {
    /* TODO: send the order to your server here, for example:
       await fetch("/api/orders", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(order)
       });
    */
  } catch (error) {
    button.disabled = false;
    button.textContent = "Place order";
    $("#err").textContent = "Something went wrong. Please try again.";
    return;
  }

  step = 3;
  cart = [];
  save();
  root.innerHTML = doneHtml(orderNumber);
  scrollTo(0, 0);
}


/* ---------- 5. Event listeners ---------- */

/* Remember the chosen payment method as soon as it is clicked. */
root.addEventListener("input", event => {
  if (event.target.name === "pay") customer.pay = event.target.value;
});

root.addEventListener("submit", submitDetails);

root.addEventListener("click", event => {
  const button = event.target.closest("[data-inc],[data-dec],[data-rm],#back,#place");
  if (!button) return;

  if (button.dataset.inc || button.dataset.dec || button.dataset.rm) changeQuantity(button);
  if (button.id === "back") { step = 1; draw(); }
  if (button.id === "place") placeOrder(button);
});


/* ---------- 6. Start ---------- */

draw();