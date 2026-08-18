const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const fmt = (n, d = 2) => Number(n).toFixed(d).replace(".", ",");

function tab(id) {
  $$(".tab").forEach((x) => x.classList.toggle("active", x.dataset.tab === id));
  $$(".panel").forEach((x) => x.classList.toggle("active-panel", x.id === id));
  $("#" + id)?.scrollIntoView({ behavior: "smooth" });
}
$$(".tab").forEach((x) => (x.onclick = () => tab(x.dataset.tab)));
$$("[data-go]").forEach((x) => (x.onclick = () => tab(x.dataset.go)));

/* ---------------- ЙОНІЗАЦІЯ ---------------- */
const er = $("#energyRange"),
  gs = $("#gasSelect");
function updateIon() {
  const E = +er.value,
    Wi = +gs.value,
    ok = E >= Wi;
  $("#energyOut").textContent = fmt(E, 1) + " еВ";
  $("#ionStatus").textContent = ok
    ? "Йонізація відбувається"
    : "Недостатньо енергії";
  $("#ionResult").textContent = ok
    ? "Утворилися позитивний йон і вільний електрон"
    : "Йонізація не відбувається";
  $("#ionHint").textContent = ok ? "E ≥ Wᵢ" : "E < Wᵢ";
}
[er, gs].forEach((x) => (x.oninput = updateIon));

function drawIon(t) {
  const cn = $("#ionCanvas"),
    c = cn.getContext("2d"),
    E = +er.value,
    Wi = +gs.value,
    ok = E >= Wi;
  c.clearRect(0, 0, cn.width, cn.height);
  c.fillStyle = "#fbfefe";
  c.fillRect(0, 0, cn.width, cn.height);

  const atomX = 470,
    atomY = 235;
  c.fillStyle = "#697579";
  c.beginPath();
  c.arc(atomX, atomY, 38, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#d9e2e4";
  c.font = "700 15px Segoe UI";
  c.textAlign = "center";
  c.fillText("атом", atomX, atomY + 5);

  let x = 90 + ((t * (0.05 + E * 0.004)) % 380);
  if (x > 432) x = 432;

  c.fillStyle = "#1587b8";
  c.beginPath();
  c.arc(x, atomY, 13, 0, Math.PI * 2);
  c.fill();

  c.fillStyle = "#fff";
  c.font = "900 16px Segoe UI";
  c.fillText("−", x, atomY + 5);

  c.strokeStyle = "#70878e";
  c.lineWidth = 2;
  c.setLineDash([8, 7]);

  c.beginPath();
  c.moveTo(70, atomY);
  c.lineTo(atomX - 40, atomY);
  c.stroke();

  c.setLineDash([]);

  if (ok && x > 390) {
    c.fillStyle = "#e5654f";
    c.beginPath();
    c.arc(535, 195, 18, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#fff";
    c.font = "900 18px Segoe UI";
    c.fillText("+", 535, 201);
    c.fillStyle = "#1587b8";
    c.beginPath();
    c.arc(580, 270, 13, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#fff";
    c.fillText("−", 580, 275);
    c.fillStyle = "#e8b647";
    c.font = "900 28px Segoe UI";
    c.fillText("✦", 500, 170);
    c.fillStyle = "#355d66";
    c.font = "800 18px Segoe UI";
    c.fillText("ЙОНІЗАЦІЯ", 610, 145);
  } else {
    c.fillStyle = "#607a83";
    c.font = "700 17px Segoe UI";
    c.fillText("електрон наближається до атома", 250, 80);
  }
}

/* ---------------- ВАХ ---------------- */
const vr = $("#voltageRange"),
  ionSw = $("#ionizerSwitch");
function currentModel(U, on) {
  if (!on && U < 85) return 0;
  if (U < 35) return U / 100;
  if (U < 75) return 0.35;
  return 0.35 + Math.pow((U - 75) / 20, 2.2) * 0.7;
}
function updateDischarge() {
  const U = +vr.value,
    on = ionSw.checked,
    I = currentModel(U, on);
  $("#voltageOut").textContent = U + " В";
  $("#currentOut").textContent = "I ≈ " + fmt(I, 2) + " ум. од.";
  let mode = "";
  if (!on && U < 85) mode = "Розряду немає";
  else if (U < 75) mode = "Несамостійний розряд";
  else mode = "Самостійний розряд";
  $("#dischargeMode").textContent = mode;
  $("#sparkText").textContent =
    mode === "Самостійний розряд"
      ? "Електронна лавина підтримує розряд без зовнішнього йонізатора"
      : mode === "Несамостійний розряд"
        ? "Газ проводить завдяки зовнішньому йонізатору"
        : "Без зовнішнього йонізатора газ не проводить";
}
[vr, ionSw].forEach((x) => (x.oninput = updateDischarge));

function drawVAC() {
  const cn = $("#vacCanvas"),
    c = cn.getContext("2d"),
    p = { l: 72, r: 35, t: 35, b: 60 },
    w = cn.width - p.l - p.r,
    h = cn.height - p.t - p.b;
  c.clearRect(0, 0, cn.width, cn.height);
  c.fillStyle = "#fff";
  c.fillRect(0, 0, cn.width, cn.height);
  c.strokeStyle = "#dce7e9";
  c.lineWidth = 1;
  for (let i = 0; i <= 6; i++) {
    let x = p.l + (w * i) / 6,
      y = p.t + (h * i) / 6;
    c.beginPath();
    c.moveTo(x, p.t);
    c.lineTo(x, p.t + h);
    c.stroke();
    c.beginPath();
    c.moveTo(p.l, y);
    c.lineTo(p.l + w, y);
    c.stroke();
  }
  c.strokeStyle = "#385e66";
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(p.l, p.t + h);
  c.lineTo(p.l + w, p.t + h);
  c.moveTo(p.l, p.t + h);
  c.lineTo(p.l, p.t);
  c.stroke();
  c.fillStyle = "#385e66";
  c.font = "16px Segoe UI";
  c.fillText("U", cn.width - 45, cn.height - 18);
  c.fillText("I", 30, 35);

  c.strokeStyle = "#0b9493";
  c.lineWidth = 4;
  c.beginPath();
  for (let U = 0; U <= 120; U += 2) {
    let I = currentModel(U, true),
      x = p.l + (w * U) / 120,
      y = p.t + h - (h * Math.min(I, 1.5)) / 1.5;
    if (U === 0) c.moveTo(x, y);
    else c.lineTo(x, y);
  }
  c.stroke();

  const U = +vr.value,
    I = currentModel(U, ionSw.checked),
    x = p.l + (w * U) / 120,
    y = p.t + h - (h * Math.min(I, 1.5)) / 1.5;
  c.fillStyle = "#e45a47";
  c.beginPath();
  c.arc(x, y, 8, 0, Math.PI * 2);
  c.fill();

  c.fillStyle = "#607a83";
  c.font = "700 14px Segoe UI";
  c.fillText("слабке поле", p.l + 35, p.t + h - 60);
  c.fillText("насичення", p.l + 245, p.t + h - 145);
  c.fillText("лавина", p.l + 560, p.t + 60);
}

const particles = Array.from({ length: 28 }, (_, i) => ({
  x: 170 + ((i * 67) % 740),
  y: 125 + ((i * 83) % 210),
  type: i % 3,
}));
function drawGas(t) {
  const cn = $("#gasCanvas"),
    c = cn.getContext("2d"),
    U = +vr.value,
    on = ionSw.checked,
    active = on || U >= 85;
  c.clearRect(0, 0, cn.width, cn.height);
  c.fillStyle = "#fbfefe";
  c.fillRect(0, 0, cn.width, cn.height);

  c.fillStyle = "#df5a64";
  c.fillRect(80, 65, 940, 12);
  c.fillStyle = "#23a9cf";
  c.fillRect(80, 350, 940, 12);
  c.fillStyle = "#bd3947";
  c.font = "900 18px Segoe UI";
  c.textAlign = "left";
  c.fillText("+ + + + +  АНОД  + + + + +", 95, 52);
  c.fillStyle = "#1689ad";
  c.fillText("− − − − −  КАТОД  − − − − −", 95, 395);

  const speed = 0.012 * U;
  particles.forEach((p, i) => {
    let y = p.y;
    if (active) {
      if (p.type === 0)
        y = 90 + ((((p.y - 90 + t * speed) % 250) + 250) % 250); // positive ion to cathode
      else if (p.type === 1)
        y = 340 - ((((340 - p.y + t * speed * 1.3) % 250) + 250) % 250); // electron to anode
      else y = 340 - ((((340 - p.y + t * speed * 0.7) % 250) + 250) % 250); // negative ion to anode
    }
    const x = p.x;
    if (p.type === 0) {
      c.fillStyle = "#e5654f";
      c.beginPath();
      c.arc(x, y, 14, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#fff";
      c.font = "900 15px Segoe UI";
      c.textAlign = "center";
      c.fillText("+", x, y + 5);
    } else {
      c.fillStyle = "#1587b8";
      c.beginPath();
      c.arc(x, y, 10, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#fff";
      c.font = "900 13px Segoe UI";
      c.textAlign = "center";
      c.fillText("−", x, y + 4);
    }
  });

  if (U >= 85) {
    c.strokeStyle = "#e8b647";
    c.lineWidth = 3;
    for (let k = 0; k < 7; k++) {
      let x = 170 + k * 120;
      c.beginPath();
      c.moveTo(x, 320);
      c.lineTo(x + 35, 270);
      c.lineTo(x + 18, 220);
      c.lineTo(x + 60, 160);
      c.stroke();
    }
  }
}

/* ---------------- ВИДИ РОЗРЯДІВ ---------------- */
const typeInfo = {
  spark:
    "<b>Іскровий розряд.</b> Виникає за атмосферного тиску та великої напруги. Має вигляд яскравих зигзагоподібних каналів. Приклади: блискавка, свічка запалювання.",
  glow: "<b>Тліючий розряд.</b> Виникає за низького тиску і невеликої напруги. Застосовується у газорозрядних лампах і рекламних трубках.",
  arc: "<b>Дуговий розряд.</b> Виникає за високої температури та великої сили струму. Використовується в електрозварюванні та електропечах.",
  corona:
    "<b>Коронний розряд.</b> Виникає у сильно неоднорідному електричному полі біля гострих електродів. Використовується в електрофільтрах.",
};
$$("[data-type]").forEach(
  (card) =>
    (card.onclick = () => {
      $$("[data-type]").forEach((x) => x.classList.remove("active"));
      card.classList.add("active");
      $("#typeDetail").innerHTML = typeInfo[card.dataset.type];
    }),
);

/* ---------------- ЗАДАЧА ---------------- */
const wir = $("#wiRange");
function calcSpeed() {
  const wiEv = +wir.value,
    wiJ = wiEv * 1.6e-19,
    me = 9.1e-31,
    v = Math.sqrt((2 * wiJ) / me);
  $("#wiOut").textContent = fmt(wiEv, 1) + " еВ";
  $("#jouleValue").textContent =
    "Wᵢ = " + (wiJ / 1e-18).toFixed(2).replace(".", ",") + "·10⁻¹⁸ Дж";
  $("#speedValue").textContent =
    "v ≈ " + (v / 1e6).toFixed(2).replace(".", ",") + "·10⁶ м/с";
}
wir.oninput = calcSpeed;

/* ---------------- ТЕСТ ---------------- */
const qs = [
  [
    "За звичайних умов газ переважно є:",
    ["провідником", "діелектриком", "надпровідником"],
    "b",
  ],
  [
    "Процес утворення йонів і вільних електронів у газі називають:",
    ["йонізацією", "рекомбінацією", "поляризацією"],
    "a",
  ],
  [
    "Позитивні йони в електричному полі рухаються:",
    ["до катода", "до анода", "хаотично"],
    "a",
  ],
  [
    "Електрони в електричному полі рухаються:",
    ["до катода", "до анода", "не рухаються"],
    "b",
  ],
  [
    "Розряд, що існує лише за дії зовнішнього йонізатора:",
    ["самостійний", "несамостійний", "дуговий"],
    "b",
  ],
  [
    "Який розряд спостерігаємо у блискавці?",
    ["тліючий", "іскровий", "дуговий"],
    "b",
  ],
  [
    "Який розряд використовують під час електрозварювання?",
    ["дуговий", "коронний", "тліючий"],
    "a",
  ],
];
function build() {
  $("#quizBox").innerHTML = qs
    .map(
      (q, i) =>
        `<article class="question"><p>${i + 1}. ${q[0]}</p><div class="answers">${q[1].map((a, j) => `<label><input type="radio" name="q${i}" value="${String.fromCharCode(97 + j)}"> ${a}</label>`).join("")}</div></article>`,
    )
    .join("");
}
$("#check").onclick = () => {
  let s = 0;
  qs.forEach((q, i) => {
    const a = $(`input[name=q${i}]:checked`),
      card = $$(".question")[i],
      ok = a?.value === q[2];
    card.className = "question " + (ok ? "correct" : "wrong");
    if (ok) s++;
  });
  $("#result").textContent = `Результат: ${s} / ${qs.length}`;
  $("#result").className = s >= 6 ? "good" : "bad";
};
$("#reset").onclick = () => {
  build();
  $("#result").textContent = "";
};

/* ---------------- АНІМАЦІЯ ---------------- */
function animate(t) {
  drawIon(t);
  drawVAC();
  drawGas(t);
  requestAnimationFrame(animate);
}

build();
updateIon();
updateDischarge();
calcSpeed();
requestAnimationFrame(animate);
