const KEY = '383c082ce1a9438cb5073586ef220512';
let location = { lon: 34.32, lat: 109.03 };

async function getWeather() {
  try {
    const response = await axios.get(`https://devapi.qweather.com/v7/weather/now?location=${location.lon},${location.lat}&key=${KEY}`);
    const data = response.data;
    
    if (data.code === 200) {
      const now = data.now;
      const params = getParams($argument); // Assuming $argument is defined
      const date = formatDate(new Date(now.obsTime), 'yyyy-MM-dd HH:mm:ss');
      const message = `🌡️: ${now.temp}°C\n☁️: ${now.text}\n🌬️: ${now.windDir}\n⏰: ${date}`;

      const body = {
        title: "天气",
        content: message,
        icon: params.icon,
        "icon-color": params.color
      };

      $done(body); // Assuming $done is defined
    }
  } catch (error) {
    console.error(error);
  }
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

async function getLocation() {
  try {
    const response = await axios.get("http://ip-api.com/json/?fields=8450015&lang=zh-CN");
    const data = response.data;
    location = { lon: data.lon, lat: data.lat };
  } catch (error) {
    console.error(error);
  }
}

function getParams(paramString) {
  return Object.fromEntries(
    paramString
      .split("&")
      .map(item => item.split("="))
      .map(([key, value]) => [key, decodeURIComponent(value)])
  );
}

getLocation().then(getWeather);
