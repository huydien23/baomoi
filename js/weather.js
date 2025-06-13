const apiKey = "8606c8fbecabca10ad6a34d298a8f077";
window.addEventListener("DOMContentLoaded", function () {
    const citySelect = document.getElementById('citySelect');
    const cityName = document.getElementById('cityName');
    const temperature = document.getElementById('temperature');
    const weatherDescription = document.getElementById('weatherDescription');
    const humidity = document.getElementById('humidity');
    const weatherIconLarge = document.getElementById('weatherIconLarge');
    const weatherEffect = document.getElementById('weatherEffect');

    function setWeatherEffect(icon) {
        weatherEffect.innerHTML = "";
        weatherEffect.className = "weather-effect";
        if (!icon) return;
        if (icon.startsWith("01")) {
            weatherEffect.classList.add("sunny");
            weatherEffect.innerHTML = '<div class="sun"></div>';
        } else if (icon.startsWith("02") || icon.startsWith("03") || icon.startsWith("04")) {
            weatherEffect.classList.add("cloudy");
            weatherEffect.innerHTML = '<div class="cloud"></div><div class="cloud cloud2"></div>';
        } else if (icon.startsWith("09") || icon.startsWith("10")) {
            weatherEffect.classList.add("rainy");
            weatherEffect.innerHTML = '<div class="cloud"></div><div class="rain"></div>';
        } else if (icon.startsWith("11")) {
            weatherEffect.classList.add("storm");
            weatherEffect.innerHTML = '<div class="cloud"></div><div class="lightning"></div>';
        } else if (icon.startsWith("13")) {
            weatherEffect.classList.add("snowy");
            weatherEffect.innerHTML = '<div class="cloud"></div><div class="snow"></div>';
        } else if (icon.startsWith("50")) {
            weatherEffect.classList.add("foggy");
            weatherEffect.innerHTML = '<div class="fog"></div>';
        }
    }

    function getWeather(city) {
        let cityQuery = city;
        // Đảm bảo key API luôn được truyền đúng vào URL
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityQuery)}&appid=8606c8fbecabca10ad6a34d298a8f077&units=metric&lang=vi`;
        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (data.cod === 200) {
                    cityName.textContent = data.name;
                    temperature.textContent = Math.round(data.main.temp) + "°C";
                    let desc = data.weather[0].description;
                    weatherDescription.textContent = desc.toUpperCase();
                    humidity.textContent = "Độ ẩm: " + data.main.humidity + "%";
                    weatherIconLarge.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
                    weatherIconLarge.alt = data.weather[0].description;
                    setWeatherEffect(data.weather[0].icon);
                } else {
                    cityName.textContent = city;
                    temperature.textContent = "--°C";
                    weatherDescription.textContent = "--";
                    humidity.textContent = "Độ ẩm: --%";
                    weatherIconLarge.src = "";
                    weatherIconLarge.alt = "";
                    setWeatherEffect("");
                }
            })
            .catch(() => {
                cityName.textContent = city;
                temperature.textContent = "--°C";
                weatherDescription.textContent = "--";
                humidity.textContent = "Độ ẩm: --%";
                weatherIconLarge.src = "";
                weatherIconLarge.alt = "";
                setWeatherEffect("");
            });
    }

    if (citySelect) {
        citySelect.addEventListener('change', function () {
            getWeather(this.value);
        });
        getWeather(citySelect.value);
    }
});
