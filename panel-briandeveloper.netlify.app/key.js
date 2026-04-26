const API_URL = "https://api-server-key.tranphat1357t.workers.dev";

// ===== DEVICE ID =====
function getDeviceId() {
  let id = localStorage.getItem("device_id");
  if (!id) {
    id = "DEV-" + Math.random().toString(36).substring(2, 10);
    localStorage.setItem("device_id", id);
  }
  return id;
}

// ===== UI LOCK =====
// ===== UI LOCK (UPGRADE) =====
const overlay = document.createElement("div");
overlay.innerHTML = `
<style>
#lockScreen {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: radial-gradient(circle at top, #1a0033, #000);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999999;
  font-family: 'Poppins', sans-serif;
}

.vip-box {
  background: rgba(255,255,255,0.05);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  backdrop-filter: blur(15px);
  box-shadow: 0 0 40px rgba(170, 0, 255, 0.5);
  width: 320px;
  animation: fadeIn 0.8s ease;
}

.vip-title {
  font-size: 28px;
  font-weight: bold;
  color: #d580ff;
  text-shadow: 0 0 10px #b84dff;
  margin-bottom: 20px;
}

.vip-input {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: none;
  outline: none;
  text-align: center;
  margin-bottom: 15px;
  background: rgba(255,255,255,0.1);
  color: #fff;
}

.vip-input::placeholder {
  color: #ccc;
}

.vip-btn {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(45deg, #8a2be2, #c084fc);
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
  box-shadow: 0 0 15px #a64dff;
}

.vip-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 25px #cc99ff;
}

.vip-msg {
  margin-top: 10px;
  font-size: 14px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

<div id="lockScreen">
  <div class="vip-box">
    <div class="vip-title">💜 KEY LOGIN</div>
    
    <input id="keyInput" class="vip-input" placeholder="VIP-XXXX-XXXX" />
    
    <button id="submitKey" class="vip-btn">XÁC NHẬN</button>
    
    <p id="msg" class="vip-msg"></p>
  </div>
</div>
`;

document.body.appendChild(overlay);
document.body.style.overflow = "hidden";


// ===== API =====
async function verifyKey(key) {
  const res = await fetch(API_URL + "/api/verify", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      key,
      deviceId: getDeviceId()
    })
  });
  return res.json();
}



async function activateKey(key, deviceId) {
  const res = await fetch(API_URL + "/api/activate", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ key, deviceId })
  });
  return res.json();
}

// ===== UNLOCK =====
function unlock() {
  document.getElementById("lockScreen")?.remove();
  document.body.style.overflow = "auto";
}
function logout(reason = "KEY_INVALID") {
  localStorage.removeItem("vip_key");

  // hiện lại lock screen
  if (!document.getElementById("lockScreen")) {
    document.body.appendChild(overlay);
  }

  document.body.style.overflow = "hidden";

  const msg = document.getElementById("msg");
  if (msg) {
    msg.innerText = "🔒 Đã đăng xuất: " + reason;
  }
}


// ===== LOGIN FLOW =====
document.getElementById("submitKey").onclick = async () => {
  const key = document.getElementById("keyInput").value;
  const msg = document.getElementById("msg");

  msg.innerText = "Đang kiểm tra...";

  const v = await verifyKey(key);
  if (!v.ok) {
    msg.innerText = "❌ Key sai hoặc hết hạn";
    return;
  }

  const deviceId = getDeviceId();
  const a = await activateKey(key, deviceId);

  if (!a.ok) {
    msg.innerText = "❌ Key đã dùng trên thiết bị khác";
    return;
  }

  localStorage.setItem("vip_key", key);

  msg.innerText = "✅ Thành công!";
  setTimeout(unlock, 500);
};

// ===== AUTO LOGIN =====
(async () => {
  const key = localStorage.getItem("vip_key");
  if (!key) return;

  const v = await verifyKey(key);
  if (!v.ok) {
   logout(v.error);
   return;
  }


  unlock();

  // ===== ANTI BYPASS (check mỗi 5s) =====
setInterval(async () => {
  const key = localStorage.getItem("vip_key");
  if (!key) return;

  const res = await verifyKey(key);

  if (!res.ok) {
    if (["REVOKED","EXPIRED","DEVICE_NOT_BOUND"].includes(res.error)) {
      logout(res.error);
    }
  }

}, 5000);


})();

// ===== BASIC ANTI DEVTOOLS =====
document.addEventListener("keydown", e => {
  if (e.key === "F12") e.preventDefault();
  if (e.ctrlKey && e.shiftKey && ["I","J","C"].includes(e.key)) e.preventDefault();
});

document.addEventListener("contextmenu", e => e.preventDefault());
