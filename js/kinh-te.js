// kinh-te.js
// Xử lý hiển thị dữ liệu cho trang Kinh tế

import { ThemeManager } from "./theme.js";
import { auth } from "./firebase-config.js";
import { fetchNewsFromRSS } from "./news-api.js";
import { saveToHistory } from "./history.js";

// Khởi tạo theme
document.addEventListener("DOMContentLoaded", function () {
  ThemeManager.init();
  loadCategoryNews();
  setupAuthUI();
});

// Khởi tạo UI xác thực
function setupAuthUI() {
  const authButtons = document.getElementById("authButtons");
  const userMenu = document.getElementById("userMenu");
  const userEmail = document.getElementById("userEmail");

  auth.onAuthStateChanged(function (user) {
    if (user) {
      authButtons.style.display = "none";
      userMenu.style.display = "block";
      userEmail.textContent = user.email;
    } else {
      authButtons.style.display = "flex";
      userMenu.style.display = "none";
    }
  });

  // Xử lý đóng/mở dropdown
  const userMenuBtn = document.getElementById("userMenuBtn");
  const userDropdown = document.getElementById("userDropdown");

  if (userMenuBtn) {
    userMenuBtn.addEventListener("click", function () {
      userDropdown.classList.toggle("show");
    });
  }

  // Đóng dropdown khi click ra ngoài
  window.addEventListener("click", function (event) {
    if (
      !event.target.matches(".user-menu-btn") &&
      !event.target.matches(".user-menu-btn *")
    ) {
      if (userDropdown.classList.contains("show")) {
        userDropdown.classList.remove("show");
      }
    }
  });

  // Xử lý đăng xuất
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      auth.signOut();
    });
  }
}

// Hàm tạo HTML cho một tin tức
function createNewsItem(news) {
  const newsItemHtml = `
        <article class="news-card">
            <a href="${
              news.link
            }" target="_blank" onclick="saveArticleToHistory(event, this)">
                <div class="news-image">
                    <img src="${
                      news.imageUrl || "img/default-news.png"
                    }" alt="${news.title}">
                </div>
                <div class="news-content">
                    <h3>${news.title}</h3>
                    <p>${news.description || ""}</p>
                    <span class="news-time">${formatDate(news.pubDate)}</span>
                </div>
            </a>
        </article>
    `;
  return newsItemHtml;
}

// Hàm định dạng ngày
function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 60) {
    return `${diffMins} phút trước`;
  } else if (diffMins < 1440) {
    return `${Math.floor(diffMins / 60)} giờ trước`;
  } else {
    return `${Math.floor(diffMins / 1440)} ngày trước`;
  }
}

// Lưu bài đọc vào lịch sử
window.saveArticleToHistory = function (event, link) {
  // Chỉ lưu lịch sử nếu người dùng đã đăng nhập
  if (auth.currentUser) {
    const article = {
      title: link.querySelector("h3").textContent,
      description: link.querySelector("p").textContent,
      link: link.href,
      imageUrl: link.querySelector("img").src,
      pubDate: new Date().toISOString(),
    };

    saveToHistory(article);
  }
};

// Tải tin tức theo danh mục
async function loadCategoryNews() {
  try {
    console.log("Đang tải tin tức trang Kinh tế...");

    // Tải tin tức chính chuyên mục Kinh tế
    const kinhTeNews = await fetchNewsFromRSS("kinh-te", 10);
    console.log("Tin kinh tế:", kinhTeNews);
    displayCategoryNews(".kinh-te-main .category-news-list", kinhTeNews);

    // Tải tin tức chuyên mục khác với số lượng ít hơn
    const thoiSuNews = await fetchNewsFromRSS("thoi-su", 3);
    displayCategoryNews(".thoi-su-news .category-news-list", thoiSuNews);

    const phapLuatNews = await fetchNewsFromRSS("phap-luat", 3);
    displayCategoryNews(".phap-luat-news .category-news-list", phapLuatNews);

    const theThaoNews = await fetchNewsFromRSS("the-thao", 3);
    displayCategoryNews(".the-thao-news .category-news-list", theThaoNews);

    const giaiTriNews = await fetchNewsFromRSS("giai-tri", 3);
    displayCategoryNews(".giai-tri-news .category-news-list", giaiTriNews);

    const giaoDucNews = await fetchNewsFromRSS("giao-duc", 3);
    displayCategoryNews(".giao-duc-news .category-news-list", giaoDucNews);

    const yTeNews = await fetchNewsFromRSS("y-te", 3);
    displayCategoryNews(".y-te-news .category-news-list", yTeNews);
  } catch (error) {
    console.error("Lỗi khi tải tin tức:", error);
  }
}

// Hiển thị tin tức theo danh mục
function displayCategoryNews(selector, newsItems) {
  const container = document.querySelector(selector);
  if (!container) return;

  // Xóa tin mẫu, giữ lại tiêu đề danh mục
  const categoryTitle = container.querySelector(".category-title");
  container.innerHTML = "";
  if (categoryTitle) {
    container.appendChild(categoryTitle);
  }

  // Thêm các tin mới
  if (newsItems && newsItems.length > 0) {
    newsItems.forEach((news) => {
      const newsHtml = createNewsItem(news);
      container.insertAdjacentHTML("beforeend", newsHtml);
    });
  } else {
    container.insertAdjacentHTML(
      "beforeend",
      '<p class="no-news">Không có tin tức mới</p>'
    );
  }
}
