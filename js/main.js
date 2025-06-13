// Dữ liệu tin tức mẫu
const sampleNews = [
    {
        title: 'Phát hiện số lượng lớn thuốc, thực phẩm chức năng bị bỏ ven đường ở TPHCM',
        description: 'Số lượng lớn thuốc tân dược, thực phẩm chức năng được phát hiện vứt bỏ tại một bãi đất trống ven đường...',
        image: 'https://via.placeholder.com/200x120',
        time: '4 giờ',
        related: 18
    },
    {
        title: 'Video ghi lại khoảnh khắc tổ hợp tên lửa Iskander của Liên bang Nga bị Ukraine phá hủy',
        description: 'Quân đội Ukraine đã công bố đoạn video ghi lại cảnh phá hủy tổ hợp tên lửa đạn đạo Iskander của Nga...',
        image: 'https://via.placeholder.com/200x120',
        time: '3 giờ',
        related: 37
    },
    {
        title: 'Hậu Giang công bố kết quả kiểm tra lò mổ C.P. bị tố có heo bệnh',
        description: 'Sau khi kiểm tra đột xuất, cơ quan chức năng xác định không có dấu hiệu giết mổ heo bệnh tại cơ sở...',
        image: 'https://via.placeholder.com/200x120',
        time: '4 giờ',
        related: 45
    }
];

const discoverVietnam = [
    {
        title: 'Hữu tình cảnh sắc ruộng bậc thang mùa nước đổ ở vùng cao Bắc Yên',
        image: 'https://via.placeholder.com/400x250',
        time: '5 giờ',
        related: 1
    },
    {
        title: 'Thác nước như dải lụa trắng, mang truyền thuyết về người anh hùng ở Lâm Đồng',
        image: 'https://via.placeholder.com/400x250',
        time: '1 ngày',
        related: 0
    }
];

// Hàm tạo HTML cho một tin tức
function createNewsItem(news) {
    return `
        <article class="news-item">
            <img src="${news.image}" alt="${news.title}">
            <div class="news-content">
                <h3>${news.title}</h3>
                <p>${news.description || ''}</p>
                <div class="news-meta">
                    <span class="time">${news.time}</span>
                    <span class="related">${news.related} liên quan</span>
                </div>
            </div>
        </article>
    `;
}

// Hàm tạo HTML cho mục Khám phá Việt Nam
function createDiscoverItem(item) {
    return `
        <article class="discover-item">
            <img src="${item.image}" alt="${item.title}">
            <h3>${item.title}</h3>
            <div class="news-meta">
                <span class="time">${item.time}</span>
                ${item.related ? `<span class="related">${item.related} liên quan</span>` : ''}
            </div>
        </article>
    `;
}

// Hàm load tin tức vào các section
function loadContent() {
    // Load tin tức chính
    const newsList = document.querySelector('.news-list');
    if (newsList) {
        const newsHTML = sampleNews.map(news => createNewsItem(news)).join('');
        newsList.innerHTML = newsHTML;
    }

    // Load mục Khám phá Việt Nam
    const discoverGrid = document.querySelector('.discover-grid');
    if (discoverGrid) {
        const discoverHTML = discoverVietnam.map(item => createDiscoverItem(item)).join('');
        discoverGrid.innerHTML = discoverHTML;
    }
}

// Hàm xử lý tìm kiếm
function handleSearch() {
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');

    if (searchButton && searchInput) {
        searchButton.addEventListener('click', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const filteredNews = sampleNews.filter(news => 
                news.title.toLowerCase().includes(searchTerm) || 
                (news.description && news.description.toLowerCase().includes(searchTerm))
            );
            
            const newsList = document.querySelector('.news-list');
            if (newsList) {
                const newsHTML = filteredNews.map(news => createNewsItem(news)).join('');
                newsList.innerHTML = newsHTML || '<p class="no-results">Không tìm thấy kết quả phù hợp</p>';
            }
        });

        // Thêm xử lý tìm kiếm khi nhấn Enter
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchButton.click();
            }
        });
    }
}

// Hàm xử lý menu responsive
function handleResponsiveMenu() {
    const menuButton = document.createElement('button');
    menuButton.className = 'menu-toggle';
    menuButton.innerHTML = '<i class="fas fa-bars"></i>';
    
    const nav = document.querySelector('.main-nav');
    const headerTop = document.querySelector('.header-top');
    
    if (headerTop && nav) {
        headerTop.appendChild(menuButton);
        
        menuButton.addEventListener('click', () => {
            nav.classList.toggle('active');
            menuButton.classList.toggle('active');
        });
    }
}

// Hàm cập nhật thời gian
function updateTimes() {
    const timeElements = document.querySelectorAll('.time');
    timeElements.forEach(element => {
        const time = element.textContent;
        // Cập nhật thời gian tương đối (có thể thêm logic phức tạp hơn ở đây)
        element.textContent = time;
    });
}

// Image Slider
const sliderImages = document.querySelectorAll('.slider-container img');
const dots = document.querySelectorAll('.dot');
let currentSlide = 0;

function showSlide(index) {
    if (!sliderImages.length || !dots.length) return;
    sliderImages.forEach(img => img.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    sliderImages[index].classList.add('active');
    dots[index].classList.add('active');
}

function nextSlide() {
    if (!sliderImages.length) return;
    currentSlide = (currentSlide + 1) % sliderImages.length;
    showSlide(currentSlide);
}

if (sliderImages.length && dots.length) {
    setInterval(nextSlide, 5000);
    // ... các event khác nếu có
}

// Weather API Integration cho sidebar phải
const API_KEY = 'YOUR_API_KEY'; // Thay YOUR_API_KEY bằng API key thật của bạn
const citySelect = document.getElementById('citySelect');
const cityName = document.getElementById('cityName');
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weatherDescription');
const humidity = document.getElementById('humidity');
const weatherIcon = document.getElementById('weatherIcon');

async function getWeather() {
    const city = 'Hà Nội';
    const country = 'VN';
    
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&units=metric&appid=${API_KEY}&lang=vi`);
        if (!response.ok) {
            throw new Error('Không thể lấy thông tin thời tiết');
        }
        const data = await response.json();
        updateWeatherUI(data);
    } catch (error) {
        console.error('Lỗi khi lấy thông tin thời tiết:', error);
        // Ẩn phần thời tiết nếu có lỗi
        const weatherContainer = document.querySelector('.weather-container');
        if (weatherContainer) {
            weatherContainer.style.display = 'none';
        }
    }
}

function updateWeatherUI(data) {
    const weatherContainer = document.querySelector('.weather-container');
    if (!weatherContainer) return;

    const temp = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;

    weatherContainer.innerHTML = `
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
        <div class="weather-info">
            <div class="temperature">${temp}°C</div>
            <div class="description">${description}</div>
        </div>
    `;
}

if (citySelect) {
    citySelect.addEventListener('change', (e) => {
        getWeather();
    });
    getWeather();
}

// Xử lý active state cho menu
function handleMenuActive() {
    const menuItems = document.querySelectorAll('.main-nav ul li'); // Đảm bảo lấy đúng menu items
    const currentPath = window.location.pathname.split('/').pop(); // Lấy tên file hiện tại

    menuItems.forEach(item => {
        const link = item.querySelector('a');
        if (link) {
            const linkPath = link.getAttribute('href').split('/').pop();
            if (linkPath === currentPath) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        }
    });
}

// Khởi tạo tất cả các chức năng
document.addEventListener('DOMContentLoaded', () => {
    // loadContent(); // Nếu có hàm load nội dung tin tức
    // handleSearch(); // Nếu có hàm tìm kiếm
    handleResponsiveMenu();
    handleMenuActive();
    updateTimes();
    setInterval(updateTimes, 60000);
    // getWeather(); // Nếu bạn muốn lấy thời tiết ngay khi tải trang
});

// Hàm tối ưu gợi ý tìm kiếm bài báo dạng dropdown như giao diện hiện đại
function handleSearchBox() {
    const searchInput = document.getElementById('searchInput');
    const searchResultMessage = document.getElementById('searchResultMessage');
    let suggestionBox = document.getElementById('searchSuggestionBox');
    if (!suggestionBox) {
        suggestionBox = document.createElement('div');
        suggestionBox.id = 'searchSuggestionBox';
        suggestionBox.style.position = 'absolute';
        suggestionBox.style.background = '#fff';
        suggestionBox.style.border = '1px solid #e0e0e0';
        suggestionBox.style.width = '100%';
        suggestionBox.style.zIndex = '1001';
        suggestionBox.style.maxHeight = '320px';
        suggestionBox.style.overflowY = 'auto';
        suggestionBox.style.boxShadow = '0 4px 16px #0002';
        suggestionBox.style.borderRadius = '8px';
        suggestionBox.style.display = 'none';
        suggestionBox.style.fontSize = '16px';
        suggestionBox.style.left = '0';
        suggestionBox.style.top = '40px';
        searchInput.parentNode.style.position = 'relative';
        searchInput.parentNode.appendChild(suggestionBox);
    }

    function getAllSuggestions() {
        const newsCards = Array.from(document.querySelectorAll('.news-card, .main-article, .category-news-list .news-card'));
        return newsCards.map(card => {
            const h3 = card.querySelector('h3');
            const p = card.querySelector('p');
            let title = h3 ? h3.textContent.trim() : '';
            let desc = p ? p.textContent.trim() : '';
            return title ? (desc ? `${title} - ${desc}` : title) : '';
        }).filter(Boolean);
    }

    function showSuggestions(keyword) {
        const suggestions = getAllSuggestions().filter(text => text.toLowerCase().includes(keyword.toLowerCase()));
        suggestionBox.innerHTML = '';
        if (keyword && suggestions.length > 0) {
            suggestions.slice(0, 6).forEach(text => {
                const item = document.createElement('div');
                item.textContent = text;
                item.style.padding = '10px 16px';
                item.style.cursor = 'pointer';
                item.style.whiteSpace = 'nowrap';
                item.style.overflow = 'hidden';
                item.style.textOverflow = 'ellipsis';
                item.onmousedown = function(e) {
                    e.preventDefault();
                    searchInput.value = text.split(' - ')[0];
                    suggestionBox.style.display = 'none';
                    searchNews(text.split(' - ')[0]);
                };
                item.onmouseover = function() { item.style.background = '#f5f5f5'; };
                item.onmouseout = function() { item.style.background = '#fff'; };
                suggestionBox.appendChild(item);
            });
            // Thêm dòng "Xem các kết quả của ..."
            const more = document.createElement('div');
            more.innerHTML = `<span style='color:#0099cc;cursor:pointer;'>Xem các kết quả của '<b>${keyword}</b>'</span>`;
            more.style.padding = '10px 16px';
            more.style.borderTop = '1px solid #e0e0e0';
            more.style.background = '#fafbfc';
            more.onmousedown = function(e) {
                e.preventDefault();
                suggestionBox.style.display = 'none';
                searchNews(keyword);
            };
            suggestionBox.appendChild(more);
            suggestionBox.style.display = 'block';
        } else {
            suggestionBox.style.display = 'none';
        }
    }

    function searchNews(keyword) {
        const key = (keyword !== undefined ? keyword : searchInput.value).trim().toLowerCase();
        const newsCards = Array.from(document.querySelectorAll('.news-card, .main-article, .category-news-list .news-card'));
        let count = 0;
        newsCards.forEach(card => {
            const h3 = card.querySelector('h3');
            const p = card.querySelector('p');
            const text = ((h3 ? h3.textContent : '') + ' ' + (p ? p.textContent : '')).toLowerCase();
            if (key === '' || text.includes(key)) {
                card.style.display = '';
                if (key && text.includes(key)) {
                    count++;
                }
            } else {
                card.style.display = 'none';
            }
        });
        searchResultMessage.textContent = count > 0 ? `Tìm thấy ${count} kết quả cho "${key}"` : '';
    }

    searchInput.addEventListener('input', () => {
        const keyword = searchInput.value.trim();
        if (keyword.length > 0) {
            showSuggestions(keyword);
        } else {
            suggestionBox.style.display = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionBox.contains(e.target)) {
            suggestionBox.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', handleSearchBox);