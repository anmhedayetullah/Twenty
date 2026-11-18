/* ==========================================
   TWENTY — CHECKOUT (CASH ON DELIVERY ONLY)
========================================== */

// 1. MOBILE MENU TOGGLE
const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");

if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden");
    });
}

// 2. HELPERS
function getCart() {
    return JSON.parse(localStorage.getItem("twentyCart")) || [];
}

function formatPrice(price) {
    return "৳" + Number(price).toLocaleString("en-BD");
}

function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + Number(item.quantity), 0);
    const counter = document.getElementById("cart-count");

    if (counter) {
        counter.textContent = totalItems;
        if (totalItems > 0) {
            counter.classList.remove("hidden");
        } else {
            counter.classList.add("hidden");
        }
    }
}

// 3. AUTO-FILL LOGGED IN CUSTOMER DETAILS
function prefillCustomerInfo() {
    const currentUser = JSON.parse(localStorage.getItem("twentyCurrentUser"));
    if (!currentUser) return;

    const nameInput = document.getElementById("full-name");
    const phoneInput = document.getElementById("phone");
    const emailInput = document.getElementById("email");

    if (nameInput && !nameInput.value && currentUser.name) {
        nameInput.value = currentUser.name;
    }
    if (phoneInput && !phoneInput.value && currentUser.phone) {
        phoneInput.value = currentUser.phone;
    }
    if (emailInput && !emailInput.value && currentUser.email) {
        emailInput.value = currentUser.email;
    }
}

// 4. CALCULATE & RENDER SUMMARY
function renderCheckoutSummary() {
    const cart = getCart();
    const formEl = document.getElementById("checkout-form");
    const emptyEl = document.getElementById("checkout-empty");

    if (cart.length === 0) {
        if (formEl) formEl.classList.add("hidden");
        if (emptyEl) emptyEl.classList.remove("hidden");
        return;
    }

    const itemsContainer = document.getElementById("checkout-items");
    itemsContainer.innerHTML = cart.map(item => `
        <div class="flex items-center justify-between gap-3 border-b border-gray-200 pb-3">
            <div class="flex items-center gap-3 min-w-0">
                <img src="${item.image}" alt="${item.name}"
                    class="w-12 h-14 object-cover bg-white border border-gray-200 shrink-0">
                <div class="min-w-0">
                    <p class="text-xs font-bold text-dark truncate">${item.name}</p>
                    <p class="text-[11px] text-gray-500">Size: ${item.size} · Qty: ${item.quantity}</p>
                </div>
            </div>
            <span class="text-xs font-bold text-dark shrink-0">
                ${formatPrice(Number(item.price) * Number(item.quantity))}
            </span>
        </div>
    `).join("");

    const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
    const city = document.getElementById("city").value;
    const baseDelivery = city === "outside" ? 130 : 80;
    const delivery = subtotal >= 3000 ? 0 : baseDelivery;
    const grandTotal = subtotal + delivery;

    document.getElementById("checkout-subtotal").textContent = formatPrice(subtotal);
    document.getElementById("checkout-delivery").textContent = delivery === 0 ? "FREE" : formatPrice(delivery);
    document.getElementById("checkout-total").textContent = formatPrice(grandTotal);

    const noteEl = document.getElementById("free-shipping-note");
    if (noteEl) {
        if (subtotal >= 3000) {
            noteEl.textContent = "You unlocked FREE nationwide delivery!";
        } else {
            noteEl.textContent = `Add ${formatPrice(3000 - subtotal)} more for FREE delivery.`;
        }
    }
}

document.getElementById("city").addEventListener("change", renderCheckoutSummary);

// 5. PLACE ORDER (CASH ON DELIVERY)
document.getElementById("checkout-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const cart = getCart();
    if (cart.length === 0) return;

    const fullName = document.getElementById("full-name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const city = document.getElementById("city").value;
    const address = document.getElementById("address").value.trim();
    const notes = document.getElementById("order-notes").value.trim();

    const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
    const delivery = subtotal >= 3000 ? 0 : (city === "outside" ? 130 : 80);
    const grandTotal = subtotal + delivery;

    const orderId = "#TW-" + Math.floor(1000 + Math.random() * 9000);

    const newOrder = {
        orderId,
        createdAt: new Date().toISOString(),
        status: "Pending",
        customer: {
            fullName,
            phone,
            email,
            city,
            address,
            notes
        },
        items: cart,
        subtotal,
        delivery,
        grandTotal,
        payment: {
            method: "Cash on Delivery",
            trxId: ""
        }
    };

    const existingOrders = JSON.parse(localStorage.getItem("twentyOrders")) || [];
    existingOrders.push(newOrder);
    localStorage.setItem("twentyOrders", JSON.stringify(existingOrders));

    localStorage.removeItem("twentyCart");
    updateCartCount();

    window.location.href = "orders.html";
});

// 6. INITIALIZE
document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    prefillCustomerInfo();
    renderCheckoutSummary();
});