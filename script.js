// ---------- Navegación de escenas ----------
const s1 = document.getElementById("scene1");
const s3 = document.getElementById("scene3");

document.getElementById("btnStart").addEventListener("click", () => {
  showScene(3);
});

document.getElementById("btnRestart").addEventListener("click", () => {
  showScene(1);
});

function showScene(n){
  [s1,s3].forEach(x => x.classList.remove("active"));
  if(n===1) s1.classList.add("active");
  if(n===3) s3.classList.add("active");

  requestAnimationFrame(() => {
    if (n === 3) resizeLine();
  });
}

// ---------- SCENE 3: Rosa “line art” animada ----------
const cl = document.getElementById("lineRose");
const lctx = cl.getContext("2d");
let lDpr = 1;

function resizeLine(){
  if(!cl) return;
  const rect = cl.getBoundingClientRect();
  lDpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
  cl.width = Math.floor(rect.width * lDpr);
  cl.height = Math.floor(rect.height * lDpr);
  lctx.setTransform(lDpr,0,0,lDpr,0,0);
  lctx.imageSmoothingEnabled = true;
}
window.addEventListener("resize", () => {
  if (s3.classList.contains("active")) resizeLine();
});
resizeLine();

function drawLineRose(t){
  const w = cl.getBoundingClientRect().width;
  const h = cl.getBoundingClientRect().height;

  lctx.clearRect(0,0,w,h);

  // fondo suave
  lctx.fillStyle = "rgba(0,0,0,0.55)";
  lctx.fillRect(0,0,w,h);

  const cx = w*0.5;
  const cy = h*0.40;

  // tallo
  lctx.lineWidth = 6;
  lctx.strokeStyle = "#1f8f4e";
  lctx.lineCap = "round";
  lctx.beginPath();
  lctx.moveTo(cx, cy+60);
  lctx.quadraticCurveTo(cx-8, cy+150, cx, cy+260);
  lctx.stroke();

  // hoja
  lctx.fillStyle = "#1f8f4e";
  lctx.beginPath();
  lctx.ellipse(cx-40, cy+150, 36, 14, -0.6, 0, Math.PI*2);
  lctx.fill();

  // pétalos con líneas
  const petals = 14;
  for(let i=0;i<petals;i++){
    const ang = (Math.PI*2/petals)*i + Math.sin(t*0.001)*0.2;
    drawPetalLines(cx, cy, ang, t, i);
  }

  // brillo leve
  const g = lctx.createRadialGradient(cx, cy, 10, cx, cy, 220);
  g.addColorStop(0, "rgba(255,46,110,0.18)");
  g.addColorStop(1, "rgba(255,46,110,0)");
  lctx.fillStyle = g;
  lctx.fillRect(0,0,w,h);
}

function drawPetalLines(cx, cy, ang, t, i){
  const baseR = 40;
  const layers = 10;
  const wob = 0.6*Math.sin(t*0.0015 + i);

  lctx.save();
  lctx.translate(cx, cy);
  lctx.rotate(ang);

  for(let k=0;k<layers;k++){
    const r1 = baseR + k*7;
    const r2 = 18 + k*2.8;
    const a = 0.14 + k*0.05;

    lctx.strokeStyle = `rgba(255,40,90,${a})`;
    lctx.lineWidth = 2;

    lctx.beginPath();
    lctx.moveTo(0, 0);
    lctx.bezierCurveTo(r1*0.35, -r2, r1*0.75, -r2*0.55, r1+wob, 0);
    lctx.bezierCurveTo(r1*0.75, r2*0.55, r1*0.35, r2, 0, 0);
    lctx.stroke();
  }

  lctx.restore();
}

function lineLoop(t){
  if(s3.classList.contains("active")) drawLineRose(t);
  requestAnimationFrame(lineLoop);
}
requestAnimationFrame(lineLoop);

// ---------- Overlay: palabras + corazones ----------
const overlay = document.getElementById("overlay");
const btnTouch = document.getElementById("btnTouch");

const words = [
  "LA QUIERO", "Mi traviesa", "Mi enojada", "Mi preciosa",
  "Mi nena", "Mi mujer", "Mi patrona",
  "Mi Laura", "Mi preciosa la quiero",
  "Lo hice con mucho amor", "Espero le guste"
];

let burstTimer = null;

btnTouch.addEventListener("click", () => {
  startBurst(2600); // duración del show (ms)
});

function startBurst(durationMs){
  overlay.classList.add("on");

  // Si ya estaba corriendo, reinicia
  if (burstTimer) clearTimeout(burstTimer);

  // Genera ráfagas rápidas
  const start = performance.now();
  const interval = setInterval(() => {
    const now = performance.now();
    if (now - start > durationMs) {
      clearInterval(interval);
      // apaga overlay luego de un poquito para que terminen animaciones
      burstTimer = setTimeout(() => overlay.classList.remove("on"), 450);
      return;
    }
    spawnBatch();
  }, 120);
}

function spawnBatch(){
  // Palabras por toda la pantalla
  const countWords = 12; // sube/baja para más/menos
  for(let i=0;i<countWords;i++){
    spawnWord();
  }

  // Corazones
  const countHearts = 14;
  for(let i=0;i<countHearts;i++){
    spawnHeart();
  }
}

function spawnWord(){
  const el = document.createElement("div");
  el.className = "burstWord";
  el.textContent = words[Math.floor(Math.random()*words.length)];

  const x = Math.random()*window.innerWidth;
  const y = Math.random()*window.innerHeight;

  el.style.left = `${x}px`;
  el.style.top = `${y}px`;

  // Tamaño variado
  const size = 14 + Math.random()*22; // 14..36
  el.style.fontSize = `${size}px`;

  // Color con variación suave
  const alpha = 0.55 + Math.random()*0.40; // 0.55..0.95
  // tonos rosados/blancos
  const variant = Math.random();
  if (variant < 0.35) el.style.color = `rgba(255,209,231,${alpha})`;
  else if (variant < 0.70) el.style.color = `rgba(255,77,179,${alpha})`;
  else el.style.color = `rgba(255,255,255,${alpha})`;

  // Rotación random ligera
  const rot = (Math.random()*22 - 11);
  el.style.transform = `translate(-50%,-50%) rotate(${rot}deg)`;

  overlay.appendChild(el);
  setTimeout(() => el.remove(), 2700);
}

function spawnHeart(){
  const el = document.createElement("div");
  el.className = "burstHeart";

  const x = Math.random()*window.innerWidth;
  const y = window.innerHeight * (0.45 + Math.random()*0.55); // más hacia abajo para “subir”

  el.style.left = `${x}px`;
  el.style.top = `${y}px`;

  const s = 0.8 + Math.random()*1.4;
  el.style.transform = `translate(-50%,-50%) rotate(45deg) scale(${s})`;

  overlay.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}
