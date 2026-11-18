const PRODUCTS_API = "https://twenty-topaz-six.vercel.app/api/products";

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

let product = null;
let selectedSize = "";
let quantity = 1;


// CART COUNTER

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("twentyCart")) || [];

    const count = cart.reduce((sum, item) => sum + Number(item.quantity || 1), 0);

    const element = document.getElementById("cart-count");

    if (element) {
        element.textContent = count;
        if (count > 0) {
            element.classList.remove("hidden");
        } else {
            element.classList.add("hidden");
        }
    }
}


// LOAD PRODUCT FROM SERVER

async function loadProduct() {
    if (!productId) {
        document.getElementById("product-details").innerHTML = `
            <div class="col-span-2 text-center py-20">
                <h2 class="text-3xl font-bold">Product Not Found</h2>
                <a href="shop.html" class="text-coral underline mt-5 inline-block">
                    Back to Shop
                </a>
            </div>
        `;
        return;
    }

    try {
        const res = await fetch(`${PRODUCTS_API}/${productId}`);
        if (!res.ok) throw new Error("Product not found");

        const raw = await res.json();
        const imageList = Array.isArray(raw.images) && raw.images.length
            ? raw.images
            : (raw.image ? [raw.image] : ["https://placehold.co/800x1000/F8F5F0/D85A30?text=TWENTY"]);

        product = {
            id: raw._id || raw.id,
            name: raw.name,
            price: Number(raw.price || 0),
            category: raw.category || "Collection",
            description: raw.description || "Premium everyday fashion, designed for comfort and style.",
            sizes: Array.isArray(raw.sizes) && raw.sizes.length ? raw.sizes : ["S", "M", "L", "XL"],
            images: imageList
        };

        document.title = product.name + " | TWENTY";

        document.getElementById("breadcrumb-name").textContent = product.name;
        document.getElementById("product-category").textContent = product.category;
        document.getElementById("product-name").textContent = product.name;
        document.getElementById("product-price").textContent =
            "৳" + product.price.toLocaleString("en-BD");

        updateTotalPrice();
        document.getElementById("product-description").textContent =
            product.description;

        // MAIN IMAGE
        const mainImage = document.getElementById("main-image");
        mainImage.src = product.images[0];

        mainImage.onerror = () => {
            mainImage.src = "https://placehold.co/800x1000/F8F5F0/D85A30?text=TWENTY";
        };

        // THUMBNAILS
        document.getElementById("thumbnail-container").innerHTML =
            product.images.map((image, index) => `
                <button onclick="changeImage('${image}', this)"
                    class="border ${index === 0 ? 'border-coral' : 'border-gray-200'} overflow-hidden">
                    <img src="${image}"
                        class="w-full aspect-square object-cover"
                        alt="Product view ${index + 1}">
                </button>
            `).join("");

        // SIZES
        document.getElementById("size-options").innerHTML =
            product.sizes.map(size => `
                <button onclick="selectSize('${size}', this)"
                    class="size-option-button border border-gray-300 w-12 h-12 text-sm hover:border-coral">
                    ${size}
                </button>
            `).join("");

        // HIDE COLOR SECTION IF PRESENT IN HTML
        const colorOptionsEl = document.getElementById("color-options");
        if (colorOptionsEl && colorOptionsEl.parentElement) {
            colorOptionsEl.parentElement.style.display = "none";
        }

        // RELATED PRODUCTS FROM SERVER
        const allRes = await fetch(PRODUCTS_API);
        const allRaw = await allRes.json();
        const allProducts = Array.isArray(allRaw) ? allRaw : [];

        const related = allProducts.filter(item =>
            (item.category || "").toLowerCase() === product.category.toLowerCase() &&
            String(item._id || item.id) !== String(product.id)
        );

        const recommendations = related.length
            ? related
            : allProducts.filter(item => String(item._id || item.id) !== String(product.id)).slice(0, 4);

        document.getElementById("related-products").innerHTML =
            recommendations.slice(0, 4).map(item => {
                const thumb = (Array.isArray(item.images) && item.images[0]) || item.image || "https://placehold.co/800x1000/F8F5F0/D85A30?text=TWENTY";
                return `
                    <a href="product.html?id=${item._id || item.id}" class="group">
                        <img src="${thumb}"
                            class="w-full aspect-[3/4] object-cover bg-cream"
                            alt="${item.name}">
                        <h3 class="text-sm font-semibold mt-3">${item.name}</h3>
                        <p class="text-coral font-bold text-sm mt-2">
                            ৳${Number(item.price || 0).toLocaleString("en-BD")}
                        </p>
                    </a>
                `;
            }).join("");

    } catch (err) {
        document.getElementById("product-details").innerHTML = `
            <div class="col-span-2 text-center py-20">
                <h2 class="text-3xl font-bold">Product Not Found</h2>
                <a href="shop.html" class="text-coral underline mt-5 inline-block">
                    Back to Shop
                </a>
            </div>
        `;
    }
}


// IMAGE SWITCHER

function changeImage(image, button) {
    document.getElementById("main-image").src = image;

    document.querySelectorAll("#thumbnail-container button")
        .forEach(item => item.classList.remove("border-coral"));

    button.classList.add("border-coral");
}


// SIZE SELECTION

function selectSize(size, button) {
    selectedSize = size;

    document.querySelectorAll(".size-option-button")
        .forEach(item => {
            item.classList.remove("bg-dark", "text-white", "border-dark");
        });

    button.classList.add("bg-dark", "text-white", "border-dark");

    document.getElementById("size-error").classList.add("hidden");
}


// TOTAL PRICE

function updateTotalPrice() {
    if (!product) return;

    const total = product.price * quantity;

    document.getElementById("total-price").textContent =
        "৳" + total.toLocaleString("en-BD");
}


// QUANTITY

document.getElementById("quantity-minus")?.addEventListener("click", () => {
    if (quantity > 1) {
        quantity--;
    }

    document.getElementById("quantity").textContent = quantity;

    updateTotalPrice();
});


document.getElementById("quantity-plus")?.addEventListener("click", () => {
    if (quantity < 10) {
        quantity++;
    }

    document.getElementById("quantity").textContent = quantity;

    updateTotalPrice();
});


// ADD TO CART

function addProductToCart() {
    if (!product) return false;

    if (!selectedSize) {
        document.getElementById("size-error").classList.remove("hidden");
        return false;
    }

    let cart = JSON.parse(localStorage.getItem("twentyCart")) || [];

    const existingItem = cart.find(item =>
        String(item.id) === String(product.id) &&
        item.size === selectedSize
    );

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0],
            size: selectedSize,
            quantity: quantity
        });
    }

    localStorage.setItem("twentyCart", JSON.stringify(cart));

    updateCartCount();

    document.getElementById("cart-message").classList.remove("hidden");

    return true;
}


// BUTTON EVENTS

document.getElementById("add-to-cart")?.addEventListener("click", () => {
    addProductToCart();
});

document.getElementById("buy-now")?.addEventListener("click", () => {
    if (addProductToCart()) {
        window.location.href = "cart.html";
    }
});


// SIZE GUIDE

document.getElementById("size-guide")?.addEventListener("click", () => {
    alert(
        "SIZE GUIDE\n\n" +
        "S - Small\n" +
        "M - Medium\n" +
        "L - Large\n" +
        "XL - Extra Large\n" +
        "XXL - Double Extra Large"
    );
});


// INITIALIZE

document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    loadProduct();
});