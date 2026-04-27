(function () {
  "use strict";

  const API_URL = "https://api-server-key.tranphat1357t.workers.dev";

  // ===== DEVICE ID =====
  function getDeviceId() {
    let id = localStorage.getItem("device_id");
    if (!id) {
      id = "DEV-" + Math.random().toString(36).substring(2, 10).toUpperCase();
      localStorage.setItem("device_id", id);
    }
    return id;
  }

  // ===== TIME =====
  function getTime() {
    return new Date().toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh"
    });
  }

  // ===== DEVICE INFO =====
  function getDevice() {
    return navigator.platform + " | " + navigator.userAgent.slice(0, 40);
  }

  // ===== UI =====
  const overlay = document.createElement("div");
  overlay.innerHTML = `
<style>
#eliteUI {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at top, #020617, #000);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999999;
  font-family: 'Segoe UI', sans-serif;
  color: #0ff;
}

.box {
  width: 360px;
  padding: 25px;
  border-radius: 18px;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(20px);
  box-shadow: 0 0 40px #00f0ff44;
}

.title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #00f0ff;
}

.label {
  font-size: 12px;
  margin: 8px 0 4px;
  color: #00eaff;
}

.input {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: none;
  background: #020617;
  color: #0ff;
  margin-bottom: 8px;
}

.row {
  display: flex;
  gap: 6px;
}

.btn {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(45deg,#00eaff,#0066ff);
  color: white;
  font-weight: bold;
  cursor: pointer;
}

.btn.red {
  background: linear-gradient(45deg,#ff0040,#ff4d4d);
}

.btn.gray {
  background: #111;
}

.info {
  font-size: 11px;
  margin-top: 10px;
  background: #020617;
  padding: 8px;
  border-radius: 8px;
  color: #aaa;
  word-break: break-all;
}

.status {
  margin-top: 10px;
  text-align: center;
  font-size: 13px;
}

.time {
  margin-top: 5px;
  text-align: center;
  font-size: 11px;
  color: #666;
}
</style>

<div id="eliteUI">
  <div class="box">
    <div class="title">⚡ ELITE TURBO</div>

    <div class="label">MÃ KÍCH HOẠT</div>
    <div class="row">
      <input id="keyInput" class="input" placeholder="VIP-XXX-XXX" />
      <button id="pasteBtn" class="btn gray">DÁN</button>
      <button id="clearBtn" class="btn red">XÓA</button>
    </div>

    <div class="label">MÃ THIẾT BỊ</div>
    <div class="row">
      <input id="deviceId" class="input" readonly />
      <button id="copyBtn" class="btn gray">SAO CHÉP</button>
    </div>

    <div class="row">
      <button id="checkBtn" class="btn">Check Key</button>
      <button id="activeBtn" class="btn">Mở</button>
    </div>

    <button id="resetBtn" class="btn gray" style="margin-top:8px;">RESET</button>

    <div class="info">
      UID: <span id="uid"></span><br>
      DEVICE: <span id="device"></span>
    </div>

    <div id="status" class="status">Đang chờ...</div>
    <div id="time" class="time"></div>
  </div>
</div>
`;

  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";

  // ===== SET INFO =====
  const deviceId = getDeviceId();
  document.getElementById("deviceId").value = deviceId;
  document.getElementById("uid").innerText = deviceId;
  document.getElementById("device").innerText = getDevice();

  // ===== TIME UPDATE =====
  setInterval(() => {
    document.getElementById("time").innerText = getTime();
  }, 1000);

  // ===== API =====
  async function verifyKey(key) {
    const res = await fetch(API_URL + "/api/verify", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ key, deviceId })
    });
    return res.json();
  }

  async function activateKey(key) {
    const res = await fetch(API_URL + "/api/activate", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ key, deviceId })
    });
    return res.json();
  }

  // ===== BUTTON =====
  const status = document.getElementById("status");

  document.getElementById("pasteBtn").onclick = async () => {
    const text = await navigator.clipboard.readText();
    document.getElementById("keyInput").value = text;
  };

  document.getElementById("clearBtn").onclick = () => {
    document.getElementById("keyInput").value = "";
  };

  document.getElementById("copyBtn").onclick = () => {
    navigator.clipboard.writeText(deviceId);
    status.innerText = "📋 Đã copy UID";
  };

  document.getElementById("resetBtn").onclick = () => {
    localStorage.removeItem("vip_key");
    location.reload();
  };

  document.getElementById("checkBtn").onclick = async () => {
    const key = document.getElementById("keyInput").value;
    status.innerText = "Đang check...";

    const res = await verifyKey(key);
    if (res.ok) {
      status.innerText = "✅ Key hợp lệ";
    } else {
      status.innerText = "❌ " + (res.error || "Key lỗi");
    }
  };

  document.getElementById("activeBtn").onclick = async () => {
    const key = document.getElementById("keyInput").value;
    status.innerText = "Đang kích hoạt...";

    const res = await activateKey(key);
    if (res.ok) {
      localStorage.setItem("vip_key", key);
      status.innerText = "✅ Thành công!";
      setTimeout(() => {
        document.getElementById("eliteUI").remove();
        document.body.style.overflow = "auto";
      }, 800);
    } else {
      status.innerText = "❌ " + (res.error || "Kích hoạt lỗi");
    }
  };

  // ===== AUTO LOGIN =====
  (async () => {
    const key = localStorage.getItem("vip_key");
    if (!key) return;

    const res = await verifyKey(key);
    if (res.ok) {
      document.getElementById("eliteUI").remove();
      document.body.style.overflow = "auto";
    }
  })();

})();
