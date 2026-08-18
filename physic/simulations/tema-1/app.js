const $=s=>document.querySelector(s);
const tabs=[...document.querySelectorAll('.tab')];
const panels=[...document.querySelectorAll('.panel')];
tabs.forEach(t=>t.addEventListener('click',()=>{
  tabs.forEach(x=>x.classList.remove('active')); t.classList.add('active');
  panels.forEach(p=>p.classList.toggle('active-panel',p.id===t.dataset.tab));
  if(t.dataset.tab==='ohm') drawGraph();
  document.getElementById(t.dataset.tab)?.scrollIntoView({behavior:'smooth',block:'start'});
}));

function scrollToId(id){
  const t=document.querySelector(`.tab[data-tab="${id}"]`);
  if(t)t.click();
  document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});
}

const uRange=$('#uRange'), rRange=$('#rRange'), sw=$('#switch');
let selectedFlow='current';
document.querySelectorAll('.flow-choice').forEach(button=>button.addEventListener('click',()=>{
  selectedFlow=button.dataset.flow;
  document.querySelectorAll('.flow-choice').forEach(choice=>{
    const active=choice===button;
    choice.classList.toggle('active',active);
    choice.setAttribute('aria-pressed',String(active));
  });
  updateLab();
}));
function fmt(n,d=2){return n.toFixed(d).replace('.',',')}
function updateLab(){
  const U=+uRange.value,R=+rRange.value,closed=sw.checked,I=closed?U/R:0;
  $('#uOut').textContent=U+' В'; $('#rOut').textContent=R+' Ом';
  $('#uValue').textContent=fmt(U,1)+' В'; $('#rValue').textContent=fmt(R,1)+' Ом'; $('#iValue').textContent=fmt(I,2)+' А';
  $('#formulaValue').textContent=`${U} / ${R} = ${fmt(I,2)} А`;
  $('#status').className='status '+(closed?'on':'off');
  $('#status').textContent=closed?'● Коло замкнене — струм протікає':'○ Коло розімкнене — струму немає';
  $('#switchBlade').setAttribute('x2',closed?'330':'305');
  const circuitActive=closed&&U>0;
  const currentVisible=circuitActive&&selectedFlow==='current';
  const electronsVisible=circuitActive&&selectedFlow==='electrons';
  $('#currentFlow').classList.toggle('is-active',currentVisible);
  $('#currentFlow').classList.toggle('is-inactive',!currentVisible);
  $('#electronFlow').classList.toggle('is-active',electronsVisible);
  $('#electronFlow').classList.toggle('is-inactive',!electronsVisible);
  updateElectrons(closed,I);
  drawGraph();
}
[uRange,rRange,sw].forEach(x=>x.addEventListener('input',updateLab));

const eg=$('#electrons');
for(let i=0;i<20;i++){
  const c=document.createElementNS('http://www.w3.org/2000/svg','circle');
  c.setAttribute('r','4'); c.classList.add('electron'); eg.appendChild(c);
}
function updateElectrons(on,I){
  [...eg.children].forEach((c,i)=>{
    const active=on&&I>0&&selectedFlow==='electrons';
    const phase=(i/20)*1575 + performance.now()/4*(active?Math.min(2,0.4+I):0);
    const p=((phase%1575)+1575)%1575;
    let x,y;
    if(p<55){x=135-p;y=80}
    else if(p<255){x=80;y=80+(p-55)}
    else if(p<855){x=80+(p-255);y=280}
    else if(p<1055){x=680;y=280-(p-855)}
    else{x=680-(p-1055);y=80}
    c.setAttribute('cx',x);c.setAttribute('cy',y);
    c.style.opacity=active?'1':'0';
  });
}
function animate(){updateElectrons(sw.checked,sw.checked?(+uRange.value/+rRange.value):0);requestAnimationFrame(animate)} animate();

function drawGraph(){
  const canvas=$('#graph'); if(!canvas)return;
  const ctx=canvas.getContext('2d'),W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H); ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);
  const pad={l:65,r:25,t:25,b:55}, gw=W-pad.l-pad.r,gh=H-pad.t-pad.b;
  ctx.strokeStyle='#dce7e9';ctx.lineWidth=1;
  for(let i=0;i<=6;i++){let x=pad.l+gw*i/6;ctx.beginPath();ctx.moveTo(x,pad.t);ctx.lineTo(x,H-pad.b);ctx.stroke()}
  for(let i=0;i<=6;i++){let y=H-pad.b-gh*i/6;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(W-pad.r,y);ctx.stroke()}
  ctx.strokeStyle='#284b55';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(pad.l,H-pad.b);ctx.lineTo(W-pad.r,H-pad.b);ctx.stroke();
  ctx.beginPath();ctx.moveTo(pad.l,H-pad.b);ctx.lineTo(pad.l,pad.t);ctx.stroke();
  ctx.fillStyle='#365b64';ctx.font='16px Segoe UI';
  ctx.fillText('U, В',W-70,H-18);ctx.fillText('I, А',25,25);
  const R=+rRange.value,Umax=24,Imax=24/Math.max(R,1);
  ctx.fillStyle='#6a7e85';ctx.font='13px Segoe UI';
  for(let i=0;i<=6;i++){const u=Umax*i/6,x=pad.l+gw*i/6;ctx.fillText(fmt(u,0),x-7,H-pad.b+24)}
  for(let i=0;i<=6;i++){const ii=Imax*i/6,y=H-pad.b-gh*i/6;ctx.fillText(fmt(ii,2),pad.l-48,y+4)}
  ctx.strokeStyle='#0b9b99';ctx.lineWidth=4;ctx.beginPath();
  for(let k=0;k<=100;k++){const u=Umax*k/100,i=u/R;const x=pad.l+gw*k/100,y=H-pad.b-gh*(i/Imax);if(k===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)}
  ctx.stroke();
  ctx.fillStyle='#0b7779';ctx.font='bold 15px Segoe UI';ctx.fillText(`I = U / ${R} Ом`,pad.l+20,pad.t+22);
}

function randomExperiment(){rRange.value=[10,20,30,40,50,60,80][Math.floor(Math.random()*7)];uRange.value=6+Math.floor(Math.random()*19);sw.checked=true;updateLab()}

const questions=[
 ['Що є електричним струмом?',['Хаотичний рух частинок','Напрямлений рух заряджених частинок','Рух лише позитивних йонів'],'b'],
 ['Які дві умови потрібні для існування струму?',['Вільні заряджені частинки та електричне поле','Лише висока температура','Лише джерело світла'],'a'],
 ['Яка формула закону Ома для ділянки кола?',['I = UR','I = R/U','I = U/R'],'c'],
 ['Одиниця сили струму в SI:',['Вольт','Ампер','Ом'],'b'],
 ['Як підключають амперметр?',['Паралельно ділянці','Послідовно в коло','Не підключають до кола'],'b'],
 ['Як зміниться струм, якщо U збільшити, а R залишити сталою?',['Збільшиться','Зменшиться','Не зміниться'],'a']
];
function buildQuiz(){
  $('#quizBox').innerHTML=questions.map((q,i)=>`<div class="question"><p>${i+1}. ${q[0]}</p><div class="answers">${q[1].map((a,j)=>`<label><input type="radio" name="q${i}" value="${String.fromCharCode(97+j)}"> ${a}</label>`).join('')}</div></div>`).join('');
}
function checkQuiz(){
  let score=0;
  questions.forEach((q,i)=>{const a=document.querySelector(`input[name=q${i}]:checked`);if(a&&a.value===q[2])score++});
  const el=$('#quizResult');el.className='quiz-result '+(score>=5?'good':'bad');
  el.textContent=`Результат: ${score} / ${questions.length}`;
}
buildQuiz(); updateLab(); drawGraph();
