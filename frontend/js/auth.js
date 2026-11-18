/* ==========================================
   TWENTY — REAL GMAIL OTP AUTH & MEMBER DASHBOARD
========================================== */

const API_BASE = "http://localhost:5000/api/auth";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "twenty@2026";

// 1. MOBILE MENU & CART COUNT
document.getElementById("menu-toggle")?.addEventListener("click", () => {
    document.getElementById("mobile-menu")?.classList.toggle("hidden");
});

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("twentyCart")) || [];
    const total = cart.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
    const badge = document.getElementById("cart-count");
    if (badge) {
        badge.textContent = total;
        badge.classList.toggle("hidden", total === 0);
    }
    return total;
}

// 2. ALERT HELPER
function showAuthAlert(message, isError = false) {
    const alertBox = document.getElementById("auth-alert");
    if (!alertBox) return;
    alertBox.textContent = message;
    alertBox.className = isError
        ? "bg-red-50 text-red-700 border border-red-200 text-xs py-3 px-4 mb-5 font-medium"
        : "bg-green-50 text-green-700 border border-green-200 text-xs py-3 px-4 mb-5 font-medium";
    alertBox.classList.remove("hidden");
}

function hideAuthAlert() {
    document.getElementById("auth-alert")?.classList.add("hidden");
}

// 3. TAB & VIEW SWITCHING
const signinForm = document.getElementById("signin-form");
const signupForm = document.getElementById("signup-form");
const forgotForm = document.getElementById("forgot-form");
const tabSignin = document.getElementById("tab-signin");
const tabSignup = document.getElementById("tab-signup");
const authTabs = document.getElementById("auth-tabs");
const authHeading = document.getElementById("auth-heading");

function switchToSignin() {
    hideAuthAlert();
    authTabs.classList.remove("hidden");
    signinForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
    forgotForm.classList.add("hidden");
    authHeading.innerHTML = 'Sign In<span class="text-coral">.</span>';

    tabSignin.className = "py-3 border-b-2 border-coral text-coral transition";
    tabSignup.className = "py-3 border-b-2 border-transparent text-gray-400 hover:text-dark transition";
}

function switchToSignup() {
    hideAuthAlert();
    authTabs.classList.remove("hidden");
    signupForm.classList.remove("hidden");
    signinForm.classList.add("hidden");
    forgotForm.classList.add("hidden");
    authHeading.innerHTML = 'Create Account<span class="text-coral">.</span>';

    tabSignup.className = "py-3 border-b-2 border-coral text-coral transition";
    tabSignin.className = "py-3 border-b-2 border-transparent text-gray-400 hover:text-dark transition";
}

function switchToForgot() {
    hideAuthAlert();
    authTabs.classList.add("hidden");
    signinForm.classList.add("hidden");
    signupForm.classList.add("hidden");
    forgotForm.classList.remove("hidden");
    authHeading.innerHTML = 'Reset Password<span class="text-coral">.</span>';
}

tabSignin.addEventListener("click", switchToSignin);
tabSignup.addEventListener("click", switchToSignup);
document.getElementById("open-forgot-btn").addEventListener("click", switchToForgot);
document.getElementById("back-to-signin-btn").addEventListener("click", switchToSignin);

// 4. BANGLADESH REGIONS & DISTRICTS + MEMBER DASHBOARD
const BD_LOCATIONS = {
    "Dhaka": [
        "Dhaka", "Faridpur", "Gazipur", "Gopalganj", "Kishoreganj",
        "Madaripur", "Manikganj", "Munshiganj", "Narayanganj",
        "Narsingdi", "Rajbari", "Shariatpur", "Tangail"
    ],
    "Chattogram": [
        "Bandarban", "Brahmanbaria", "Chandpur", "Chattogram", "Cumilla",
        "Cox's Bazar", "Feni", "Khagrachhari", "Lakshmipur", "Noakhali", "Rangamati"
    ],
    "Rajshahi": [
        "Bogura", "Chapainawabganj", "Joypurhat", "Naogaon",
        "Natore", "Pabna", "Rajshahi", "Sirajganj"
    ],
    "Khulna": [
        "Bagerhat", "Chuadanga", "Jashore", "Jhenaidah", "Khulna",
        "Kushtia", "Magura", "Meherpur", "Narail", "Satkhira"
    ],
    "Barishal": [
        "Barguna", "Barishal", "Bhola", "Jhalokathi", "Patuakhali", "Pirojpur"
    ],
    "Sylhet": [
        "Habiganj", "Moulvibazar", "Sunamganj", "Sylhet"
    ],
    "Rangpur": [
        "Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat",
        "Nilphamari", "Panchagarh", "Rangpur", "Thakurgaon"
    ],
    "Mymensingh": [
        "Jamalpur", "Mymensingh", "Netrokona", "Sherpur"
    ]
};

function populateDistrictOptions(region, selectedDistrict = "") {
    const districtSelect = document.getElementById("edit-district");
    if (!districtSelect) return;

    const districts = BD_LOCATIONS[region] || [];
    if (districts.length === 0) {
        districtSelect.innerHTML = '<option value="">Select Region First</option>';
        districtSelect.disabled = true;
        districtSelect.classList.add("bg-gray-50");
        districtSelect.classList.remove("bg-white");
        return;
    }

    districtSelect.disabled = false;
    districtSelect.classList.remove("bg-gray-50");
    districtSelect.classList.add("bg-white");
    districtSelect.innerHTML = '<option value="">Select District</option>' +
        districts.map(d => `<option value="${d}" ${d === selectedDistrict ? "selected" : ""}>${d}</option>`).join("");
}

document.getElementById("edit-region")?.addEventListener("change", (e) => {
    populateDistrictOptions(e.target.value);
});

function renderAccountState() {
    const currentUser = JSON.parse(localStorage.getItem("twentyCurrentUser"));
    const profileView = document.getElementById("profile-view");
    const authView = document.getElementById("auth-view");

    if (currentUser && currentUser.email) {
        authView.classList.add("hidden");
        profileView.classList.remove("hidden");

        const displayName = currentUser.name || "Member";
        document.getElementById("profile-avatar").textContent = displayName.charAt(0).toUpperCase();
        document.getElementById("profile-name").textContent = displayName;
        document.getElementById("profile-email").textContent = currentUser.email;

        // Populate Editable Delivery Profile Fields
        document.getElementById("edit-name").value = currentUser.name || "";
        document.getElementById("edit-email").value = currentUser.email || "";
        document.getElementById("edit-phone").value = currentUser.phone || "";

        const savedRegion = currentUser.region || "";
        const savedDistrict = currentUser.district || currentUser.city || "";
        document.getElementById("edit-region").value = savedRegion;
        populateDistrictOptions(savedRegion, savedDistrict);

        document.getElementById("edit-address").value = currentUser.address || "";

        // Compute Member Order Stats & Recent Orders
        const allOrders = JSON.parse(localStorage.getItem("twentyOrders")) || [];
        const userEmail = currentUser.email.toLowerCase();
        const myOrders = allOrders.filter(o =>
            (o.customer?.email || o.email || "").toLowerCase() === userEmail
        );

        const totalSpent = myOrders.reduce((sum, o) => sum + Number(o.total || o.totalAmount || 0), 0);
        const cartQty = updateCartCount();

        document.getElementById("stat-orders").textContent = myOrders.length;
        document.getElementById("stat-spent").textContent = "৳" + totalSpent.toLocaleString("en-BD");
        document.getElementById("stat-cart").textContent = cartQty;

        // Render Recent Orders List (up to 3)
        const recentContainer = document.getElementById("profile-recent-orders");
        if (myOrders.length === 0) {
            recentContainer.innerHTML = `
                <div class="text-center py-5 text-gray-400">
                    <p>No orders placed with this Gmail yet.</p>
                    <a href="shop.html" class="inline-block mt-2 text-coral font-bold underline">Start Shopping</a>
                </div>
            `;
        } else {
            recentContainer.innerHTML = myOrders.slice(0, 3).map(order => {
                const oid = order.orderId || order.id || "ORD";
                const status = order.status || "Pending";
                const total = Number(order.total || order.totalAmount || 0).toLocaleString("en-BD");
                const dateStr = order.date || new Date(order.createdAt || Date.now()).toLocaleDateString("en-GB");

                let badgeStyle = "bg-yellow-50 text-yellow-700 border-yellow-200";
                if (status === "Confirmed") badgeStyle = "bg-blue-50 text-blue-700 border-blue-200";
                if (status === "Shipped") badgeStyle = "bg-purple-50 text-purple-700 border-purple-200";
                if (status === "Delivered") badgeStyle = "bg-green-50 text-green-700 border-green-200";
                if (status === "Cancelled") badgeStyle = "bg-red-50 text-red-700 border-red-200";

                return `
                    <div class="border border-gray-100 bg-cream/60 p-3 flex items-center justify-between gap-2">
                        <div>
                            <p class="font-bold text-dark">#${oid}</p>
                            <p class="text-[11px] text-gray-500 mt-0.5">${dateStr} · ৳${total}</p>
                        </div>
                        <span class="border px-2 py-0.5 text-[10px] font-bold uppercase ${badgeStyle}">
                            ${status}
                        </span>
                    </div>
                `;
            }).join("");
        }
    } else {
        profileView.classList.add("hidden");
        authView.classList.remove("hidden");
    }
}

// Save Updated Delivery Profile Info
document.getElementById("profile-details-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const currentUser = JSON.parse(localStorage.getItem("twentyCurrentUser")) || {};

    currentUser.name = document.getElementById("edit-name").value.trim();
    currentUser.phone = document.getElementById("edit-phone").value.trim();
    currentUser.region = document.getElementById("edit-region").value;
    currentUser.district = document.getElementById("edit-district").value;
    currentUser.city = currentUser.district;
    currentUser.address = document.getElementById("edit-address").value.trim();

    localStorage.setItem("twentyCurrentUser", JSON.stringify(currentUser));
    renderAccountState();

    const saveMsg = document.getElementById("profile-save-msg");
    saveMsg.classList.remove("hidden");
    setTimeout(() => saveMsg.classList.add("hidden"), 2500);
});

document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("twentyCurrentUser");
    localStorage.removeItem("twentyAuthToken");
    renderAccountState();
});

// 5. CREATE ACCOUNT: STEP 1 — SEND OTP TO GMAIL
signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAuthAlert();

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;
    const sendBtn = document.getElementById("send-signup-otp-btn");

    sendBtn.disabled = true;
    sendBtn.textContent = "SENDING CODE TO GMAIL...";

    try {
        const res = await fetch(`${API_BASE}/send-register-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();

        if (!res.ok) {
            showAuthAlert(data.message || "Could not send code.", true);
        } else {
            showAuthAlert(data.message || "Verification code sent to your Gmail!");
            document.getElementById("signup-otp-box").classList.remove("hidden");
            sendBtn.textContent = "RESEND VERIFICATION CODE";
        }
    } catch (err) {
        showAuthAlert("Cannot connect to server. Make sure backend is running on port 5000.", true);
    } finally {
        sendBtn.disabled = false;
    }
});

// 6. CREATE ACCOUNT: STEP 2 — VERIFY OTP & SAVE TO MONGODB
document.getElementById("verify-signup-btn").addEventListener("click", async () => {
    hideAuthAlert();
    const email = document.getElementById("signup-email").value.trim();
    const otp = document.getElementById("signup-otp").value.trim();
    const verifyBtn = document.getElementById("verify-signup-btn");

    if (otp.length !== 6) {
        showAuthAlert("Please enter the 6-digit code from your Gmail.", true);
        return;
    }

    verifyBtn.disabled = true;
    verifyBtn.textContent = "VERIFYING...";

    try {
        const res = await fetch(`${API_BASE}/verify-register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp })
        });
        const data = await res.json();

        if (!res.ok) {
            showAuthAlert(data.message || "Invalid verification code.", true);
        } else {
            localStorage.setItem("twentyAuthToken", data.token);
            localStorage.setItem("twentyCurrentUser", JSON.stringify(data.user));
            renderAccountState();
        }
    } catch (err) {
        showAuthAlert("Server connection error during verification.", true);
    } finally {
        verifyBtn.disabled = false;
        verifyBtn.textContent = "VERIFY & CREATE ACCOUNT →";
    }
});

// 7. SIGN IN (ADMIN OR MONGODB USER)
signinForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAuthAlert();

    const emailOrUser = document.getElementById("signin-email").value.trim();
    const password = document.getElementById("signin-password").value.trim();
    const btn = document.getElementById("signin-submit-btn");

    if (
        (emailOrUser.toLowerCase() === ADMIN_USERNAME || emailOrUser.toLowerCase() === "admin@twenty.com") &&
        password === ADMIN_PASSWORD
    ) {
        sessionStorage.setItem("twentyAdminLoggedIn", "true");
        localStorage.setItem("twentyAdminLoggedIn", "true");
        window.location.href = "admin.html";
        return;
    }

    btn.disabled = true;
    btn.textContent = "SIGNING IN...";

    try {
        const res = await fetch(`${API_BASE}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailOrUser, password })
        });
        const data = await res.json();

        if (!res.ok) {
            showAuthAlert(data.message || "Invalid Gmail or password.", true);
        } else {
            const existing = JSON.parse(localStorage.getItem("twentyCurrentUser")) || {};
            localStorage.setItem("twentyAuthToken", data.token);
            localStorage.setItem("twentyCurrentUser", JSON.stringify({ ...existing, ...data.user }));
            renderAccountState();
        }
    } catch (err) {
        showAuthAlert("Cannot connect to server. Make sure backend is running on port 5000.", true);
    } finally {
        btn.disabled = false;
        btn.textContent = "SIGN IN →";
    }
});

// 8. FORGOT PASSWORD: STEP 1 — SEND RESET CODE TO GMAIL
forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAuthAlert();

    const email = document.getElementById("forgot-email").value.trim();
    const sendBtn = document.getElementById("send-forgot-otp-btn");

    sendBtn.disabled = true;
    sendBtn.textContent = "SENDING RESET CODE...";

    try {
        const res = await fetch(`${API_BASE}/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });
        const data = await res.json();

        if (!res.ok) {
            showAuthAlert(data.message || "Could not send reset code.", true);
        } else {
            showAuthAlert(data.message || "Reset code sent to your Gmail!");
            document.getElementById("forgot-reset-box").classList.remove("hidden");
            sendBtn.textContent = "RESEND RESET CODE";
        }
    } catch (err) {
        showAuthAlert("Cannot connect to server.", true);
    } finally {
        sendBtn.disabled = false;
    }
});

// 9. FORGOT PASSWORD: STEP 2 — VERIFY CODE & SET NEW PASSWORD
document.getElementById("confirm-reset-btn").addEventListener("click", async () => {
    hideAuthAlert();
    const email = document.getElementById("forgot-email").value.trim();
    const otp = document.getElementById("forgot-otp").value.trim();
    const newPassword = document.getElementById("forgot-new-password").value;
    const confirmBtn = document.getElementById("confirm-reset-btn");

    if (otp.length !== 6 || newPassword.length < 6) {
        showAuthAlert("Enter the 6-digit code and a new password (min 6 characters).", true);
        return;
    }

    confirmBtn.disabled = true;
    confirmBtn.textContent = "UPDATING PASSWORD...";

    try {
        const res = await fetch(`${API_BASE}/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp, newPassword })
        });
        const data = await res.json();

        if (!res.ok) {
            showAuthAlert(data.message || "Failed to reset password.", true);
        } else {
            document.getElementById("forgot-reset-box").classList.add("hidden");
            forgotForm.reset();
            switchToSignin();
            showAuthAlert(data.message || "Password updated! Please sign in.");
        }
    } catch (err) {
        showAuthAlert("Server error while resetting password.", true);
    } finally {
        confirmBtn.disabled = false;
        confirmBtn.textContent = "RESET PASSWORD →";
    }
});

// 10. INITIALIZE
document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    renderAccountState();
});