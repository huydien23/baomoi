// js/admin.js
// Xử lý logic duyệt bài cho admin

// Import Firebase
import { db, auth } from './firebase-config.js';

// Kiểm tra quyền admin khi truy cập trang
function checkAdmin() {
    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            alert('Vui lòng đăng nhập với tài khoản admin!');
            window.location.href = 'index.html';
            return;
        }
        const token = await user.getIdTokenResult();
        if (!token.claims.admin) {
            alert('Bạn không có quyền truy cập trang này!');
            window.location.href = 'index.html';
        } else {
            loadPendingPosts();
        }
    });
}

// Lấy danh sách bài viết chờ duyệt
function loadPendingPosts() {
    const postsRef = db.ref('posts');
    postsRef.orderByChild('status').equalTo('pending').once('value', (snapshot) => {
        const posts = snapshot.val();
        renderPendingPosts(posts);
    });
}

// Hiển thị danh sách bài viết chờ duyệt lên bảng
function renderPendingPosts(posts) {
    const tableBody = document.getElementById('pendingPostsTableBody');
    tableBody.innerHTML = '';
    if (!posts) {
        tableBody.innerHTML = '<tr><td colspan="5">Không có bài viết chờ duyệt.</td></tr>';
        return;
    }
    Object.entries(posts).forEach(([id, post], idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td>${post.title || ''}</td>
            <td>${post.author || ''}</td>
            <td>${post.category || ''}</td>
            <td><button class="approve-btn" data-id="${id}">Duyệt</button></td>
        `;
        tableBody.appendChild(tr);
    });
    // Gán sự kiện cho nút duyệt
    document.querySelectorAll('.approve-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            approvePost(this.dataset.id);
        });
    });
}

// Duyệt bài viết (chuyển status sang 'approved')
function approvePost(postId) {
    if (!confirm('Bạn chắc chắn muốn duyệt bài này?')) return;
    db.ref('posts/' + postId).update({ status: 'approved' })
        .then(() => {
            alert('Duyệt bài thành công!');
            loadPendingPosts();
        })
        .catch(err => {
            alert('Lỗi: ' + err.message);
        });
}

// Khởi động kiểm tra admin khi load trang
window.addEventListener('DOMContentLoaded', checkAdmin);
