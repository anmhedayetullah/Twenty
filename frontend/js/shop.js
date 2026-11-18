
// ==========================================
// TWENTY — SHOP PAGE FUNCTIONALITY
// ==========================================


// 1. PRODUCT DATABASE (Temporary Sample Data)

const shopProducts = [

    {
        id: 1,
        name: "Classic Oversized T-Shirt",
        price: 850,
        category: "T-Shirts",
        gender: "Men",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Black", "White", "Beige"],
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
        badge: "NEW"
    },

    {
        id: 2,
        name: "Premium Cotton Shirt",
        price: 1250,
        category: "Shirts",
        gender: "Men",
        sizes: ["M", "L", "XL", "XXL"],
        colors: ["White", "Blue"],
        image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600",
        badge: "POPULAR"
    },

    {
        id: 3,
        name: "Essential Casual Hoodie",
        price: 1650,
        category: "Hoodies",
        gender: "Unisex",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Black", "Beige"],
        image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600",
        badge: "NEW"
    },

    {
        id: 4,
        name: "Classic Denim Jacket",
        price: 2200,
        category: "Jackets",
        gender: "Men",
        sizes: ["M", "L", "XL"],
        colors: ["Blue", "Black"],
        image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600",
        badge: "TRENDING"
    },

    {
        id: 5,
        name: "Women's Casual Top",
        price: 950,
        category: "T-Shirts",
        gender: "Women",
        sizes: ["S", "M", "L"],
        colors: ["White", "Beige"],
        image: "https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=600",
        badge: "NEW"
    },

    {
        id: 6,
        name: "Everyday Denim Jeans",
        price: 1850,
        category: "Pants",
        gender: "Unisex",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Blue", "Black"],
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600",
        badge: "POPULAR"
    },

    {
        id: 7,
        name: "Minimal White Shirt",
        price: 1150,
        category: "Shirts",
        gender: "Women",
        sizes: ["S", "M", "L"],
        colors: ["White", "Beige"],
        image: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=600",
        badge: "NEW"
    },

    {
        id: 8,
        name: "Urban Street Hoodie",
        price: 1750,
        category: "Hoodies",
        gender: "Unisex",
        sizes: ["M", "L", "XL", "XXL"],
        colors: ["Black", "Blue"],
        image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600",
        badge: "TRENDING"
    },

    {
        id: 9,
        name: "Classic Fashion Bag",
        price: 1450,
        category: "Accessories",
        gender: "Women",
        sizes: ["M"],
        colors: ["Black", "Beige"],
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600",
        badge: "NEW"
    }

];


// 2. DOM ELEMENTS

const productContainer = document.getElementById("shop-products");
const productCount = document.getElementById("product-count");
const noProducts = document.getElementById("no-products");

const searchInput = document.getElementById("product-search");
const sortSelect = document.getElementById("sort-products");

const priceFilter = document.getElementById("price-filter");
const priceValue = document.getElementById("price-value");

const resetButton = document.getElementById("reset-filters");


// 3. FILTER STATE

let selectedCategory = "all";


// 4. DISPLAY PRODUCTS

function displayShopProducts(items) {

    productCount.textContent = items.length;

    if (items.length === 0) {

        productContainer.innerHTML = "";
        noProducts.classList.remove("hidden");

        return;
    }

    noProducts.classList.add("hidden");

    productContainer.innerHTML = items.map(product => `

        <div class="product-card group">

            <div class="relative overflow-hidden bg-gray-100">

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
                    onclick="addShopToCart(${product.id})"
                    class="absolute bottom-0 left-0 w-full bg-dark text-white py-4 text-xs font-semibold tracking-widest opacity-100 md:opacity-0 md:group-hover:opacity-100 transition hover:bg-coral">

                    ADD TO CART +

                </button>

            </div>

            <div class="pt-3 pb-4">

                <p class="text-xs text-gray-400 mb-2">
                    ${product.category} · ${product.gender}
                </p>

                <h3 class="text-sm font-semibold">
                    ${product.name}
                </h3>

                <p class="text-sm font-bold mt-2 text-coral">
                    ৳${product.price.toLocaleString("en-BD")}
                </p>
                <a href="product.html?id=${product.id}"
   class="inline-block mt-3 text-xs font-bold tracking-widest border-b border-coral pb-1 hover:text-coral">
   VIEW DETAILS →
</a>

            </div>

        </div>

    `).join("");

}


// 5. FILTER FUNCTION

function filterProducts() {

    let filteredProducts = [...shopProducts];

    // Category filter

    if (selectedCategory !== "all") {

        if (selectedCategory === "Men" || selectedCategory === "Women") {

            filteredProducts = filteredProducts.filter(product =>
                product.gender === selectedCategory ||
                product.gender === "Unisex"
            );

        } else {

            filteredProducts = filteredProducts.filter(product =>
                product.category === selectedCategory
            );

        }

    }


    // Search filter

    const searchTerm = searchInput.value.toLowerCase().trim();

    if (searchTerm) {

        filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm) ||
            product.gender.toLowerCase().includes(searchTerm)
        );

    }


    // Price filter

    const maxPrice = Number(priceFilter.value);

    filteredProducts = filteredProducts.filter(product =>
        product.price <= maxPrice
    );


    // Size filter

    const selectedSizes = [
        ...document.querySelectorAll('input[name="size"]:checked')
    ].map(input => input.value);

    if (selectedSizes.length > 0) {

        filteredProducts = filteredProducts.filter(product =>
            selectedSizes.some(size => product.sizes.includes(size))
        );

    }


    // Color filter

    const selectedColors = [
        ...document.querySelectorAll('input[name="color"]:checked')
    ].map(input => input.value);

    if (selectedColors.length > 0) {

        filteredProducts = filteredProducts.filter(product =>
            selectedColors.some(color => product.colors.includes(color))
        );

    }


    // Sorting

    const sortValue = sortSelect.value;

    if (sortValue === "low-high") {

        filteredProducts.sort((a, b) => a.price - b.price);

    } else if (sortValue === "high-low") {

        filteredProducts.sort((a, b) => b.price - a.price);

    } else if (sortValue === "name") {

        filteredProducts.sort((a, b) =>
            a.name.localeCompare(b.name)
        );

    }


    displayShopProducts(filteredProducts);

}


// 6. CATEGORY EVENTS

document.querySelectorAll('input[name="category"]').forEach(input => {

    input.addEventListener("change", () => {

        selectedCategory = input.value;

        filterProducts();

    });

});


// 7. SEARCH EVENT

searchInput.addEventListener("input", filterProducts);


// 8. SORT EVENT

sortSelect.addEventListener("change", filterProducts);


// 9. PRICE EVENT

priceFilter.addEventListener("input", () => {

    priceValue.textContent =
        "৳" + Number(priceFilter.value).toLocaleString("en-BD");

    filterProducts();

});


// 10. SIZE AND COLOR EVENTS

document.querySelectorAll('input[name="size"], input[name="color"]')
    .forEach(input => {

        input.addEventListener("change", filterProducts);

    });


// 11. RESET FILTERS

resetButton.addEventListener("click", () => {

    selectedCategory = "all";

    document.querySelector('input[name="category"][value="all"]').checked = true;

    searchInput.value = "";

    sortSelect.value = "default";

    priceFilter.value = 5000;

    priceValue.textContent = "৳5,000";

    document.querySelectorAll('input[name="size"], input[name="color"]')
        .forEach(input => input.checked = false);

    filterProducts();

});


// 12. ADD TO CART

function addShopToCart(productId) {

    const product = shopProducts.find(item => item.id === productId);

    if (!product) return;

    let cart = JSON.parse(localStorage.getItem("twentyCart")) || [];

    const existingItem = cart.find(item =>
        item.id === productId &&
        item.size === "M" &&
        item.color === "Default"
    );

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

    localStorage.setItem("twentyCart", JSON.stringify(cart));

    updateShopCartCount();

    alert(product.name + " added to your cart!");

}


// 13. CART COUNTER

function updateShopCartCount() {

    const cartCount = document.getElementById("cart-count");

    const cart = JSON.parse(localStorage.getItem("twentyCart")) || [];

    if (cartCount) {

        const totalItems = cart.reduce(
            (total, item) => total + item.quantity,
            0
        );

        cartCount.textContent = totalItems;

    }

}


// 14. MOBILE MENU

const shopMenuToggle = document.getElementById("shop-menu-toggle");
const shopMobileMenu = document.getElementById("shop-mobile-menu");

if (shopMenuToggle && shopMobileMenu) {

    shopMenuToggle.addEventListener("click", () => {

        shopMobileMenu.classList.toggle("hidden");

    });

}


// 15. INITIALIZE SHOP PAGE

document.addEventListener("DOMContentLoaded", () => {

    // Support category links from homepage/navbar

    const params = new URLSearchParams(window.location.search);

    const requestedCategory = params.get("category");

    if (requestedCategory) {

        const categoryMap = {
            men: "Men",
            women: "Women",
            accessories: "Accessories"
        };

        selectedCategory = categoryMap[requestedCategory.toLowerCase()] || "all";

        const categoryInput = document.querySelector(
            `input[name="category"][value="${selectedCategory}"]`
        );

        if (categoryInput) {
            categoryInput.checked = true;
        }

    }

    updateShopCartCount();

    filterProducts();

    console.log("TWENTY Shop Page is ready!");

});
