const PRODUCTS_API = "https://twenty-topaz-six.vercel.app/api/products";

document.getElementById("menu-toggle")?.addEventListener("click", () => {
    document.getElementById("mobile-menu")?.classList.toggle("hidden");
});

function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem("twentyCart")) || [];
    const total = cart.reduce((s, i) => s + Number(i.quantity || 1), 0);
    const badge = document.getElementById("cart-count");
    if (badge) {
        badge.textContent = total;
        badge.classList.toggle("hidden", total === 0);
    }
}

async function loadNewArrivals() {
    const container = document.getElementById("new-arrivals");
    if (!container) return;

    try {
        const res = await fetch(PRODUCTS_API);
        const products = await res.json();

        if (!Array.isArray(products) || products.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12 text-gray-400 text-sm">
                    No products available yet. Admin can add products from the Admin Panel.
                </div>
            `;
            return;
        }

        container.innerHTML = products.slice(0, 8).map(p => `
            <a href="product.html?id=${p._id}" class="product-card group block">
                <div class="bg-cream overflow-hidden aspect-[4/5]">
                    <img src="${p.image}" alt="${p.name}"
                        class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                </div>
                <p class="text-[11px] uppercase tracking-widest text-gray-400 mt-3">${p.category}</p>
                <h3 class="text-sm font-bold mt-1 group-hover:text-coral transition">${p.name}</h3>
                <p class="text-sm font-semibold text-dark mt-1">৳${Number(p.price).toLocaleString("en-BD")}</p>
            </a>
        `).join("");
    } catch (err) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12 text-red-500 text-sm">
                Unable to load products. Make sure the backend server is running.
            </div>
        `;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    updateCartBadge();
    loadNewArrivals();
});