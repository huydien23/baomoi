/**
 * active-nav.js - Thêm hiệu ứng gạch chân cho mục đang được truy cập trong thanh navigation
 */

document.addEventListener("DOMContentLoaded", function () {
  // Lấy đường dẫn trang hiện tại
  const currentPath = window.location.pathname;

  // Lấy tên file từ đường dẫn (ví dụ: /thoi-su.html -> thoi-su.html)
  const currentPage = currentPath.split("/").pop();

  console.log("Current page:", currentPage);

  // Lấy tất cả các liên kết trong thanh navigation
  const navLinks = document.querySelectorAll(".nav a");

  // Thêm class active cho liên kết tương ứng với trang hiện tại
  navLinks.forEach((link) => {
    const linkHref = link.getAttribute("href");

    // Xử lý trường hợp trang hiện tại
    if (linkHref === currentPage) {
      link.classList.add("active");
      console.log("Activated nav link:", linkHref);
    }

    // Trường hợp đặc biệt cho trang chủ
    if (currentPage === "" || currentPage === "index.html") {
      if (linkHref === "index.html") {
        link.classList.add("active");
        console.log("Activated home nav link");
      }
    }
  });
});
