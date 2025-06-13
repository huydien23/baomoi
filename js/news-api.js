console.log('news-api.js loaded and executing');

// Firebase Configuration (Using your actual Firebase project config)
const firebaseConfig = {
    apiKey: "AIzaSyABGYSGrh7ghjuE3RqeO4EJKcd0P3tzUJg",
    authDomain: "bao24h-a72a6.firebaseapp.com",
    databaseURL: "https://bao24h-a72a6-default-rtdb.firebaseio.com",
    projectId: "bao24h-a72a6",
    storageBucket: "bao24h-a72a6.firebasestorage.app",
    messagingSenderId: "749274721600",
    appId: "1:749274721600:web:4f0bb62127d258e2411ea5",
    measurementId: "G-GB82V42LBL"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// Danh sách RSS theo mục
const rssFeeds = {
    'tin-moi': {
        url: 'https://vnexpress.net/rss/tin-moi-nhat.rss',
        section: '.latest-news .news-grid',
        count: 4
    },
    'thoi-su': {
        url: 'https://tuoitre.vn/rss/thoi-su.rss',
        section: '.thoi-su-news .category-news-list',
        count: 2
    },
    'kinh-te': {
        url: 'https://thanhnien.vn/rss/kinh-te.rss',
        section: '.kinh-te-news .category-news-list',
        count: 2
    },
    'phap-luat': {
        url: 'https://vnexpress.net/rss/phap-luat.rss',
        section: '.phap-luat-news .category-news-list',
        count: 2
    },
    'giai-tri': {
        url: 'https://vnexpress.net/rss/giai-tri.rss',
        section: '.giai-tri-news .category-news-list',
        count: 2
    },
    'giao-duc': {
        url: 'https://tuoitre.vn/rss/giao-duc.rss',
        section: '.giao-duc-news .category-news-list',
        count: 2
    },
    'y-te': {
        url: 'https://vnexpress.net/rss/y-te.rss',
        section: '.y-te-news .category-news-list',
        count: 2
    },
    'tin-noi-bat': {
        url: 'https://vnexpress.net/rss/tin-noi-bat.rss',
        section: '.hot-news .main-article',
        count: 1
    }
};

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

async function fetchNewsFromRSS(feedUrl, count = 4) {
    try {
        const defaultSource = getSourceFromUrl(feedUrl);
        
        // Try RSS2JSON API first
        try {
            const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`);
            if (!response.ok) throw new Error(`RSS2JSON API error: ${response.status}`);
            const data = await response.json();
            
            if (data.status === 'ok' || data.status === 200) {
                const filtered = data.items.filter(hasFullContent);
                return filtered.slice(0, count).map(article => ({
                    ...article,
                    title: article.title ? stripHtml(article.title) : 'Không có tiêu đề',
                    description: article.description ? stripHtml(article.description) : 'Không có mô tả',
                    image: getArticleImage(article),
                    source: article.source || defaultSource
                }));
            }
        } catch (rss2jsonError) {
            console.warn('RSS2JSON API failed, falling back to direct RSS fetch:', rss2jsonError);
        }

        // Fallback: Direct RSS fetch
        const response = await fetch(feedUrl);
        if (!response.ok) throw new Error(`RSS fetch error: ${response.status}`);
        const text = await response.text();
        
        // Basic XML parsing
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");
        const items = xmlDoc.querySelectorAll("item");
        
        return Array.from(items).slice(0, count).map(item => {
            const title = item.querySelector("title")?.textContent || 'Không có tiêu đề';
            const description = item.querySelector("description")?.textContent || 'Không có mô tả';
            const link = item.querySelector("link")?.textContent || '#';
            const pubDate = item.querySelector("pubDate")?.textContent || new Date().toISOString();
            
            // Try to extract image from description
            let image = 'img/default-news.png';
            const descriptionHtml = parser.parseFromString(description, "text/html");
            const imgTag = descriptionHtml.querySelector("img");
            if (imgTag?.src) {
                image = imgTag.src;
            }
            
            return {
                title: stripHtml(title),
                description: stripHtml(description),
                link,
                pubDate,
                image,
                source: defaultSource
            };
        });
    } catch (error) {
        console.error('Error fetching news:', error);
        return [];
    }
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
    const container = document.querySelector(containerSelector);
    if (!container) return;

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