import { auth } from './firebase-config.js';
import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Get modal elements
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const forgotPasswordModal = document.getElementById('forgotPasswordModal');

// Get buttons that open modals
const loginBtn = document.querySelector('.login-btn');
const showRegisterBtn = document.getElementById('showRegister');
const showLoginBtn = document.getElementById('showLogin');
const showForgotPasswordBtn = document.getElementById('showForgotPassword');
const backToLoginBtn = document.getElementById('backToLogin');
const logoutBtn = document.getElementById('logoutBtn');

// Get user menu elements
const userMenu = document.querySelector('.user-menu');
const dropdownMenu = document.querySelector('.dropdown-menu');
const userEmail = document.getElementById('userEmail');

// Get close buttons
const closeButtons = document.getElementsByClassName('close');

// Get forms
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');

// Create toast element
const toast = document.createElement('div');
toast.className = 'toast';
document.body.appendChild(toast);

// Show toast notification
function showToast(message, isError = false) {
    toast.textContent = message;
    toast.className = `toast ${isError ? 'error' : ''} show`;
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}

// Toggle dropdown menu
loginBtn.addEventListener('click', (e) => {
    if (auth.currentUser) {
        e.stopPropagation();
        dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
    } else {
        loginModal.style.display = "block";
    }
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target)) {
        dropdownMenu.style.display = 'none';
    }
});

// Handle logout
logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    signOut(auth).then(() => {
        showToast('Đăng xuất thành công!');
        updateUI(null);
    }).catch((error) => {
        showToast('Lỗi đăng xuất: ' + error.message, true);
    });
});

// Update UI based on auth state
function updateUI(user) {
    if (user) {
        // User is signed in
        loginBtn.innerHTML = `<i class="fas fa-user"></i> ${user.email}`;
        userEmail.textContent = user.email;
        dropdownMenu.style.display = 'none';
    } else {
        // User is signed out
        loginBtn.innerHTML = '<i class="fas fa-user"></i> Đăng nhập';
        dropdownMenu.style.display = 'none';
    }
}

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
    updateUI(user);
});

// Open modals
showRegisterBtn.onclick = (e) => {
    e.preventDefault();
    loginModal.style.display = "none";
    registerModal.style.display = "block";
}

showLoginBtn.onclick = (e) => {
    e.preventDefault();
    registerModal.style.display = "none";
    loginModal.style.display = "block";
}

showForgotPasswordBtn.onclick = (e) => {
    e.preventDefault();
    loginModal.style.display = "none";
    forgotPasswordModal.style.display = "block";
}

backToLoginBtn.onclick = (e) => {
    e.preventDefault();
    forgotPasswordModal.style.display = "none";
    loginModal.style.display = "block";
}

// Close modals when clicking the X
Array.from(closeButtons).forEach(button => {
    button.onclick = function() {
        loginModal.style.display = "none";
        registerModal.style.display = "none";
        forgotPasswordModal.style.display = "none";
    }
});

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target == loginModal) {
        loginModal.style.display = "none";
    }
    if (event.target == registerModal) {
        registerModal.style.display = "none";
    }
    if (event.target == forgotPasswordModal) {
        forgotPasswordModal.style.display = "none";
    }
}

// Handle login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Login successful
            loginModal.style.display = "none";
            showToast('Đăng nhập thành công!');
        })
        .catch((error) => {
            showToast('Lỗi đăng nhập: ' + error.message, true);
        });
});

// Handle registration
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        showToast('Mật khẩu không khớp!', true);
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Registration successful
            registerModal.style.display = "none";
            showToast('Đăng ký thành công!');
        })
        .catch((error) => {
            showToast('Lỗi đăng ký: ' + error.message, true);
        });
});

// Handle password reset
forgotPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('resetEmail').value;

    sendPasswordResetEmail(auth, email)
        .then(() => {
            forgotPasswordModal.style.display = "none";
            showToast('Email đặt lại mật khẩu đã được gửi!');
        })
        .catch((error) => {
            showToast('Lỗi gửi email đặt lại mật khẩu: ' + error.message, true);
        });
}); 