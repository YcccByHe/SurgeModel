const ARG = parseArgument(typeof $argument === "string" ? $argument : "");
const API_KEY = ARG.ApiKey || "";
const PROVINCE = ARG.Province || "陕西";
const ICON = ARG.Icon || "car";
const COLOR = ARG.Color || "#c932a9";
const TANK_L = 58;

if (!API_KEY) {
  finishPanel("未配置 ApiKey", "请在 Surge 模块参数中填写天行 API Key");
} else {
  queryOilPrice();
}

function queryOilPrice() {
  const url =
    "https://apis.tianapi.com/oilprice/index?key=" +
    encodeURIComponent(API_KEY) +
    "&prov=" +
    encodeURIComponent(PROVINCE);

  $httpClient.get({ url: url, timeout: 5 }, (error, response, data) => {
    if (error) {
      finishPanel("网络错误", String(error));
      return;
    }

    let body;
    try {
      body = JSON.parse(data);
    } catch (e) {
      finishPanel("响应解析错误", String(data).slice(0, 120));
      return;
    }

    if (body.code !== 200 || !body.result) {
      const code = typeof body.code === "undefined" ? "?" : body.code;
      finishPanel("接口返回异常", `API 返回 ${code}：${body.msg || "未知错误"}`);
      return;
    }

    $done(buildPanel(body.result));
  });
}

function buildPanel(result) {
  const timeStr = result.time ? String(result.time).slice(0, 16) : "未知";
  const content =
    `更新时间：${timeStr}\n` +
    `92# 汽油：¥${result.p92} / 升\n` +
    `95# 汽油：¥${result.p95} / 升\n` +
    `98# 汽油：¥${result.p98} / 升\n` +
    `加满${TANK_L}L：92# ¥${fullTankPrice(result.p92)}  95# ¥${fullTankPrice(result.p95)}  98# ¥${fullTankPrice(result.p98)}` +
    diffText(result);

  return {
    title: `⛽ ${result.prov} 今日油价`,
    content: content,
    icon: ICON,
    "icon-color": COLOR
  };
}

function fullTankPrice(price) {
  const value = parseFloat(price);
  return isNaN(value) ? "?" : Math.round(value * TANK_L);
}

function diffText(result) {
  const storeKey = `surge_oil_price_last_${PROVINCE}`;
  const last = $persistentStore.read(storeKey);
  $persistentStore.write(JSON.stringify(result), storeKey);

  if (!last) {
    return "";
  }

  try {
    const prev = JSON.parse(last);
    const parts = [];

    ["p92", "p95", "p98"].forEach((oil) => {
      const current = parseFloat(result[oil]);
      const previous = parseFloat(prev[oil]);
      if (isNaN(current) || isNaN(previous)) {
        return;
      }

      const delta = +(current - previous).toFixed(2);
      if (delta !== 0) {
        const label = oil.slice(1) + "#";
        const direction = delta > 0 ? "↑" : "↓";
        parts.push(`${label}${direction}${Math.abs(delta).toFixed(2)}`);
      }
    });

    return parts.length ? `\n变动：${parts.join("  ")}` : "";
  } catch (e) {
    return "";
  }
}

function finishPanel(subtitle, body) {
  $done({
    title: "⛽ 油价查询",
    content: `${subtitle}\n${body}`,
    icon: ICON,
    "icon-color": COLOR
  });
}

function parseArgument(argument) {
  if (!argument) {
    return {};
  }

  return Object.fromEntries(
    argument
      .split("&")
      .filter(Boolean)
      .map((item) => {
        const index = item.indexOf("=");
        if (index === -1) {
          return [item, ""];
        }

        const key = item.slice(0, index);
        const value = item.slice(index + 1).replace(/\+/g, " ");
        return [key, decodeURIComponent(value)];
      })
  );
}
