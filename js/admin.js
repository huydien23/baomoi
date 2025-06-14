// js/admin.js
// Xử lý logic duyệt bài cho admin

// Import Firebase
import { auth, database } from "./firebase-config.js";
import {
  get,
  ref,
  update,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Kiểm tra quyền admin khi truy cập trang
function checkAdmin() {
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      alert("Vui lòng đăng nhập với tài khoản admin!");
      window.location.href = "index.html";
      return;
    }

    try {
      // Kiểm tra role từ database
      const userRef = ref(database, "users/" + user.uid);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        console.log("User data:", userData);

        // Kiểm tra role
        if (userData.role == 2) {
          console.log("Access granted - loading posts");
          loadPendingPosts();
        } else {
          alert("Bạn không có quyền truy cập trang Admin");
          window.location.href = "index.html";
        }
      } else {
        alert("Không tìm thấy thông tin người dùng!");
        window.location.href = "index.html";
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Lỗi: " + error.message);
      window.location.href = "index.html";
    }
  });
}

// Lấy danh sách bài viết chờ duyệt
function loadPendingPosts() {
  console.log("DEBUG: loadPendingPosts called");

  // Test đơn giản - chỉ hiển thị thông báo
  const tableBody = document.getElementById("pendingPostsTableBody");
  if (!tableBody) {
    console.error("Không tìm thấy element pendingPostsTableBody");
    return;
  }

  tableBody.innerHTML = '<tr><td colspan="5">Đang tải dữ liệu...</td></tr>';

  // Thử đọc posts từ database
  const postsRef = ref(database, "posts");
  console.log("DEBUG: Trying to read posts...");

  get(postsRef)
    .then((snapshot) => {
      console.log("DEBUG: Posts data received:", snapshot.exists());
      if (snapshot.exists()) {
        const posts = snapshot.val();
        console.log("DEBUG: Posts data:", posts);
        renderPendingPosts(posts);
      } else {
        console.log("DEBUG: No posts found");
        tableBody.innerHTML =
          '<tr><td colspan="5">Không có bài viết nào.</td></tr>';
      }
    })
    .catch((error) => {
      console.error("Lỗi tải bài viết:", error);
      tableBody.innerHTML =
        '<tr><td colspan="5">Lỗi tải dữ liệu: ' + error.message + "</td></tr>";
    });
}

// Hiển thị danh sách bài viết chờ duyệt lên bảng
function renderPendingPosts(posts) {
  const tableBody = document.getElementById("pendingPostsTableBody");
  tableBody.innerHTML = "";
  if (!posts) {
    tableBody.innerHTML =
      '<tr><td colspan="5">Không có bài viết chờ duyệt.</td></tr>';
    return;
  }
  Object.entries(posts).forEach(([id, post], idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${idx + 1}</td>
            <td>${post.title || ""}</td>
            <td>${post.author || ""}</td>
            <td>${post.category || ""}</td>
            <td><button class="approve-btn" data-id="${id}">Duyệt</button></td>
        `;
    tableBody.appendChild(tr);
  });
  // Gán sự kiện cho nút duyệt
  document.querySelectorAll(".approve-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      approvePost(this.dataset.id);
    });
  });
}

// Duyệt bài viết (chuyển status sang 'approved')
function approvePost(postId) {
  if (!confirm("Bạn chắc chắn muốn duyệt bài này?")) return;
  const postRef = ref(database, "posts/" + postId);
  update(postRef, { status: "approved" })
    .then(() => {
      alert("Duyệt bài thành công!");
      loadPendingPosts();
    })
    .catch((err) => {
      alert("Lỗi: " + err.message);
    });
}

// Khởi động kiểm tra admin khi load trang
window.addEventListener("DOMContentLoaded", checkAdmin);
