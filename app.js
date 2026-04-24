// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyB5duUDZTcu6eXJg8kB3Ciew2im4TMPc7Y",
    authDomain: "trust-corp.firebaseapp.com",
    databaseURL: "https://trust-corp-default-rtdb.firebaseio.com",
    projectId: "trust-corp",
    storageBucket: "trust-corp.firebasestorage.app",
    messagingSenderId: "364233006581",
    appId: "1:364233006581:web:fe030429cd5c7814a8d4bc"
};

// Initialize Firebase ONLY ONCE
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Global references (available to all pages)
const auth = firebase.auth();
const database = firebase.database();

// Helper: Get current user
function getCurrentUser() {
    return auth.currentUser;
}

// Helper: Check if logged in
function isLoggedIn() {
    return auth.currentUser !== null;
}

// Helper: Get user role based on email
function getUserRole(email) {
    if (email === 'desupremelaundry@gmail.com') {
        return 'owner';
    }
    return 'staff';
}

// Helper: Redirect to login if not authenticated
function requireAuth() {
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'index.html';
        }
    });
}

// Helper: Check if current user can access finance page
function canAccessFinance() {
    const user = auth.currentUser;
    if (!user) return false;
    return user.email === 'desupremelaundry@gmail.com';
}

// Helper: Redirect based on user role after login
function routeUser(email) {
    console.log('Routing user:', email);
    const role = getUserRole(email);
    
    if (role === 'owner') {
        window.location.href = 'finance.html';
    } else {
        window.location.href = 'adminTransEntry.html';
    }
}

// Helper: Show toast message
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    if (!toast) {
        console.log('Toast:', message);
        return;
    }
    toast.textContent = message;
    toast.style.background = isError ? '#e74c3c' : '#2ecc71';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Helper: Get current user email display
function getCurrentUserEmail() {
    const user = auth.currentUser;
    return user ? user.email : 'Guest';
}