
// =====================================
// TWENTY — EVERYDAY FASHION
// Main JavaScript
// =====================================

// Sample Products
const products = [
    {
        id: 1,
        name: "Classic Oversized T-Shirt",
        price: 850,
        category: "T-Shirts",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
        badge: "NEW"
    },
    {
        id: 2,
        name: "Premium Cotton Shirt",
        price: 1250,
        category: "Shirts",
        image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600",
        badge: "POPULAR"
    },
    {
        id: 3,
        name: "Essential Casual Hoodie",
        price: 1650,
        category: "Hoodies",
        image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600",
        badge: "NEW"
    },
    {
        id: 4,
        name: "Classic Denim Jacket",
        price: 2200,
        category: "Jackets",
        image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600",
        badge: "TRENDING"
    }
];


// =====================================
// CART SYSTEM
// =====================================

let cart = JSON.parse(localStorage.getItem("twentyCart")) || [];

function saveCart() {
    localStorage.setItem("twentyCart", JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cartCount = document.getElementById("cart-count");

    if (cartCount) {
        const totalItems = cart.reduce(
            (total, item) => total + item.quantity,
            0
        );

        cartCount.textContent = totalItems;
    }
}

function addToCart(productId) {
    const product = products.find(item => item.id === productId);

    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            size: "M",
            color: "Default",
            quantity: 1
        });
    }

    saveCart();

    alert(`${product.name} added to your cart!`);
}


// =====================================
// DISPLAY NEW ARRIVALS
// =====================================

function displayProducts() {
    const productContainer = document.getElementById("new-arrivals");

    if (!productContainer) return;

    productContainer.innerHTML = products.map(product => `
        <div class="product-card group">

            <div class="relative overflow-hidden bg-white">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                    loading="lazy"
                    onerror="this.src='https://placehold.co/600x800/F8F5F0/D85A30?text=TWENTY'"
                >

                <span class="absolute top-3 left-3 bg-coral text-white text-[10px] font-bold px-3 py-2">
                    ${product.badge}
                </span>

                <button
                    onclick="addToCart(${product.id})"
                    class="absolute bottom-0 left-0 w-full bg-dark text-white py-4 text-xs font-semibold tracking-widest opacity-0 group-hover:opacity-100 transition duration-300 hover:bg-coral">
                    ADD TO CART +
                </button>

            </div>

            <div class="pt-3 pb-5">

                <p class="text-xs text-gray-400 mb-2">
                    ${product.category}
                </p>

                <h3 class="text-sm font-semibold text-dark">
                    ${product.name}
                </h3>

                <p class="text-sm font-bold mt-2">
                    ৳${product.price.toLocaleString("en-BD")}
                </p>

            </div>

        </div>
    `).join("");
}


// =====================================
// MOBILE NAVIGATION
// =====================================

const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");

if (menuToggle && mobileMenu) {

    menuToggle.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden");
    });

    mobileMenu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            mobileMenu.classList.add("hidden");
        });
    });
}


// =====================================
// INITIALIZE WEBSITE
// =====================================

document.addEventListener("DOMContentLoaded", () => {

    displayProducts();

    updateCartCount();

    console.log("TWENTY Fashion Store initialized!");

});
