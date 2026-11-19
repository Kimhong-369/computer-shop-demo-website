/* =====================================================================
   SITE FOOTER — shown on every page (index, product and checkout).
   Fill in the SHOP block below once and the footer updates everywhere.
   ===================================================================== */


/* ---------- 1. YOUR SHOP DETAILS (edit this part) ---------- */

const SHOP = {
  name: "NovaTech",
  owner: "Em Kimhong",                  // shown in the copyright line
  address: "Add your store address",
  phone: "Add your phone number",
  email: "hello@yourshop.com",
  hours: "Mon–Sat 8:00–19:00",
  facebook: "#",                        // replace "#" with your page link
  tiktok: "#",
  telegram: "#"
};


/* ---------- 2. Footer code (no need to change below) ---------- */

(() => {
  const footer = document.getElementById("siteFooter");
  if (!footer) return;                  // this page has no footer placeholder

  /* Makes text safe to place inside HTML. */
  const safe = text => String(text).replace(/[&<>"]/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;"
  }[char]));

  /* The phone number becomes a tap-to-call link once it contains real digits. */
  function phoneHtml() {
    const hasDigits = /\d{6,}/.test(SHOP.phone.replace(/\D/g, ""));
    if (!hasDigits) return safe(SHOP.phone);
    const dialNumber = SHOP.phone.replace(/[^\d+]/g, "");
    return `<a href="tel:${safe(dialNumber)}">${safe(SHOP.phone)}</a>`;
  }

  /* --- The three parts of the footer --- */

  const newsletterHtml = `
    <div class="fnews"><div class="wrap fnews-in">
      <div>
        <h2>Get deals before everyone else</h2>
        <p>One short email when prices drop. No spam, unsubscribe any time.</p>
      </div>
      <form id="nl" novalidate>
        <label class="sr" for="nlEmail">Email address</label>
        <input id="nlEmail" type="email" placeholder="you@example.com" autocomplete="email">
        <button class="btn" type="submit">Subscribe</button>
        <p id="nlMsg" class="nlmsg" role="status"></p>
      </form>
    </div></div>`;

  const columnsHtml = `
    <div class="wrap fgrid">

      <div class="fbrand">
        <a href="index.html" class="logo"><span class="mark">${safe(SHOP.name[0])}</span>${safe(SHOP.name)}</a>
        <p>Laptops, desktops, monitors and accessories — with honest specs, free delivery over $50 and a 2-year warranty.</p>
        <div class="social">
          <a href="${safe(SHOP.facebook)}" aria-label="Facebook">Facebook</a>
          <a href="${safe(SHOP.tiktok)}" aria-label="TikTok">TikTok</a>
          <a href="${safe(SHOP.telegram)}" aria-label="Telegram">Telegram</a>
        </div>
      </div>

      <nav aria-label="Shop">
        <h3>Shop</h3>
        <ul>
          <li><a href="index.html#shop">All products</a></li>
          <li><a href="index.html">Find by use: gaming, work, study</a></li>
          <li><a href="checkoutPage.html">Your cart</a></li>
        </ul>
      </nav>

      <div>
        <h3>Our promise</h3>
        <ul class="plain">
          <li>Free delivery on orders over $50</li>
          <li>2-year warranty on every computer</li>
          <li>30-day returns if it isn't right</li>
          <li>Pay on delivery or bank transfer</li>
        </ul>
      </div>

      <div>
        <h3>Visit or call us</h3>
        <ul class="plain">
          <li>${safe(SHOP.address)}</li>
          <li>${phoneHtml()}</li>
          <li><a href="mailto:${safe(SHOP.email)}">${safe(SHOP.email)}</a></li>
          <li>${safe(SHOP.hours)}</li>
        </ul>
      </div>

    </div>`;

  const bottomBarHtml = `
    <div class="fbar"><div class="wrap fbar-in">
      <p>© ${new Date().getFullYear()} ${safe(SHOP.owner)}. All rights reserved.</p>
      <p class="pay"><span>Pay on delivery</span><span>Bank transfer</span></p>
      <a href="#" class="totop" id="toTop">Back to top ↑</a>
    </div></div>`;

  footer.innerHTML = newsletterHtml + columnsHtml + bottomBarHtml;


  /* --- "Back to top" link --- */

  footer.querySelector("#toTop").addEventListener("click", event => {
    event.preventDefault();
    scrollTo({ top: 0, behavior: "smooth" });
  });


  /* --- Newsletter form --- */

  const emailInput = footer.querySelector("#nlEmail");
  const message = footer.querySelector("#nlMsg");

  footer.querySelector("#nl").addEventListener("submit", event => {
    event.preventDefault();
    const email = emailInput.value.trim();
    const looksValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

    if (!looksValid) {
      message.textContent = "Please enter a valid email, like name@example.com.";
      message.className = "nlmsg bad";
      return;
    }

    /* TODO: send "email" to your server or email tool here. */

    message.textContent = "You're subscribed. Thank you!";
    message.className = "nlmsg";
    emailInput.value = "";
  });
})();