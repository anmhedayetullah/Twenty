const products = [
    {
        id: 1,
        name: "Classic Oversized T-Shirt",
        price: 850,
        category: "T-Shirts",
        description: "A comfortable oversized t-shirt made for everyday styling. Minimal design, premium feel and relaxed fit.",
        sizes: ["S", "M", "L", "XL"],
        images: [
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
            "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800",
            "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800",
            "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800"
        ]
    },
    {
        id: 2,
        name: "Premium Cotton Shirt",
        price: 1250,
        category: "Shirts",
        description: "A versatile cotton shirt with a clean silhouette. Perfect for casual and smart everyday outfits.",
        sizes: ["M", "L", "XL", "XXL"],
        images: [
            "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800",
            "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800"
        ]
    },
    {
        id: 3,
        name: "Essential Casual Hoodie",
        price: 1650,
        category: "Hoodies",
        description: "A relaxed everyday hoodie with a comfortable fit and timeless streetwear look.",
        sizes: ["S", "M", "L", "XL"],
        images: [
            "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800",
            "https://images.unsplash.com/photo-1578681994506-b8f463449011?w=800"
        ]
    },
    {
        id: 4,
        name: "Classic Denim Jacket",
        price: 2200,
        category: "Jackets",
        description: "A timeless denim jacket designed to complement your everyday wardrobe.",
        sizes: ["M", "L", "XL"],
        images: [
            "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800",
            "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=800"
        ]
    },
    {
        id: 5,
        name: "Women's Casual Top",
        price: 950,
        category: "T-Shirts",
        description: "A versatile casual top for effortless everyday styling.",
        sizes: ["S", "M", "L"],
        images: [
            "https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=800"
        ]
    },
    {
        id: 6,
        name: "Everyday Denim Jeans",
        price: 1850,
        category: "Pants",
        description: "Everyday denim jeans with a versatile casual style.",
        sizes: ["S", "M", "L", "XL"],
        images: [
            "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800"
        ]
    },
    {
        id: 7,
        name: "Minimal White Shirt",
        price: 1150,
        category: "Shirts",
        description: "A clean and minimal shirt for a timeless wardrobe.",
        sizes: ["S", "M", "L"],
        images: [
            "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=800"
        ]
    },
    {
        id: 8,
        name: "Urban Street Hoodie",
        price: 1750,
        category: "Hoodies",
        description: "A modern streetwear hoodie for comfortable everyday outfits.",
        sizes: ["M", "L", "XL", "XXL"],
        images: [
            "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800"
        ]
    },
    {
        id: 9,
        name: "Classic Fashion Bag",
        price: 1450,
        category: "Accessories",
        description: "A minimal everyday bag with a versatile design.",
        sizes: ["M"],
        images: [
            "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"
        ]
    }
];


// GET PRODUCT ID FROM URL

const params = new URLSearchParams(window.location.search);
const productId = Number(params.get("id"));

const product = products.find(item => item.id === productId);

let selectedSize = "";
let quantity = 1;


// CART COUNTER

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("twentyCart")) || [];

    const count = cart.reduce((sum, item) => sum + item.quantity, 0);

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


// LOAD PRODUCT

function loadProduct() {

    if (!product) {
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

    // RELATED PRODUCTS

    const related = products.filter(item =>
        item.category === product.category && item.id !== product.id
    );

    const recommendations = related.length
        ? related
        : products.filter(item => item.id !== product.id).slice(0, 4);

    document.getElementById("related-products").innerHTML =
        recommendations.slice(0, 4).map(item => `
            <a href="product.html?id=${item.id}" class="group">
                <img src="${item.images[0]}"
                    class="w-full aspect-[3/4] object-cover bg-cream"
                    alt="${item.name}">
                <h3 class="text-sm font-semibold mt-3">${item.name}</h3>
                <p class="text-coral font-bold text-sm mt-2">
                    ৳${item.price.toLocaleString("en-BD")}
                </p>
            </a>
        `).join("");

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

document.getElementById("quantity-minus").addEventListener("click", () => {

    if (quantity > 1) {
        quantity--;
    }

    document.getElementById("quantity").textContent = quantity;

    updateTotalPrice();

});


document.getElementById("quantity-plus").addEventListener("click", () => {

    if (quantity < 10) {
        quantity++;
    }

    document.getElementById("quantity").textContent = quantity;

    updateTotalPrice();

});


// ADD TO CART

function addProductToCart() {

    if (!product) return;

    if (!selectedSize) {
        document.getElementById("size-error").classList.remove("hidden");
        return false;
    }

    let cart = JSON.parse(localStorage.getItem("twentyCart")) || [];

    const existingItem = cart.find(item =>
        item.id === product.id &&
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

document.getElementById("add-to-cart").addEventListener("click", () => {
    addProductToCart();
});

document.getElementById("buy-now").addEventListener("click", () => {

    if (addProductToCart()) {
        window.location.href = "cart.html";
    }

});


// SIZE GUIDE

document.getElementById("size-guide").addEventListener("click", () => {

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

    console.log("TWENTY Product Details Loaded!");

});