const API_BASE = "https://twenty-topaz-six.vercel.app/api";

const pageLabels = {
    profile: ["Profile", "admin.html"],
    dashboard: ["Dashboard", "admin-dash.html"],
    products: ["Products", "admin-products.html"],
    users: ["Users", "admin-users.html"],
    orders: ["Orders", "admin-orders.html"],
    payments: ["Payments", "admin-payments.html"]
};

function authHeaders() {
    return {
        "Authorization": `Bearer ${localStorage.getItem("twentyAuthToken")}`,
        "Content-Type": "application/json"
    };
}

function formatPrice(value) {
    return "৳" + Number(value || 0).toLocaleString("en-BD");
}

function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[char]));
}

function logout() {
    localStorage.removeItem("twentyAuthToken");
    localStorage.removeItem("twentyCurrentUser");
    sessionStorage.removeItem("twentyAdminLoggedIn");
    window.location.href = "login.html";
}

async function protectAdmin() {
    const token = localStorage.getItem("twentyAuthToken");
    if (!token) {
        window.location.href = "login.html";
        return null;
    }
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const user = await response.json();
        if (!response.ok || user.role !== "admin") throw new Error("Admin access required");
        localStorage.setItem("twentyCurrentUser", JSON.stringify(user));
        return user;
    } catch (error) {
        window.location.href = "login.html";
        return null;
    }
}

function renderShell(user, activePage) {
    const nav = Object.entries(pageLabels).map(([key, [label, href]]) => `
        <a href="${href}" class="block border-l-2 px-4 py-3 text-sm font-semibold ${activePage === key ? "border-coral bg-[#fff7f3] text-coral" : "border-transparent text-gray-600 hover:bg-cream hover:text-dark"}">
            ${label}
        </a>
    `).join("");

    document.getElementById("admin-layout").innerHTML = `
        <aside class="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-gray-200 bg-white min-h-[100dvh]">
            <div class="px-5 py-6 border-b border-gray-100">
                <a href="index.html" class="text-2xl font-bold tracking-tight">twenty<span class="text-coral">.</span></a>
                <p class="mt-3 text-xs uppercase tracking-[3px] text-gray-400 font-bold">TWENTY Admin</p>
                <p class="mt-2 font-bold">${escapeHtml(user.name || "Administrator")}</p>
            </div>
            <nav class="py-4 space-y-1">${nav}</nav>
            <button id="admin-page-logout" class="mx-5 mb-6 mt-auto text-left text-sm font-bold text-red-600">Logout</button>
        </aside>
        <main class="flex-1 min-w-0 bg-[#f7f7f5]">
            <div class="lg:hidden sticky top-0 z-[100] border-b border-gray-200 bg-white px-4 py-3 overflow-x-auto">
                <nav class="flex min-w-max gap-2">${Object.entries(pageLabels).map(([key, [label, href]]) => `<a href="${href}" class="px-3 py-2 text-xs font-bold ${activePage === key ? "bg-coral text-white" : "border border-gray-200 bg-white"}">${label}</a>`).join("")}<button id="admin-mobile-logout" class="px-3 py-2 text-xs font-bold text-red-600">Logout</button></nav>
            </div>
            <div id="admin-page-content" class="max-w-7xl mx-auto px-5 sm:px-8 py-8"></div>
        </main>
    `;
    document.getElementById("admin-page-logout").addEventListener("click", logout);
    document.getElementById("admin-mobile-logout")?.addEventListener("click", logout);
}

async function loadProfile() {
    const user = await protectAdmin();
    if (!user) return;
    renderShell(user, "profile");
    document.getElementById("admin-page-content").innerHTML = `
        <div class="mb-8">
            <p class="text-xs uppercase tracking-[3px] text-coral font-bold">Protected account</p>
            <h1 class="text-3xl font-bold mt-2">Profile</h1>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div class="md:col-span-2 border border-gray-200 bg-white p-6">
                <p class="text-xs uppercase tracking-wider text-gray-400 font-bold">Account details</p>
                <dl class="mt-5 divide-y divide-gray-100">
                    <div class="py-4 grid grid-cols-3"><dt class="text-sm text-gray-500">Name</dt><dd class="col-span-2 font-semibold">${escapeHtml(user.name)}</dd></div>
                    <div class="py-4 grid grid-cols-3"><dt class="text-sm text-gray-500">Email</dt><dd class="col-span-2 font-semibold">${escapeHtml(user.email)}</dd></div>
                    <div class="py-4 grid grid-cols-3"><dt class="text-sm text-gray-500">Access</dt><dd class="col-span-2 font-semibold text-coral">Administrator</dd></div>
                </dl>
            </div>
            <div class="border border-gray-200 bg-white p-6">
                <p class="text-xs uppercase tracking-wider text-gray-400 font-bold">Admin navigation</p>
                <div class="mt-5 space-y-2">
                    ${Object.entries(pageLabels).map(([key, [label, href]]) => key === "profile" ? "" : `<a class="block border border-gray-200 px-4 py-3 text-sm font-semibold hover:border-coral" href="${href}">${label}</a>`).join("")}
                </div>
            </div>
        </div>
    `;
}

async function loadDashboard() {
    const user = await protectAdmin();
    if (!user) return;
    renderShell(user, "dashboard");
    const content = document.getElementById("admin-page-content");
    content.innerHTML = `<p class="text-gray-500">Loading dashboard...</p>`;
    const response = await fetch(`${API_BASE}/orders/admin/dashboard`, { headers: authHeaders() });
    if (!response.ok) throw new Error("Could not load dashboard");
    const data = await response.json();
    content.innerHTML = `
        <div class="mb-8 flex items-end justify-between gap-4">
            <div><p class="text-xs uppercase tracking-[3px] text-coral font-bold">Store overview</p><h1 class="text-3xl font-bold mt-2">Admin Dashboard</h1></div>
            <a href="admin-orders.html" class="border border-dark px-4 py-2.5 text-xs font-bold uppercase">View orders</a>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-6 border-y border-gray-200 bg-white">
            ${[
                ["Orders", data.stats.totalOrders],
                ["Revenue", formatPrice(data.stats.revenue)],
                ["Pending", data.stats.pendingOrders],
                ["Delivered", data.stats.deliveredOrders],
                ["Customers", data.stats.customers],
                ["Products", data.stats.products]
            ].map(([label, value]) => `<div class="p-5 border-r border-gray-100"><p class="text-xs text-gray-500 uppercase">${label}</p><p class="mt-2 text-2xl font-bold">${value}</p></div>`).join("")}
        </div>
        <div class="mt-8 bg-white border border-gray-200 overflow-x-auto">
            <div class="px-5 py-4 border-b border-gray-100 font-bold">Recent orders</div>
            ${data.orders.length ? `<table class="w-full text-sm"><thead class="text-left text-xs uppercase text-gray-500"><tr><th class="px-5 py-3">Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead><tbody>${data.orders.slice(0, 8).map(order => `<tr class="border-t border-gray-100"><td class="px-5 py-4 font-semibold">${escapeHtml(order.orderId)}</td><td>${escapeHtml(order.customer?.fullName)}</td><td>${formatPrice(order.grandTotal)}</td><td>${escapeHtml(order.status)}</td></tr>`).join("")}</tbody></table>` : `<p class="px-5 py-10 text-center text-gray-400">No orders yet.</p>`}
        </div>
    `;
}

async function loadProducts() {
    const user = await protectAdmin();
    if (!user) return;
    renderShell(user, "products");
    const content = document.getElementById("admin-page-content");
    content.innerHTML = `
        <div class="mb-8 flex items-end justify-between gap-4">
            <div><p class="text-xs uppercase tracking-[3px] text-coral font-bold">Catalog</p><h1 class="text-3xl font-bold mt-2">Products</h1></div>
            <button id="new-product" class="bg-coral text-white px-4 py-2.5 text-xs font-bold uppercase">Add product</button>
        </div>
        <div id="product-list" class="bg-white border border-gray-200"></div>
        <div id="product-modal" class="hidden fixed inset-0 z-[200] bg-dark/60 p-4 items-center justify-center">
            <form id="product-form" class="w-full max-w-xl max-h-[90dvh] overflow-y-auto bg-white p-6">
                <div class="flex items-center justify-between border-b border-gray-100 pb-4">
                    <h2 id="product-modal-title" class="text-xl font-bold">Add product</h2>
                    <button type="button" id="close-product-modal" class="text-2xl leading-none text-gray-400" aria-label="Close">&times;</button>
                </div>
                <input type="hidden" id="product-id">
                <div class="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label class="sm:col-span-2 text-xs font-bold uppercase">Product name<input id="product-name" required class="mt-2 w-full border border-gray-300 px-3 py-2.5 text-sm"></label>
                    <label class="text-xs font-bold uppercase">Price<input id="product-price" type="number" min="0" required class="mt-2 w-full border border-gray-300 px-3 py-2.5 text-sm"></label>
                    <label class="text-xs font-bold uppercase">Category<input id="product-category" required class="mt-2 w-full border border-gray-300 px-3 py-2.5 text-sm"></label>
                    <label class="text-xs font-bold uppercase">Gender<select id="product-gender" class="mt-2 w-full border border-gray-300 px-3 py-2.5 text-sm"><option>Men</option><option>Women</option><option>Unisex</option></select></label>
                    <label class="text-xs font-bold uppercase">Badge<input id="product-badge" class="mt-2 w-full border border-gray-300 px-3 py-2.5 text-sm"></label>
                    <label class="sm:col-span-2 text-xs font-bold uppercase">Image URL<input id="product-image" required class="mt-2 w-full border border-gray-300 px-3 py-2.5 text-sm"></label>
                    <label class="sm:col-span-2 text-xs font-bold uppercase">Description<textarea id="product-description" rows="3" class="mt-2 w-full border border-gray-300 px-3 py-2.5 text-sm"></textarea></label>
                    <label class="text-xs font-bold uppercase">Sizes<input id="product-sizes" placeholder="S, M, L, XL" class="mt-2 w-full border border-gray-300 px-3 py-2.5 text-sm"></label>
                    <label class="text-xs font-bold uppercase">Colors<input id="product-colors" placeholder="Black, White" class="mt-2 w-full border border-gray-300 px-3 py-2.5 text-sm"></label>
                    <label class="sm:col-span-2 flex items-center gap-2 text-sm font-semibold"><input id="product-in-stock" type="checkbox" checked> In stock</label>
                </div>
                <button type="submit" id="save-product" class="mt-6 w-full bg-coral text-white py-3 text-xs font-bold uppercase">Save product</button>
            </form>
        </div>
    `;
    const list = document.getElementById("product-list");
    const modal = document.getElementById("product-modal");
    const form = document.getElementById("product-form");
    let productCache = [];
    async function refresh() {
        const response = await fetch(`${API_BASE}/products`);
        const products = await response.json();
        productCache = products;
        list.innerHTML = products.length ? `<div class="divide-y divide-gray-100">${products.map(product => `
            <div class="p-4 flex gap-4 items-center">
                <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" class="w-16 h-16 object-cover bg-gray-100" onerror="this.src='https://placehold.co/96x96/F8F5F0/D85A30?text=TWENTY'">
                <div class="min-w-0 flex-1"><p class="font-bold truncate">${escapeHtml(product.name)}</p><p class="text-xs text-gray-500 mt-1">${escapeHtml(product.category)} · ${escapeHtml(product.gender)}</p></div>
                <p class="font-bold">${formatPrice(product.price)}</p>
                <button data-edit-product="${product._id}" class="border border-gray-300 px-3 py-2 text-xs font-bold">Edit</button>
                <button data-delete-product="${product._id}" class="border border-red-200 text-red-600 px-3 py-2 text-xs font-bold">Delete</button>
            </div>
        `).join("")}</div>` : `<p class="text-gray-400 py-12 text-center">No products yet.</p>`;
    }
    function openProductModal(product = null) {
        form.reset();
        document.getElementById("product-modal-title").textContent = product ? "Edit product" : "Add product";
        document.getElementById("product-id").value = product?._id || "";
        document.getElementById("product-name").value = product?.name || "";
        document.getElementById("product-price").value = product?.price || "";
        document.getElementById("product-category").value = product?.category || "";
        document.getElementById("product-gender").value = product?.gender || "Unisex";
        document.getElementById("product-badge").value = product?.badge || "";
        document.getElementById("product-image").value = product?.image || "";
        document.getElementById("product-description").value = product?.description || "";
        document.getElementById("product-sizes").value = (product?.sizes || []).join(", ");
        document.getElementById("product-colors").value = (product?.colors || []).join(", ");
        document.getElementById("product-in-stock").checked = product ? product.inStock !== false : true;
        modal.classList.remove("hidden");
        modal.classList.add("flex");
        document.getElementById("product-name").focus();
    }
    function closeProductModal() {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
    }
    document.getElementById("new-product").addEventListener("click", () => openProductModal());
    document.getElementById("close-product-modal").addEventListener("click", closeProductModal);
    modal.addEventListener("click", event => {
        if (event.target === modal) closeProductModal();
    });
    form.addEventListener("submit", async event => {
        event.preventDefault();
        const id = document.getElementById("product-id").value;
        const payload = {
            name: document.getElementById("product-name").value.trim(),
            price: Number(document.getElementById("product-price").value),
            category: document.getElementById("product-category").value.trim(),
            gender: document.getElementById("product-gender").value,
            badge: document.getElementById("product-badge").value.trim(),
            image: document.getElementById("product-image").value.trim(),
            description: document.getElementById("product-description").value.trim(),
            sizes: document.getElementById("product-sizes").value.split(",").map(value => value.trim()).filter(Boolean),
            colors: document.getElementById("product-colors").value.split(",").map(value => value.trim()).filter(Boolean),
            inStock: document.getElementById("product-in-stock").checked
        };
        const response = await fetch(`${API_BASE}/products${id ? `/${id}` : ""}`, {
            method: id ? "PATCH" : "POST",
            headers: authHeaders(),
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            alert("Could not save product.");
            return;
        }
        closeProductModal();
        refresh();
    });
    list.addEventListener("click", async event => {
        const editButton = event.target.closest("[data-edit-product]");
        if (editButton) {
            openProductModal(productCache.find(product => product._id === editButton.dataset.editProduct));
            return;
        }
        const deleteButton = event.target.closest("[data-delete-product]");
        if (deleteButton) {
            if (!confirm("Delete this product?")) return;
            const response = await fetch(`${API_BASE}/products/${deleteButton.dataset.deleteProduct}`, { method: "DELETE", headers: authHeaders() });
            if (!response.ok) alert("Could not delete product.");
            refresh();
        }
    });
    refresh();
}

async function loadUsers() {
    const user = await protectAdmin();
    if (!user) return;
    renderShell(user, "users");
    const content = document.getElementById("admin-page-content");
    content.innerHTML = `<div class="mb-8"><p class="text-xs uppercase tracking-[3px] text-coral font-bold">Accounts</p><h1 class="text-3xl font-bold mt-2">Users</h1></div><div id="user-list" class="bg-white border border-gray-200 overflow-x-auto"></div>`;
    const list = document.getElementById("user-list");
    async function refresh() {
        const response = await fetch(`${API_BASE}/auth/admin/users`, { headers: authHeaders() });
        if (!response.ok) return;
        const users = await response.json();
        list.innerHTML = users.length ? `<table class="w-full text-sm"><thead class="text-left text-xs uppercase text-gray-500"><tr><th class="px-5 py-3">User</th><th>Email</th><th>Type</th><th>Action</th></tr></thead><tbody>${users.map(entry => `<tr class="border-t border-gray-100"><td class="px-5 py-4 font-semibold">${escapeHtml(entry.name)}</td><td>${escapeHtml(entry.email)}</td><td><span class="${entry.role === "admin" ? "text-coral" : "text-gray-600"}">${escapeHtml(entry.role)}</span></td><td>${entry.role === "admin" ? '<span class="text-xs text-gray-400">Protected account</span>' : `<button data-delete-user="${entry._id}" class="text-red-600 text-xs font-bold">Delete</button>`}</td></tr>`).join("")}</tbody></table>` : `<p class="text-gray-400 py-12 text-center">No users found.</p>`;
    }
    list.addEventListener("click", async event => {
        const button = event.target.closest("[data-delete-user]");
        if (!button) return;
        if (!confirm("Delete this user?")) return;
        const response = await fetch(`${API_BASE}/auth/admin/users/${button.dataset.deleteUser}`, { method: "DELETE", headers: authHeaders() });
        if (!response.ok) alert("Could not delete user.");
        refresh();
    });
    refresh();
}

async function loadOrders() {
    const user = await protectAdmin();
    if (!user) return;
    renderShell(user, "orders");
    const content = document.getElementById("admin-page-content");
    content.innerHTML = `<div class="mb-8"><p class="text-xs uppercase tracking-[3px] text-coral font-bold">Fulfillment</p><h1 class="text-3xl font-bold mt-2">Orders</h1></div><div id="order-list" class="bg-white border border-gray-200 overflow-x-auto"></div>`;
    const list = document.getElementById("order-list");
    async function refresh() {
        const response = await fetch(`${API_BASE}/orders`);
        const orders = await response.json();
        list.innerHTML = orders.length ? `<table class="w-full text-sm"><thead class="text-left text-xs uppercase text-gray-500"><tr><th class="px-5 py-3">Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead><tbody>${orders.map(order => `<tr class="border-t border-gray-100"><td class="px-5 py-4 font-semibold">${escapeHtml(order.orderId)}</td><td><span class="block font-semibold">${escapeHtml(order.customer?.fullName)}</span><span class="text-xs text-gray-500">${escapeHtml(order.customer?.phone)}</span></td><td>${formatPrice(order.grandTotal)}</td><td><select data-order-status="${order._id}" class="border border-gray-300 px-2 py-1.5">${["Pending","Confirmed","Shipped","Delivered","Cancelled"].map(status => `<option ${order.status === status ? "selected" : ""}>${status}</option>`).join("")}</select></td></tr>`).join("")}</tbody></table>` : `<p class="text-gray-400 py-12 text-center">No orders yet.</p>`;
    }
    list.addEventListener("change", async event => {
        const select = event.target.closest("[data-order-status]");
        if (!select) return;
        await fetch(`${API_BASE}/orders/${select.dataset.orderStatus}/status`, {
            method: "PATCH", headers: authHeaders(), body: JSON.stringify({ status: select.value })
        });
    });
    refresh();
}

async function loadPayments() {
    const user = await protectAdmin();
    if (!user) return;
    renderShell(user, "payments");
    const content = document.getElementById("admin-page-content");
    content.innerHTML = `<div class="mb-8"><p class="text-xs uppercase tracking-[3px] text-coral font-bold">Transactions</p><h1 class="text-3xl font-bold mt-2">Payments</h1></div><div id="payment-list" class="bg-white border border-gray-200 overflow-x-auto"></div>`;
    const response = await fetch(`${API_BASE}/orders/admin/payments`, { headers: authHeaders() });
    const payments = await response.json();
    const list = document.getElementById("payment-list");
    list.innerHTML = payments.length ? `<table class="w-full text-sm"><thead class="text-left text-xs uppercase text-gray-500"><tr><th class="px-5 py-3">Order</th><th>Method</th><th>Reference</th><th>Amount</th><th>Order status</th></tr></thead><tbody>${payments.map(payment => `<tr class="border-t border-gray-100"><td class="px-5 py-4 font-semibold">${escapeHtml(payment.orderId)}</td><td>${escapeHtml(payment.method)}</td><td>${escapeHtml(payment.trxId || "-")}</td><td class="font-bold">${formatPrice(payment.amount)}</td><td>${escapeHtml(payment.status)}</td></tr>`).join("")}</tbody></table>` : `<p class="text-gray-400 py-12 text-center">No payments recorded.</p>`;
}

document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.adminPage;
    if (page === "profile") loadProfile();
    if (page === "dashboard") loadDashboard();
    if (page === "products") loadProducts();
    if (page === "users") loadUsers();
    if (page === "orders") loadOrders();
    if (page === "payments") loadPayments();
});
