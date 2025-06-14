import { auth, database } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  ref,
  set,
  get,
  update,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Get modal elements
const loginModal = document.getElementById("loginModal");
const registerModal = document.getElementById("registerModal");
const forgotPasswordModal = document.getElementById("forgotPasswordModal");

// Get buttons that open modals
const loginBtn = document.querySelector(".login-btn");
const showRegisterBtn = document.getElementById("showRegister");
const showLoginBtn = document.getElementById("showLogin");
const showForgotPasswordBtn = document.getElementById("showForgotPassword");
const backToLoginBtn = document.getElementById("backToLogin");
const logoutBtn = document.getElementById("logoutBtn");

// Get user menu elements
const userMenu = document.querySelector(".user-menu");
const dropdownMenu = document.querySelector(".dropdown-menu");
const userEmail = document.getElementById("userEmail");

// Get close buttons
const closeButtons = document.getElementsByClassName("close");

// Get forms
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const forgotPasswordForm = document.getElementById("forgotPasswordForm");

// Account modal elements
const accountBtn = document.getElementById("accountBtn");
const accountModal = document.getElementById("accountModal");
const closeAccountModal = document.getElementById("closeAccountModal");
const accountForm = document.getElementById("accountForm");
const accountEmail = document.getElementById("accountEmail");
const accountName = document.getElementById("accountName");
const accountPhone = document.getElementById("accountPhone");
const changePasswordBtn = document.getElementById("changePasswordBtn");

// Change password modal elements
const changePasswordModal = document.getElementById("changePasswordModal");
const closeChangePasswordModal = document.getElementById(
  "closeChangePasswordModal"
);
const changePasswordForm = document.getElementById("changePasswordForm");
const currentPassword = document.getElementById("currentPassword");
const newPassword = document.getElementById("newPassword");
const confirmNewPassword = document.getElementById("confirmNewPassword");

// Create toast element
const toast = document.createElement("div");
toast.className = "toast";
document.body.appendChild(toast);

// Show toast notification
function showToast(message, isError = false) {
  toast.textContent = message;
  toast.className = `toast ${isError ? "error" : ""} show`;
  setTimeout(() => {
    toast.className = "toast";
  }, 3000);
}

// Toggle dropdown menu
loginBtn.addEventListener("click", (e) => {
  if (auth.currentUser) {
    e.stopPropagation();
    dropdownMenu.style.display =
      dropdownMenu.style.display === "none" ? "block" : "none";
  } else {
    loginModal.style.display = "block";
  }
});

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  if (!userMenu.contains(e.target)) {
    dropdownMenu.style.display = "none";
  }
});

// Handle logout
logoutBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  signOut(auth)
    .then(() => {
      showToast("Đăng xuất thành công!");
      updateUI(null);
      window.location.href = "index.html";
    })
    .catch((error) => {
      showToast("Lỗi đăng xuất: " + error.message, true);
    });
});

// Update UI based on auth state
function updateUI(user) {
  if (user) {
    // User is signed in
    if (loginBtn) {
      loginBtn.innerHTML = `<i class="fas fa-user"></i> ${user.email}`;
    }
    if (userEmail) {
      userEmail.textContent = user.email;
    }
    if (dropdownMenu) {
      dropdownMenu.style.display = "none";
    }
  } else {
    // User is signed out
    if (loginBtn) {
      loginBtn.innerHTML = '<i class="fas fa-user"></i> Đăng nhập';
    }
    if (dropdownMenu) {
      dropdownMenu.style.display = "none";
    }
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
};

showLoginBtn.onclick = (e) => {
  e.preventDefault();
  registerModal.style.display = "none";
  loginModal.style.display = "block";
};

showForgotPasswordBtn.onclick = (e) => {
  e.preventDefault();
  loginModal.style.display = "none";
  forgotPasswordModal.style.display = "block";
};

backToLoginBtn.onclick = (e) => {
  e.preventDefault();
  forgotPasswordModal.style.display = "none";
  loginModal.style.display = "block";
};

// Close modals when clicking the X
Array.from(closeButtons).forEach((button) => {
  button.onclick = function () {
    loginModal.style.display = "none";
    registerModal.style.display = "none";
    forgotPasswordModal.style.display = "none";
  };
});

// Close modals when clicking outside
window.onclick = function (event) {
  if (event.target == loginModal) {
    loginModal.style.display = "none";
  }
  if (event.target == registerModal) {
    registerModal.style.display = "none";
  }
  if (event.target == forgotPasswordModal) {
    forgotPasswordModal.style.display = "none";
  }
};

// Handle login
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      const userRef = ref(database, "users/" + user.uid);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        if (userData.role == 2) {
          window.location.replace("admin.html"); // dùng replace để không lưu lại trang chủ trong lịch sử
        } else {
          window.location.replace("index.html");
        }
      } else {
        window.location.replace("index.html");
      }
      loginModal.style.display = "none";
      showToast("Đăng nhập thành công!");
    })
    .catch((error) => {
      showToast("Lỗi đăng nhập: " + error.message, true);
    });
});

// Handle registration
registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const name = document.getElementById("registerName").value; // Lấy họ tên

  if (password !== confirmPassword) {
    showToast("Mật khẩu không khớp!", true);
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      // Cập nhật displayName trên Firebase Auth
      updateProfile(user, { displayName: name }).then(() => {
        // Lưu thông tin user vào Realtime Database
        set(ref(database, "users/" + user.uid), {
          email: user.email,
          displayName: name,
          createdAt: new Date().toISOString(),
          role: 1, // role mặc định user là 1
        });
        registerModal.style.display = "none";
        showToast("Đăng ký thành công!");
      });
    })
    .catch((error) => {
      showToast("Lỗi đăng ký: " + error.message, true);
    });
});

// Handle password reset
forgotPasswordForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("resetEmail").value;

  sendPasswordResetEmail(auth, email)
    .then(() => {
      forgotPasswordModal.style.display = "none";
      showToast("Email đặt lại mật khẩu đã được gửi!");
    })
    .catch((error) => {
      showToast("Lỗi gửi email đặt lại mật khẩu: " + error.message, true);
    });
});

// Khi bấm vào 'Tài khoản' thì chuyển hướng sang trang account.html
accountBtn.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = "account.html";
});

// Đóng modal tài khoản
closeAccountModal.onclick = () => {
  accountModal.style.display = "none";
};

// Đóng modal đổi mật khẩu
closeChangePasswordModal.onclick = () => {
  changePasswordModal.style.display = "none";
};

// Đóng modal khi click ngoài
window.addEventListener("click", (event) => {
  if (event.target === accountModal) accountModal.style.display = "none";
  if (event.target === changePasswordModal)
    changePasswordModal.style.display = "none";
});

// Lưu thông tin tài khoản
accountForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;
  try {
    await updateProfile(user, {
      displayName: accountName.value,
    });
    // Lưu thông tin cập nhật vào Realtime Database
    await update(ref(database, "users/" + user.uid), {
      displayName: accountName.value,
      phone: accountPhone.value || "",
    });
    showToast("Cập nhật thông tin thành công!");
    accountModal.style.display = "none";
    updateUI(user);
  } catch (err) {
    showToast("Lỗi cập nhật thông tin: " + err.message, true);
  }
});

// Mở modal đổi mật khẩu
changePasswordBtn.addEventListener("click", () => {
  changePasswordModal.style.display = "block";
});

// Đổi mật khẩu
changePasswordForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;
  if (newPassword.value !== confirmNewPassword.value) {
    showToast("Mật khẩu mới không khớp!", true);
    return;
  }
  // Re-authenticate
  const credential = EmailAuthProvider.credential(
    user.email,
    currentPassword.value
  );
  try {
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword.value);
    showToast("Đổi mật khẩu thành công!");
    changePasswordModal.style.display = "none";
    changePasswordForm.reset();
  } catch (err) {
    showToast("Lỗi đổi mật khẩu: " + err.message, true);
  }
});
