const KEY = '383c082ce1a9438cb5073586ef220512'
const XA = 101110113

$httpClient.get(`https://devapi.qweather.com/v7/weather/now?location=${XA}&key=${KEY}`, (error, response, data) => {
  if (error) {
    console.log(error);
  } else {
    let result = JSON.parse(data)
    let _now = result.now
    if (result.code == 200) {
      const date = formatDateTime(new Date(_now.obsTime), 'yyyy-MM-dd HH:mm:ss');
      const message = `🌡️：${_now.temp}°c\n☁️：${_now.text}\n🌬️：${_now.windDir}⏰：${date}\n`
      console.log(message)
      $done(message)
    }
  }
});


function formatDateTime(date, format) {
  // Helper function to add leading zeros
  const zeroPad = (num, places) => String(num).padStart(places, '0');

  // Extracting date components
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour12 = date.getHours() % 12 === 0 ? 12 : date.getHours() % 12;
  const hour24 = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  const millisecond = date.getMilliseconds();
  const quarter = Math.floor((month + 2) / 3);
  const ampm = hour24 < 12 ? '上午' : '下午';
  const AM_PM = hour24 < 12 ? 'AM' : 'PM';

  // Replacing year
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, `${year}`.substr(4 - RegExp.$1.length));
  }

  // Replacing other components
  const replacements = {
    'M+': month,
    'd+': day,
    'h+': hour12,
    'H+': hour24,
    'm+': minute,
    's+': second,
    'q+': quarter,
    'S': millisecond,
    'a': ampm,
    'A': AM_PM
  };

  for (let k in replacements) {
    if (new RegExp(`(${k})`).test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? replacements[k] : zeroPad(replacements[k], RegExp.$1.length));
    }
  }

  return format;
}
