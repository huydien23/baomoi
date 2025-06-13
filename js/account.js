import { auth } from './firebase-config.js';
import { 
    signOut, 
    onAuthStateChanged, 
    updateProfile,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Theme switcher functionality
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);
themeToggle.checked = savedTheme === 'dark';

// Theme toggle handler
themeToggle.addEventListener('change', () => {
    const newTheme = themeToggle.checked ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Modal functionality
const editNameModal = document.getElementById('editNameModal');
const editPasswordModal = document.getElementById('editPasswordModal');
const closeButtons = document.querySelectorAll('.close, .close-modal');

// Hàm hiển thị modal
function showModal(modal) {
    modal.style.display = 'block';
}

// Hàm ẩn modal
function hideModal(modal) {
    modal.style.display = 'none';
}

// Xử lý đóng modal
closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modal = button.closest('.modal');
        hideModal(modal);
    });
});

// Đóng modal khi click bên ngoài
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        hideModal(event.target);
    }
});

// Xử lý thay đổi họ tên
document.getElementById('editNameBtn').addEventListener('click', () => {
    const newNameInput = document.getElementById('newName');
    newNameInput.value = auth.currentUser.displayName || '';
    showModal(editNameModal);
});

document.getElementById('editNameForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newName = document.getElementById('newName').value.trim();
    
    if (newName) {
        try {
            await updateProfile(auth.currentUser, {
                displayName: newName
            });
            // Cập nhật hiển thị
            document.getElementById('displayName').textContent = newName;
            document.getElementById('displayNameHeader').textContent = newName;
            hideModal(editNameModal);
            alert('Cập nhật họ tên thành công!');
        } catch (error) {
            alert('Có lỗi xảy ra khi cập nhật họ tên: ' + error.message);
        }
    }
});

// Xử lý thay đổi mật khẩu
document.getElementById('editPasswordBtn').addEventListener('click', () => {
    document.getElementById('editPasswordForm').reset();
    showModal(editPasswordModal);
});

document.getElementById('editPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        alert('Mật khẩu xác nhận không khớp!');
        return;
    }

    try {
        // Xác thực lại người dùng
        const credential = EmailAuthProvider.credential(
            auth.currentUser.email,
            currentPassword
        );
        await reauthenticateWithCredential(auth.currentUser, credential);
        
        // Cập nhật mật khẩu
        await updatePassword(auth.currentUser, newPassword);
        hideModal(editPasswordModal);
        alert('Cập nhật mật khẩu thành công!');
    } catch (error) {
        alert('Có lỗi xảy ra khi cập nhật mật khẩu: ' + error.message);
    }
});

// Xử lý đăng xuất
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        alert('Có lỗi xảy ra khi đăng xuất: ' + error.message);
    }
});

// Hiển thị thông tin user nếu đã đăng nhập
onAuthStateChanged(auth, user => {
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    // Update all user information displays
    const userEmail = user.email;
    const displayName = user.displayName || 'Chưa có dữ liệu';
    
    document.getElementById('userEmail').textContent = userEmail;
    document.getElementById('userEmailHeader').textContent = userEmail;
    document.getElementById('displayName').textContent = displayName;
    document.getElementById('displayNameHeader').textContent = displayName;

    // Set avatar text if no profile picture
    if (user.displayName) {
        const initials = user.displayName
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase();
        document.getElementById('profileAvatar').innerHTML = initials;
    }
}); 