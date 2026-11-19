/* =====================================================================
   PRODUCTS — edit this list to add, change or remove products.
   ---------------------------------------------------------------------
   id      unique number (also used in the link: productPage.html?id=1)
   image   just the file name; the file lives in the IMAGE_FOLDER below
   cat     category: Laptops, Desktops, Monitors, Accessories, Networking
   use     "gaming", "work" or "study"
   price   current price in USD
   old     crossed-out price (delete this line if not on sale)
   rating  number from 1 to 5
   stock   how many are available
   specs   exactly 3 short lines
   ===================================================================== */

/* The folder that holds your product photos (relative to index.html). */
const IMAGE_FOLDER = "assets/";

const PRODUCTS = [

  /* ---------- Laptops ---------- */
  {
    id: 1,
    image: "vortex-15-gaming-laptop.png",
    name: "Vortex 15 Gaming Laptop",
    cat: "Laptops",
    use: "gaming",
    price: 1499,
    old: 1699,
    rating: 4.8,
    stock: 6,
    specs: ["Core i7 · 16 GB RAM", "RTX 4060 · 1 TB SSD", "15.6″ 165 Hz"]
  },
  {
    id: 2,
    image: "slate-14-ultrabook.png",
    name: "Slate 14 Ultrabook",
    cat: "Laptops",
    use: "work",
    price: 1099,
    rating: 4.7,
    stock: 12,
    specs: ["Core Ultra 7 · 16 GB", "512 GB SSD", "14″ 2.8K OLED · 1.2 kg"]
  },
  {
    id: 3,
    image: "campus-15-laptop.png",
    name: "Campus 15 Laptop",
    cat: "Laptops",
    use: "study",
    price: 549,
    old: 629,
    rating: 4.4,
    stock: 20,
    specs: ["Ryzen 5 · 8 GB RAM", "256 GB SSD", "15.6″ Full HD"]
  },

  /* ---------- Desktops ---------- */
  {
    id: 4,
    image: "titan-tower-gaming-pc.png",
    name: "Titan Tower Gaming PC",
    cat: "Desktops",
    use: "gaming",
    price: 1899,
    rating: 4.9,
    stock: 4,
    specs: ["Ryzen 7 · 32 GB DDR5", "RTX 4070 Super", "2 TB NVMe SSD"]
  },
  {
    id: 5,
    image: "office-mini-pc.png",
    name: "Office Mini PC",
    cat: "Desktops",
    use: "work",
    price: 429,
    rating: 4.5,
    stock: 15,
    specs: ["Core i5 · 16 GB", "512 GB SSD", "Fits in one hand"]
  },
  {
    id: 6,
    image: "all-in-one-24.png",
    name: "Learner All-in-One 24″",
    cat: "Desktops",
    use: "study",
    price: 699,
    rating: 4.3,
    stock: 9,
    specs: ["Core i3 · 8 GB", "256 GB SSD", "24″ Full HD, webcam"]
  },

  /* ---------- Monitors ---------- */
  {
    id: 7,
    image: "pulse-27-165-hz-monitor.png",
    name: "Pulse 27″ 165 Hz Monitor",
    cat: "Monitors",
    use: "gaming",
    price: 289,
    old: 349,
    rating: 4.6,
    stock: 18,
    specs: ["27″ QHD IPS", "165 Hz · 1 ms", "HDMI 2.1 + DP"]
  },
  {
    id: 8,
    image: "focus-32-4k-monitor.png",
    name: "Focus 32″ 4K Monitor",
    cat: "Monitors",
    use: "work",
    price: 459,
    rating: 4.7,
    stock: 7,
    specs: ["32″ 4K IPS", "USB-C 90 W charging", "Height-adjustable stand"]
  },

  /* ---------- Accessories ---------- */
  {
    id: 9,
    image: "mecha-keyboard-k8.png",
    name: "Mecha Keyboard K8",
    cat: "Accessories",
    use: "gaming",
    price: 89,
    rating: 4.6,
    stock: 30,
    specs: ["Hot-swap switches", "Wireless + wired", "RGB backlight"]
  },
  {
    id: 10,
    image: "quiet-mouse-m3.png",
    name: "Quiet Mouse M3",
    cat: "Accessories",
    use: "work",
    price: 39,
    rating: 4.5,
    stock: 40,
    specs: ["Silent clicks", "Bluetooth, 3 devices", "70-day battery"]
  },
  {
    id: 11,
    image: "portable-ssd-1-tb.png",
    name: "Portable SSD 1 TB",
    cat: "Accessories",
    use: "study",
    price: 99,
    old: 119,
    rating: 4.8,
    stock: 25,
    specs: ["1,050 MB/s", "USB-C", "Pocket sized"]
  },

  /* ---------- Networking ---------- */
  {
    id: 12,
    image: "wifi-6-router-ax3000.png",
    name: "Wi-Fi 6 Router AX3000",
    cat: "Networking",
    use: "work",
    price: 79,
    rating: 4.4,
    stock: 14,
    specs: ["Up to 3 Gbps", "Covers 150 m²", "Easy phone setup"]
  }
];


/* =====================================================================
   IMAGE LOADING — you normally do not need to change anything below.
   For each product the page tries IMAGE_FOLDER + image first. If that file
   is missing it tries the same name with other extensions (.jpg, .webp …),
   and finally shows the product name on a coloured block.
   ===================================================================== */

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif", "jfif", "gif", "JPG", "JPEG", "PNG", "WEBP"];

/* Full web addresses and paths starting with "/" are used as they are. */
function imagePath(file) {
  return /^(https?:|data:|\/)/.test(file) ? file : IMAGE_FOLDER + file;
}

/* Build the list of image paths to try for every product. */
PRODUCTS.forEach(product => {
  const first = imagePath((product.image || "").trim());
  const withoutExtension = first.replace(/\.[^./]+$/, "");
  const others = IMAGE_EXTENSIONS.map(ext => `${withoutExtension}.${ext}`);
  product.imgs = [...new Set([first, ...others])];
});

/* Returns the <img> HTML for a product (used by all pages). */
const pic = product =>
  `<img src="${product.imgs[0]}" alt="${esc(product.name)}" loading="lazy" data-pid="${product.id}" data-n="0">`;

/* If an image fails to load, try the next path; after the last one show a placeholder. */
document.addEventListener("error", event => {
  const img = event.target;
  if (img.tagName !== "IMG" || !img.dataset.pid) return;

  const product = PRODUCTS.find(p => p.id == img.dataset.pid);
  const next = Number(img.dataset.n) + 1;

  if (product && next < product.imgs.length) {
    img.dataset.n = next;
    img.src = product.imgs[next];
    return;
  }

  if (product) {
    console.warn(`Image not found for "${product.name}". Looked for: ${product.imgs.join(", ")}`);
  }
  const placeholder = document.createElement("span");
  placeholder.className = "ph";
  placeholder.textContent = product ? product.name : "No image";
  img.replaceWith(placeholder);
}, true);