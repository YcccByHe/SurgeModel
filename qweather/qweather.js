const KEY = '383c082ce1a9438cb5073586ef220512';
let location = { lon: 34.32, lat: 109.03 };

function getWeather() {
  const weatherURL = `https://devapi.qweather.com/v7/weather/now?location=${location.lon},${location.lat}&key=${KEY}`;

  $httpClient.get(weatherURL, (error, response, data) => {
    if (error) {
      console.error(error);
      return;
    }

    const result = JSON.parse(data);
    if (result.code === 200) {
      const now = result.now;
      const params = getParams($argument); 
      const date = formatDate(new Date(now.obsTime), 'yyyy-MM-dd HH:mm:ss');
      const message = `🌡️: ${now.temp}°C\n☁️: ${now.text}\n🌬️: ${now.windDir}\n⏰: ${date}`;

      const body = {
        title: "天气",
        content: message,
        icon: params.icon,
        "icon-color": params.color
      };

      $done(body); 
    }
  });
}

function formatDate(date, format) {
  const zeroPad = (num, places) => String(num).padStart(places, '0');
  const replacements = {
    'yyyy': date.getFullYear(),
    'MM': zeroPad(date.getMonth() + 1, 2),
    'dd': zeroPad(date.getDate(), 2),
    'HH': zeroPad(date.getHours(), 2),
    'mm': zeroPad(date.getMinutes(), 2),
    'ss': zeroPad(date.getSeconds(), 2),
  };

  return format.replace(/yyyy|MM|dd|HH|mm|ss/g, match => replacements[match]);
}

function getLocation() {
  const locationURL = "http://ip-api.com/json/?fields=8450015&lang=zh-CN";

  $httpClient.get(locationURL, (error, response, data) => {
    if (error) {
      console.error(error);
      return;
    }

    const jsonData = JSON.parse(data);
    location.lon = Number(jsonData.lon).toFixed(2);
    location.lat = Number(jsonData.lat).toFixed(2);

    getWeather(); // Call getWeather after location is updated
  });
}

function getParams(paramString) {
  return Object.fromEntries(
    paramString
      .split("&")
      .map(item => item.split("="))
      .map(([key, value]) => [key, decodeURIComponent(value)])
  );
}

// Start the process
getLocation();