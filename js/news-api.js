import { ref, get, query, orderByChild, equalTo, limitToLast } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { database } from "./firebase-config.js";

console.log('news-api.js loaded and executing');

// Danh sách RSS theo mục (chỉ dùng để map category, không fetch trực tiếp)
const rssFeeds = {
    'tin-moi': {
        section: '.latest-news .news-grid',
        count: 4
    },
    'thoi-su': {
        section: '.thoi-su-news .category-news-list',
        count: 2
    },
    'kinh-te': {
        section: '.kinh-te-news .category-news-list',
        count: 2
    },
    'phap-luat': {
        section: '.phap-luat-news .category-news-list',
        count: 2
    },
    'giai-tri': {
        section: '.giai-tri-news .category-news-list',
        count: 2
    },
    'giao-duc': {
        section: '.giao-duc-news .category-news-list',
        count: 2
    },
    'y-te': {
        section: '.y-te-news .category-news-list',
        count: 2
    },
    'tin-noi-bat': {
        section: '.hot-news .main-article',
        count: 1
    }
};

function getCategoryFromUrl(url) {
    const categoryMap = {
        'https://vnexpress.net/rss/tin-moi-nhat.rss': 'tin-moi',
        'https://tuoitre.vn/rss/thoi-su.rss': 'thoi-su',
        'https://thanhnien.vn/rss/kinh-te.rss': 'kinh-te',
        'https://vnexpress.net/rss/phap-luat.rss': 'phap-luat',
        'https://vnexpress.net/rss/giai-tri.rss': 'giai-tri',
        'https://tuoitre.vn/rss/giao-duc.rss': 'giao-duc',
        'https://vnexpress.net/rss/y-te.rss': 'y-te',
        'https://vnexpress.net/rss/tin-noi-bat.rss': 'tin-noi-bat'
    };
    return categoryMap[url] || 'tin-moi';
}

// Hàm lấy tin từ publicNews
async function fetchNewsFromPublic(category) {
    try {
        const newsRef = ref(database, 'publicNews');
        const newsQuery = query(
            newsRef,
            orderByChild('category'),
            equalTo(category),
            limitToLast(50)
        );
        const snapshot = await get(newsQuery);
        const news = [];
        snapshot.forEach(childSnapshot => {
            const newsItem = childSnapshot.val();
            news.push({ ...newsItem, id: childSnapshot.key });
        });
        return news.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    } catch (error) {
        console.error('Lỗi khi lấy tin từ publicNews:', error);
        return [];
    }
}

// Hàm lấy tin tức từ RSS (chỉ lấy từ publicNews, không fetch RSS thật)
async function fetchNewsFromRSS(url) {
    const category = getCategoryFromUrl(url);
    return await fetchNewsFromPublic(category);
}

// --- THAY ĐỔI NGUỒN KHÔNG BỊ CHẶN ---
const sidebarRssFeeds = [
    { name: "VnExpress", url: "https://vnexpress.net/rss/tin-moi-nhat.rss", logo: "img/logo/vnexpress.png" },
    { name: "Tuổi Trẻ", url: "https://tuoitre.vn/rss/tin-moi-nhat.rss", logo: "img/logo/tuoitre.png" },
    { name: "Thanh Niên", url: "https://thanhnien.vn/rss/home.rss", logo: "img/logo/thanhnien.png" }
];

function stripHtml(html) {
    var tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

function getAllImagesFromDescription(description) {
    const matches = [...(description.matchAll(/<img[^>]+src=['"]([^'\"]+)['"]/gi) || [])];
    return matches.map(m => m[1]);
}

function getArticleImage(article) {
    if (article.enclosure && article.enclosure.link && article.enclosure.link.startsWith('http')) return article.enclosure.link;
    if (article.thumbnail && article.thumbnail.startsWith('http')) return article.thumbnail;
    const imgs = getAllImagesFromDescription(article.description || '');
    for (const img of imgs) {
        if (img && img.startsWith('http')) return img;
    }
    return 'img/default-news.png';
}

function hasRealImage(article) {
    if (article.enclosure && article.enclosure.link) return true;
    if (article.thumbnail) return true;
    const match = article.description && article.description.match(/<img.*?src=['\"](.*?)['\"]/);
    return !!(match && match[1]);
}

function hasFullContent(article) {
    const title = article.title ? stripHtml(article.title) : '';
    const desc = article.description ? stripHtml(article.description) : '';
    const img = getArticleImage(article);
    return !!title && !!desc && !!img;
}

// Hàm lấy tên nguồn từ URL RSS
function getSourceFromUrl(url) {
    if (url.includes('vnexpress.net')) return 'VnExpress';
    if (url.includes('tuoitre.vn')) return 'Tuổi Trẻ';
    if (url.includes('thanhnien.vn')) return 'Thanh Niên';
    return '';
}

function getSourceLogo(source) {
    // Map tên nguồn với file logo
    const logos = {
        'VnExpress': 'img/logo/vnexpress.png',
        'Tuổi Trẻ': 'img/logo/tuoitre.png',
        'Thanh Niên': 'img/logo/thanhnien.png'
    };

    return logos[source] ? `<img src="${logos[source]}" alt="${source}" class="news-source-logo">` : "";
}

function formatTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    if (minutes > 0) return `${minutes} phút trước`;
    return 'Vừa xong';
}

function displayNews(articles, containerSelector) {
    console.log('Render news for', containerSelector, articles);
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.warn('Container not found for selector:', containerSelector);
        return;
    }
    container.innerHTML = articles.map(article => {
        const img = article.image || article.thumbnail || 'img/default-news.png';
        return `
            <article class="news-card">
                <a href="${article.link}" class="news-link" target="_blank">
                    <div class="news-image">
                        <img src="${img}" alt="${article.title}" onerror="this.src='img/default-news.png'">
                    </div>
                    <div class="news-content">
                        <h3>${article.title}</h3>
                        <p>${article.description}</p>
                        <div class="article-meta">
                            <span class="source">
                                ${getSourceLogo(article.source)}
                            </span>
                            <span class="time">${formatTimeAgo(new Date(article.pubDate))}</span>
                        </div>
                    </div>
                </a>
            </article>
        `;
    }).join('');
}

function displayMainArticle(article) {
    const mainArticle = document.querySelector('.hot-news .main-article');
    if (!mainArticle) return;

    const img = article.image || article.thumbnail || 'img/default-news.png';
    mainArticle.innerHTML = `
        <a href="${article.link}" target="_blank">
            <img src="${img}" alt="${article.title}" onerror="this.src='img/default-news.png'">
            <div class="article-content">
                <h2>${article.title}</h2>
                <p>${article.description}</p>
                <div class="article-meta">
                    <span class="source">
                        ${getSourceLogo(article.source)}
                    </span>
                    <span class="time">${formatTimeAgo(new Date(article.pubDate))}</span>
                </div>
            </div>
        </a>
    `;
}

// --- LẤY TIN RSS CHO SIDEBAR PHẢI ---
async function loadSidebarNews() {
    let allItems = [];
    for (const feed of sidebarRssFeeds) {
        const items = await fetchNewsFromRSS(feed.url, 3);
        items.forEach(item => {
            item.source = feed.name;
        });
        allItems = allItems.concat(items);
    }
    allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    renderSidebarNews(allItems.slice(0, 6));
}

function renderSidebarNews(articles) {
    const container = document.querySelector('.sidebar-news-list');
    if (!container) return;
    container.innerHTML = articles.map(article => `
        <article class="sidebar-news-item-modern">
            <a href="${article.link}" target="_blank" class="sidebar-news-link">
                <div class="sidebar-news-thumb">
                    <img src="${article.image}" alt="${article.title}" onerror="this.src='img/default-news.png'">
                </div>
                <div class="sidebar-news-info">
                    <div class="sidebar-news-title">${article.title}</div>
                    <div class="sidebar-news-meta">
                        <span class="sidebar-news-source">
                            ${getSourceLogo(article.source)}
                        </span>
                        <span class="sidebar-news-time">${formatTimeAgo(new Date(article.pubDate))}</span>
                    </div>
                </div>
            </a>
        </article>
    `).join('');
}

// Thêm CSS cho logo và tên nguồn
const style = document.createElement('style');
style.textContent = `
    .source {
        display: flex;
        align-items: center;
        gap: 4px;
    }
    .news-source-logo {
        height: 16px;
        width: auto;
        vertical-align: middle;
        border-radius: 2px;
    }
    .sidebar-news-source {
        display: flex;
        align-items: center;
        gap: 4px;
    }
    .sidebar-news-source .news-source-logo {
        height: 14px;
        width: auto;
        vertical-align: middle;
        border-radius: 2px;
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Tin nổi bật
        const { url: urlNoiBat, section: sectionNoiBat, count: countNoiBat } = rssFeeds['tin-noi-bat'];
        const tinNoiBat = await fetchNewsFromRSS(urlNoiBat, countNoiBat);
        if (tinNoiBat.length > 0) {
            displayMainArticle(tinNoiBat[0]);
        }

        // Tin mới nhất
        const { url: urlMoi, section: sectionMoi, count: countMoi } = rssFeeds['tin-moi'];
        const tinMoi = await fetchNewsFromRSS(urlMoi, countMoi);
        displayNews(tinMoi, sectionMoi);

        // Các chuyên mục khác
        for (const key of ['thoi-su', 'kinh-te', 'phap-luat', 'giai-tri', 'giao-duc', 'y-te']) {
            const { url, section, count } = rssFeeds[key];
            const articles = await fetchNewsFromRSS(url, count);
            displayNews(articles, section);
        }

        await loadSidebarNews();
    } catch (error) {
        console.error('Error initializing:', error);
    }
});