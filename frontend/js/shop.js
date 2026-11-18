const PRODUCTS_API = "https://twenty-topaz-six.vercel.app/api/products";
let allServerProducts = [];

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

function syncActiveCategoryUI(activeCat) {
    const cat = (activeCat || "all").toLowerCase();

    document.querySelectorAll("header nav a, #mobile-menu a").forEach(link => {
        const href = (link.getAttribute("href") || "").toLowerCase();
        const isMatch =
            (cat === "men" && href.includes("category=men")) ||
            (cat === "women" && href.includes("category=women")) ||
            (cat === "accessories" && href.includes("category=accessories")) ||
            ((cat === "all" || !cat) && href === "shop.html");

        if (href.includes("shop.html")) {
            link.classList.toggle("text-coral", isMatch);
            link.classList.toggle("font-semibold", isMatch);
        }
    });

    const heading = document.querySelector("h1");
    if (heading) {
        if (cat === "men") heading.textContent = "Men's Collection";
        else if (cat === "women") heading.textContent = "Women's Collection";
        else if (cat === "accessories") heading.textContent = "Accessories";
        else heading.textContent = "Shop All Products";
    }
}

function renderShopProducts(list) {
    const grid = document.getElementById("shop-products") || document.getElementById("products-grid");
    const countEl = document.getElementById("product-count") || document.getElementById("results-count");
    if (!grid) return;

    if (countEl) {
        const hasExtraText = countEl.parentElement && countEl.parentElement.textContent.includes("products found") && countEl.tagName === "SPAN";
        countEl.textContent = hasExtraText
            ? `${list.length}`
            : `${list.length} product${list.length === 1 ? "" : "s"} found`;
    }

    if (list.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-16 text-gray-400 text-sm">
                No products found in this category yet.
            </div>
        `;
        return;
    }

    grid.innerHTML = list.map(p => {
        const id = p._id || p.id;
        const img = (Array.isArray(p.images) && p.images[0]) || p.image || "https://placehold.co/800x1000/F8F5F0/D85A30?text=TWENTY";
        return `
            <a href="product.html?id=${id}" class="product-card group block">
                <div class="bg-cream overflow-hidden aspect-[4/5]">
                    <img src="${img}" alt="${p.name}"
                        class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                </div>
                <p class="text-[11px] uppercase tracking-widest text-gray-400 mt-3">${p.category || "Collection"}</p>
                <h3 class="text-sm font-bold mt-1 group-hover:text-coral transition">${p.name}</h3>
                <p class="text-sm font-semibold text-coral mt-1">৳${Number(p.price || 0).toLocaleString("en-BD")}</p>
            </a>
        `;
    }).join("");
}

function applyShopFilters() {
    const params = new URLSearchParams(window.location.search);
    const urlCat = (params.get("category") || "").toLowerCase();
    const checkedRadio = document.querySelector('input[name="category"]:checked');
    const selectedCat = checkedRadio ? checkedRadio.value.toLowerCase() : (urlCat || "all");
    const searchTerm = (document.getElementById("search-input")?.value || "").trim().toLowerCase();

    syncActiveCategoryUI(selectedCat);

    let filtered = [...allServerProducts];

    if (selectedCat && selectedCat !== "all") {
        filtered = filtered.filter(p => {
            const cat = (p.category || "").toLowerCase().trim();
            const gen = (p.gender || "").toLowerCase().trim();

            if (selectedCat === "men") return cat === "men" || gen === "men";
            if (selectedCat === "women") return cat === "women" || gen === "women";
            if (selectedCat === "t-shirts" || selectedCat === "t-shirt") {
                return cat === "t-shirts" || cat === "t-shirt" || cat === "tshirts" || cat === "tshirt";
            }
            if (selectedCat === "shirts" || selectedCat === "shirt") {
                return cat === "shirts" || cat === "shirt";
            }
            if (selectedCat === "hoodies" || selectedCat === "hoodie") {
                return cat === "hoodies" || cat === "hoodie";
            }
            if (selectedCat === "pants" || selectedCat === "pants & jeans" || selectedCat === "jeans") {
                return cat === "pants" || cat === "jeans" || cat === "pants & jeans";
            }
            if (selectedCat === "accessories") {
                return cat === "accessories" || cat.includes("cap") || cat.includes("sunglass");
            }
            return cat === selectedCat || gen === selectedCat;
        });
    }

    if (searchTerm) {
        filtered = filtered.filter(p =>
            (p.name || "").toLowerCase().includes(searchTerm) ||
            (p.category || "").toLowerCase().includes(searchTerm)
        );
    }

    const sortVal = document.getElementById("sort-select")?.value || "";
    if (sortVal === "low-high" || sortVal === "price-asc") {
        filtered.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortVal === "high-low" || sortVal === "price-desc") {
        filtered.sort((a, b) => Number(b.price) - Number(a.price));
    }

    renderShopProducts(filtered);
}

async function initShop() {
    const grid = document.getElementById("shop-products") || document.getElementById("products-grid");
    try {
        const res = await fetch(PRODUCTS_API);
        const data = await res.json();
        allServerProducts = Array.isArray(data) ? data : [];

        const params = new URLSearchParams(window.location.search);
        const urlCat = (params.get("category") || "").toLowerCase();

        if (urlCat) {
            document.querySelectorAll('input[name="category"]').forEach(r => {
                r.checked = r.value.toLowerCase() === urlCat;
            });
        }

        applyShopFilters();
    } catch (err) {
        if (grid) {
            grid.innerHTML = `<div class="col-span-full text-center py-16 text-red-500 text-sm">Could not load products from live server.</div>`;
        }
    }
}

document.querySelectorAll('input[name="category"]').forEach(r => {
    r.addEventListener("change", () => {
        const val = r.value.toLowerCase();
        const newUrl = val === "all" ? "shop.html" : `shop.html?category=${encodeURIComponent(val)}`;
        window.history.replaceState({}, "", newUrl);
        applyShopFilters();
    });
});
document.getElementById("search-input")?.addEventListener("input", applyShopFilters);
document.getElementById("sort-select")?.addEventListener("change", applyShopFilters);

document.addEventListener("DOMContentLoaded", () => {
    updateCartBadge();
    initShop();
});