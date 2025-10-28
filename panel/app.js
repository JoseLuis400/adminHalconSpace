// Demo app.js — simula todo localmente. Más abajo hay instrucciones para conectar con Firestore.

const el = id => document.getElementById(id);
const fmt = n => (Math.round(n*100)/100).toFixed(2);

// ---------- Reloj local ----------
function startLocalClock(){
  const c = el('local-clock');
  setInterval(()=>{
    const d = new Date();
    c.textContent = d.toLocaleTimeString();
  }, 500);
}
startLocalClock();

// ---------- Cuenta regresiva ----------
let countdownInterval = null;
let countdownTarget = null;
function setCountdownMinutes(min){
  const now = Date.now();
  countdownTarget = now + min*60*1000;
  updateCountdownDisplay();
}
function updateCountdownDisplay(){
  if(!countdownTarget){ el('countdown').textContent = '00:00:00'; return; }
  const rem = Math.max(0, countdownTarget - Date.now());
  const s = Math.floor(rem/1000);
  const hh = String(Math.floor(s/3600)).padStart(2,'0');
  const mm = String(Math.floor((s%3600)/60)).padStart(2,'0');
  const ss = String(s%60).padStart(2,'0');
  el('countdown').textContent = `${hh}:${mm}:${ss}`;
  if(rem===0){
    clearInterval(countdownInterval);
    countdownInterval=null;
    flashMessage('Cuenta regresiva finalizada — CHECK GO/NO GO');
  }
}
el('start-count').addEventListener('click', ()=>{
  const m = Number(el('countdown-min').value)||10;
  setCountdownMinutes(m);
  if(countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(updateCountdownDisplay, 250);
});
el('stop-count').addEventListener('click', ()=>{
  if(countdownInterval) clearInterval(countdownInterval);
  countdownInterval = null;
  countdownTarget = null;
  updateCountdownDisplay();
});

// ---------- GO / NO GO ----------
const stationsData = [
  {id:'range', name:'Rango de lanzamiento', status:'GO'},
  {id:'weather', name:'Meteorología', status:'GO'},
  {id:'tracking', name:'Tracking', status:'GO'},
  {id:'ground', name:'Sistemas terrestres', status:'GO'},
  {id:'flight', name:'Equipo de vuelo', status:'GO'}
];
function renderStations(){
  const container = el('stations');
  container.innerHTML = '';
  stationsData.forEach(s => {
    const div = document.createElement('div');
    div.className = 'station';
    div.innerHTML = `
      <div class="left"><strong>${s.name}</strong></div>
      <div class="right">
        <span class="dot ${s.status==='GO'?'go':'nogo'}"></span>
        <button data-id="${s.id}" class="toggle">${s.status==='GO'?'Set NO GO':'Set GO'}</button>
      </div>
    `;
    container.appendChild(div);
    div.querySelector('button').addEventListener('click', (ev)=>{
      toggleStation(ev.target.dataset.id);
    });
  });
}
function toggleStation(id){
  const s = stationsData.find(x=>x.id===id);
  if(!s) return;
  s.status = s.status==='GO'?'NO GO':'GO';
  renderStations();
  broadcastStatus();
}
renderStations();

// ---------- Telemetría simulada ----------
let telemetry = {alt:120, vel:1500, pitch:2.2, fuel:100};
function simulateTelemetryTick(){
  telemetry.alt += (Math.random()-0.45)*4;
  telemetry.vel += (Math.random()-0.5)*20;
  telemetry.pitch += (Math.random()-0.5)*0.2;
  telemetry.fuel = Math.max(0, telemetry.fuel - Math.random()*0.12);
  updateTelemetryUI();
  logTelemetry(`${new Date().toLocaleTimeString()} — alt ${fmt(telemetry.alt)} m | vel ${fmt(telemetry.vel)} m/s | fuel ${fmt(telemetry.fuel)}%`);
}
function updateTelemetryUI(){
  el('alt').textContent = `${fmt(telemetry.alt)} m`;
  el('vel').textContent = `${fmt(telemetry.vel)} m/s`;
  el('pitch').textContent = `${fmt(telemetry.pitch)}°`;
  el('fuel').textContent = `${fmt(telemetry.fuel)}%`;
}
function logTelemetry(txt){
  const l = el('telemetry-log');
  const p = document.createElement('div');
  p.textContent = txt;
  l.prepend(p);
  while(l.children.length>120) l.removeChild(l.lastChild);
}
let telemetryLoop = setInterval(simulateTelemetryTick, 3000);
el('simulate-update').addEventListener('click', simulateTelemetryTick);

// ---------- Reset ----------
function resetDemo(){
  stationsData.forEach(s=>s.status='GO');
  renderStations();
  telemetry={alt:120,vel:1500,pitch:2.2,fuel:100};
  updateTelemetryUI();
  el('telemetry-log').innerHTML='';
  if(countdownInterval) { clearInterval(countdownInterval); countdownInterval=null; }
  countdownTarget=null; updateCountdownDisplay();
}
el('reset').addEventListener('click', resetDemo);

// ---------- Simulación de broadcast ----------
function broadcastStatus(){
  const snapshot = {
    stations: stationsData.map(s=>({id:s.id,name:s.name,status:s.status})),
    telemetry: {...telemetry},
    updated: Date.now()
  };
  console.log('Broadcast (simulado):', snapshot);
  flashMessage('Estado actualizado (simulado)');
}

// ---------- UI helper ----------
function flashMessage(msg){
  const elb = document.createElement('div');
  elb.textContent = msg;
  elb.style.position='fixed'; elb.style.left='50%';
  elb.style.transform='translateX(-50%)';
  elb.style.bottom='24px';
  elb.style.padding='10px 14px';
  elb.style.background='rgba(11,17,29,0.9)';
  elb.style.border='1px solid rgba(255,255,255,0.03)';
  elb.style.borderRadius='8px';
  elb.style.zIndex=9999;
  document.body.appendChild(elb);
  setTimeout(()=>elb.remove(),1700);
}

// ---------- Firestore (para futuro) ----------
/*
// <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore-compat.js"></script>

const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "PROJECT_ID.firebaseapp.com",
  projectId: "PROJECT_ID",
  storageBucket: "PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// firebase.initializeApp(firebaseConfig);
// const db = firebase.firestore();

// db.collection('mission_control').doc('halcon_current').set(snapshot);
*/
