import { auth, database } from "./firebase-config.js";
import { ref, onValue, set, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Lưu tin đã đọc vào Firebase, chỉ lưu nếu chưa có link này
async function saveToHistory(article) {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const historyRef = ref(database, `readHistory/${userId}`);
    // Kiểm tra trùng link
    const snapshot = await onValue(ref(database, `readHistory/${userId}/`), (snapshot) => {
        const data = snapshot.val();
        if (data && data[article.id]) return true; // Đã có, không lưu nữa
        return false;
    });
    if (snapshot) return;
    await set(ref(database, `readHistory/${userId}/${article.id}`), article);
    console.log('Đã lưu vào lịch sử');
}

// Hiển thị tin đã đọc, phân trang 10 tin/lần
let historyPage = 1;
const HISTORY_PAGE_SIZE = 10;

async function displayHistory(page = 1) {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    let historyContainer = null;
    if (document.getElementById('historyContainer')) {
        historyContainer = document.querySelector('#historyContainer .category-news-list');
    } else if (document.getElementById('userHistoryList')) {
        historyContainer = document.getElementById('userHistoryList');
    } else {
        return;
    }
    if (!historyContainer) return;
    const historyRef = ref(database, `readHistory/${userId}`);
    try {
        const snapshot = await onValue(historyRef, (snapshot) => {
            const data = snapshot.val();
            if (!data) {
                historyContainer.innerHTML = '<p class="no-history">Bạn chưa đọc tin nào</p>';
                return;
            }
            // Sắp xếp và phân trang
            const historyArray = Object.entries(data)
                .map(([key, value]) => ({ id: key, ...value }))
                .sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt));
            const start = 0;
            const end = page * HISTORY_PAGE_SIZE;
            const showArray = historyArray.slice(start, end);
            historyContainer.innerHTML = showArray.map(item => `
                <div class="news-item">
                    <a href="${item.link}" target="_blank" class="news-link">
                        <div class="news-image">
                            <img src="${item.image || 'img/default-news.png'}" alt="${item.title}" onerror="this.src='img/default-news.png'">
                        </div>
                        <div class="news-content">
                            <h3>${item.title}</h3>
                            <p>${item.description}</p>
                            <div class="article-meta">
                                <span class="source">${item.source}</span>
                                <span class="time">${formatTimeAgo(new Date(item.viewedAt))}</span>
                            </div>
                        </div>
                    </a>
                </div>
            `).join('');
            // Nút xem thêm
            if (end < historyArray.length) {
                if (!document.getElementById('loadMoreHistory')) {
                    const btn = document.createElement('button');
                    btn.id = 'loadMoreHistory';
                    btn.textContent = 'Xem thêm';
                    btn.className = 'btn btn-login';
                    btn.style.margin = '16px auto 0';
                    btn.style.display = 'block';
                    btn.onclick = function() {
                        historyPage++;
                        displayHistory(historyPage);
                    };
                    historyContainer.parentNode.appendChild(btn);
                }
            } else {
                const btn = document.getElementById('loadMoreHistory');
                if (btn) btn.remove();
            }
        });
    } catch (error) {
        console.error('Lỗi khi tải lịch sử:', error);
        historyContainer.innerHTML = '<p class="error">Không thể tải lịch sử đọc tin</p>';
    }
}

// Thêm event listener cho các link tin tức
function addHistoryListeners() {
    document.addEventListener('click', (e) => {
        const newsLink = e.target.closest('.news-link');
        if (newsLink) {
            const article = {
                title: newsLink.querySelector('h3').textContent,
                description: newsLink.querySelector('p').textContent,
                link: newsLink.href,
                image: newsLink.querySelector('img').src,
                source: newsLink.querySelector('.source').textContent,
                pubDate: new Date().toISOString()
            };
            saveToHistory(article);
        }
    });
}

// Khởi tạo
document.addEventListener('DOMContentLoaded', () => {
    addHistoryListeners();
    // Kiểm tra đăng nhập trước khi hiển thị lịch sử
    onAuthStateChanged(auth, (user) => {
        if (user) {
            displayHistory();
        }
    });
}); 