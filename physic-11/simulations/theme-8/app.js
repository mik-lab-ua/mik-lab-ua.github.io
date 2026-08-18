const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const fmt=(n,d=2)=>Number(n).toFixed(d).replace('.',',');

function tab(id){
  $$('.tab').forEach(x=>x.classList.toggle('active',x.dataset.tab===id));
  $$('.panel').forEach(x=>x.classList.toggle('active-panel',x.id===id));
  $('#'+id)?.scrollIntoView({behavior:'smooth'});
}
$$('.tab').forEach(x=>x.onclick=()=>tab(x.dataset.tab));
$$('[data-go]').forEach(x=>x.onclick=()=>tab(x.dataset.go));

/* ---------------- ТЕРМОЕЛЕКТРОННА ЕМІСІЯ ---------------- */
const tr=$('#tempRange'), metal=$('#metalSelect');

const metalData={
  "2.5":{name:"Барій",A:2.5,ease:1.00},
  "2.1":{name:"Стронцій",A:2.1,ease:1.18},
  "4.5":{name:"Вольфрам",A:4.5,ease:.42},
  "4.7":{name:"Мідь",A:4.7,ease:.34}
};

function thermalLevel(T){
  return Math.max(0,Math.min(1,(T-500)/2100));
}

function emissionStrength(T,A){
  const th=thermalLevel(T);
  const m=metalData[String(A)] || {ease:.6};
  const threshold=(A-1.7)/4.0;
  const excess=th-threshold+.12;
  if(excess<=0) return 0;
  return Math.max(0,Math.min(1,Math.pow(excess*2.15,1.55)*m.ease));
}

function updateEmission(){
  const T=+tr.value,A=+metal.value;
  const info=metalData[String(A)];
  const th=thermalLevel(T),s=emissionStrength(T,A);
  const workNorm=Math.max(.08,Math.min(1,(A-1.7)/3.3));

  $('#tempOut').textContent=T+' °C';
  $('#workOut').textContent=fmt(A,1)+' еВ';
  $('#thermalEnergyText').textContent=fmt(.3+th*4.7,1)+' ум. од.';
  $('#thermalBar').style.width=(8+th*92)+'%';
  $('#workBar').style.width=(8+workNorm*92)+'%';

  const box=$('#thresholdBox');
  if(s<.06){
    box.classList.remove('on');
    $('#thresholdText').innerHTML='E<sub>умовн</sub> &lt; A<sub>вих</sub>';
    $('#thresholdCaption').textContent=`Для ${info.name.toLowerCase()} за цієї температури емісія майже відсутня`;
    $('#emissionStatus').textContent='Електрони не залишають метал';
    $('#emissionValue').textContent='Емісія майже відсутня';
    $('#emissionExplain').textContent='Більшість електронів не має достатньої енергії, щоб залишити поверхню.';
  }else if(s<.30){
    box.classList.add('on');
    $('#thresholdText').innerHTML='E<sub>умовн</sub> ≈ A<sub>вих</sub>';
    $('#thresholdCaption').textContent='Лише найенергійніші електрони залишають поверхню';
    $('#emissionStatus').textContent='Починається емісія';
    $('#emissionValue').textContent='Вилітають окремі електрони';
    $('#emissionExplain').textContent='Частина електронів уже долає поверхневий бар’єр.';
  }else{
    box.classList.add('on');
    $('#thresholdText').innerHTML='E<sub>умовн</sub> ≥ A<sub>вих</sub>';
    $('#thresholdCaption').textContent=`Для ${info.name.toLowerCase()} емісія стала інтенсивною`;
    $('#emissionStatus').textContent='Інтенсивна термоелектронна емісія';
    $('#emissionValue').textContent='Утворюється густа електронна хмара';
    $('#emissionExplain').textContent='Зі збільшенням температури дедалі більше електронів залишає метал.';
  }
}
[tr,metal].forEach(x=>x.oninput=updateEmission);

const metalElectrons=Array.from({length:36},(_,i)=>({
  x:125+(i*71)%605,y:337+(i*31)%55,ph:i*83
}));
const emittedElectrons=Array.from({length:38},(_,i)=>({
  x:135+(i*79)%585,ph:i*137,lane:i%8
}));

function drawEmission(t){
  const cn=$('#emissionCanvas'),c=cn.getContext('2d'),T=+tr.value,A=+metal.value;
  const info=metalData[String(A)],th=thermalLevel(T),s=emissionStrength(T,A);

  c.clearRect(0,0,cn.width,cn.height);
  c.fillStyle='#fbfefe';c.fillRect(0,0,cn.width,cn.height);
  c.textAlign='center';

  c.fillStyle='#607a83';c.font='800 15px Segoe UI';
  c.fillText('ВАКУУМ',430,38);
  c.fillText(`${info.name.toUpperCase()} · Aвих = ${fmt(A,1)} еВ`,430,466);

  c.fillStyle='#747b7d';c.fillRect(80,320,700,105);
  c.fillStyle=`rgba(255,116,44,${.08+.50*th})`;c.fillRect(80,320,700,20);
  c.strokeStyle='#4e595d';c.lineWidth=3;
  c.beginPath();c.moveTo(80,320);c.lineTo(780,320);c.stroke();

  for(let i=0;i<11;i++){
    const x=115+i*63,y=392;
    c.fillStyle='#e56b55';c.beginPath();c.arc(x,y,18,0,Math.PI*2);c.fill();
    c.fillStyle='#fff';c.font='900 17px Segoe UI';c.fillText('+',x,y+6);
  }

  metalElectrons.forEach(p=>{
    const amp=3+19*th;
    const x=p.x+Math.sin((t+p.ph)/(200-85*th))*amp;
    const y=p.y+Math.cos((t+p.ph)/(175-65*th))*amp*.55;
    c.fillStyle='#1687b7';c.beginPath();c.arc(x,y,8,0,Math.PI*2);c.fill();
    c.fillStyle='#fff';c.font='900 11px Segoe UI';c.fillText('−',x,y+4);
  });

  const emittedCount=Math.floor(s*34);
  emittedElectrons.slice(0,emittedCount).forEach((p,i)=>{
    const speed=.045+.055*th;
    const cycle=((t*speed+p.ph)%560);
    const rise=Math.min(1,cycle/300);
    let y=315-rise*(85+105*(i%5)/4);
    let x=p.x+Math.sin((t+p.ph)/500)*18;
    if(cycle>300){
      y=132+(p.lane*19)+Math.sin((t+p.ph)/620)*14;
      x=p.x+Math.sin((t+p.ph)/430)*24;
    }
    c.fillStyle='#1587b8';c.beginPath();c.arc(x,y,9,0,Math.PI*2);c.fill();
    c.fillStyle='#fff';c.font='900 12px Segoe UI';c.fillText('−',x,y+4);
    if(cycle<300){
      c.strokeStyle='rgba(21,135,184,.25)';c.lineWidth=1;
      c.beginPath();c.moveTo(x,317);c.lineTo(x,y+11);c.stroke();
    }
  });

  c.fillStyle='#355d66';c.font='800 16px Segoe UI';
  if(s<.06){
    c.fillText('Електрони рухаються швидше, але поверхню майже не залишають',430,88);
    c.fillStyle='#b65349';c.font='900 18px Segoe UI';
    c.fillText('емісія майже відсутня',430,116);
  }else{
    c.fillText('найенергійніші електрони долають поверхневий бар’єр',430,82);
    c.strokeStyle='#0d9998';c.lineWidth=3;
    for(let k=0;k<4;k++){
      const x=310+k*80;
      c.beginPath();c.moveTo(x,292);c.lineTo(x,232);c.stroke();
      c.beginPath();c.moveTo(x,232);c.lineTo(x-7,245);c.moveTo(x,232);c.lineTo(x+7,245);c.stroke();
    }
    c.fillStyle='#0b7d80';c.font='900 16px Segoe UI';
    c.fillText('ЕЛЕКТРОННА ХМАРА',430,112);
  }

  c.textAlign='left';c.fillStyle='#607a83';c.font='700 13px Segoe UI';
  c.fillText('Інтенсивність емісії',650,72);
  c.fillStyle='#e4edef';c.fillRect(650,82,150,14);
  c.fillStyle='#0d9998';c.fillRect(650,82,150*s,14);
  c.fillStyle='#355d66';c.font='800 13px Segoe UI';
  c.fillText(Math.round(s*100)+' %',806,94);
}

/* ---------------- ВАКУУМНИЙ ДІОД ---------------- */
const dur=$('#diodeURange'), hr=$('#heatRange');
function diodeCurrent(U,H){
  if(U<=0 || H<=0) return 0;
  const Imax=(H/100)*10;
  return Imax*Math.pow(U/100,2.15);
}
function updateDiode(){
  const U=+dur.value,H=+hr.value,I=diodeCurrent(U,H);
  $('#diodeUOut').textContent=U+' В';
  $('#heatOut').textContent=H+' %';
  $('#diodeIOut').textContent='I = '+fmt(I,2)+' мА';
  const direct=U>0;
  $('#biasText').textContent=direct?'Пряме ввімкнення':'Зворотне ввімкнення';
  $('#conductText').textContent=direct
    ? 'Електрони рухаються від катода до анода'
    : 'Електричне поле повертає електрони до катода — струму практично немає';
}
[dur,hr].forEach(x=>x.oninput=updateDiode);

const eDiode=Array.from({length:24},(_,i)=>({x:230+(i*47)%380,y:150+(i*61)%220,ph:i*91}));
function drawDiode(t){
  const cn=$('#diodeCanvas'),c=cn.getContext('2d'),U=+dur.value,H=+hr.value,direct=U>0,active=H>3;
  c.clearRect(0,0,cn.width,cn.height);c.fillStyle='#fbfefe';c.fillRect(0,0,cn.width,cn.height);

  // bulb
  c.strokeStyle='#6f8b91';c.lineWidth=5;c.beginPath();c.ellipse(430,250,310,185,0,0,Math.PI*2);c.stroke();
  c.fillStyle='#eef8fa';c.globalAlpha=.5;c.beginPath();c.ellipse(430,250,305,180,0,0,Math.PI*2);c.fill();c.globalAlpha=1;

  // cathode/anode
  c.fillStyle='#555f62';c.fillRect(180,145,28,220);c.fillRect(650,130,26,250);
  c.fillStyle='#355d66';c.font='900 17px Segoe UI';c.textAlign='center';c.fillText('КАТОД',195,400);c.fillText('АНОД',663,400);
  c.fillStyle=direct?'#1687b7':'#e5654f';c.font='900 24px Segoe UI';c.fillText(direct?'−':'+',195,115);
  c.fillStyle=direct?'#e5654f':'#1687b7';c.fillText(direct?'+':'−',663,115);

  const n=Math.round(H/100*20);
  eDiode.slice(0,n).forEach((p,i)=>{
    let x=p.x;
    if(active){
      const sp=.025*Math.max(8,Math.abs(U));
      if(direct) x=215+(((p.x-215+t*sp)%420)+420)%420;
      else x=215+Math.abs(Math.sin((t+p.ph)/700))*120;
    }
    c.fillStyle='#1587b8';c.beginPath();c.arc(x,p.y,10,0,Math.PI*2);c.fill();
    c.fillStyle='#fff';c.font='900 13px Segoe UI';c.fillText('−',x,p.y+4);
  });

  if(direct && active){
    c.strokeStyle='#0d9998';c.lineWidth=3;c.setLineDash([10,8]);
    c.beginPath();c.moveTo(220,250);c.lineTo(630,250);c.stroke();c.setLineDash([]);
    c.fillStyle='#0d9998';c.font='800 16px Segoe UI';c.fillText('електрони →',430,225);
  }else{
    c.fillStyle='#b65349';c.font='800 16px Segoe UI';c.fillText('струм не проходить',430,95);
  }
}

function drawDiodeGraph(){
  const cn=$('#diodeGraph'),c=cn.getContext('2d'),
        p={l:95,r:40,t:38,b:70},
        w=cn.width-p.l-p.r,h=cn.height-p.t-p.b,
        H=+hr.value;

  c.clearRect(0,0,cn.width,cn.height);
  c.fillStyle='#fff';
  c.fillRect(0,0,cn.width,cn.height);

  const x0=p.l+w/2;
  const y0=p.t+h;

  // Сітка
  c.strokeStyle='#e1eaec';
  c.lineWidth=1;
  for(let i=0;i<=10;i++){
    const x=p.l+w*i/10;
    c.beginPath();c.moveTo(x,p.t);c.lineTo(x,y0);c.stroke();
  }
  for(let i=0;i<=5;i++){
    const y=p.t+h*i/5;
    c.beginPath();c.moveTo(p.l,y);c.lineTo(p.l+w,y);c.stroke();
  }

  // Осі
  c.strokeStyle='#385e66';
  c.lineWidth=2;
  c.beginPath();
  c.moveTo(p.l,y0);c.lineTo(p.l+w,y0);
  c.moveTo(x0,p.t);c.lineTo(x0,y0);
  c.stroke();

  // Стрілки осей
  c.beginPath();
  c.moveTo(p.l+w,y0);c.lineTo(p.l+w-12,y0-6);
  c.moveTo(p.l+w,y0);c.lineTo(p.l+w-12,y0+6);
  c.moveTo(x0,p.t);c.lineTo(x0-6,p.t+12);
  c.moveTo(x0,p.t);c.lineTo(x0+6,p.t+12);
  c.stroke();

  c.fillStyle='#385e66';
  c.font='16px Segoe UI';
  c.textAlign='left';
  c.fillText('U, В',cn.width-65,cn.height-22);
  c.fillText('I, мА',x0+12,28);
  c.fillText('0',x0-17,y0+22);

  // Позначення полярності
  c.font='700 13px Segoe UI';
  c.fillStyle='#607a83';
  c.fillText('зворотне ввімкнення',p.l+55,y0-18);
  c.fillText('пряме ввімкнення',x0+135,p.t+28);

  // При зворотному ввімкненні I = 0
  c.strokeStyle='#e45a47';
  c.lineWidth=4;
  c.beginPath();
  c.moveTo(p.l,y0);
  c.lineTo(x0,y0);

  // При прямому ввімкненні I швидко нелінійно зростає
  for(let U=0;U<=100;U+=1){
    const I=diodeCurrent(U,H);
    const x=x0+(w/2)*(U/100);
    const y=y0-h*Math.min(I,10)/10;
    if(U===0)c.moveTo(x,y); else c.lineTo(x,y);
  }
  c.stroke();

  // Поточна робоча точка
  const U=+dur.value;
  const I=diodeCurrent(U,H);
  const x=p.l+w*(U+100)/200;
  const y=y0-h*Math.min(I,10)/10;

  c.fillStyle='#0d9998';
  c.beginPath();
  c.arc(x,y,8,0,Math.PI*2);
  c.fill();

  // Пунктир до осей
  c.strokeStyle='#0d999866';
  c.lineWidth=1.5;
  c.setLineDash([6,5]);
  c.beginPath();
  c.moveTo(x,y);c.lineTo(x,y0);
  c.moveTo(x,y);c.lineTo(x0,y);
  c.stroke();
  c.setLineDash([]);

  c.fillStyle='#355d66';
  c.font='700 13px Segoe UI';
  c.textAlign='center';
  c.fillText(`U = ${U} В`,x,y0+43);
  c.textAlign='left';
  c.fillText(`I = ${fmt(I,2)} мА`,x0+16,Math.max(p.t+20,y-8));
}

/* ---------------- ВИПРЯМЛЕННЯ ---------------- */
const ar=$('#ampRange'), fr=$('#freqRange');

function updateRect(){
  $('#ampOut').textContent=ar.value+' В';
  $('#freqOut').textContent=fmt(fr.value,1)+' Гц';
}
[ar,fr].forEach(x=>x.oninput=updateRect);

function rectArrow(c,x1,y1,x2,y2){
  const a=Math.atan2(y2-y1,x2-x1),h=8;
  c.beginPath();
  c.moveTo(x1,y1);c.lineTo(x2,y2);
  c.stroke();

  c.beginPath();
  c.moveTo(x2,y2);
  c.lineTo(x2-h*Math.cos(a-Math.PI/6),y2-h*Math.sin(a-Math.PI/6));
  c.moveTo(x2,y2);
  c.lineTo(x2-h*Math.cos(a+Math.PI/6),y2-h*Math.sin(a+Math.PI/6));
  c.stroke();
}

function drawRect(t){
  const cn=$('#rectCanvas'),c=cn.getContext('2d'),
        A=+ar.value,f=+fr.value;

  c.clearRect(0,0,cn.width,cn.height);
  c.fillStyle='#fff';
  c.fillRect(0,0,cn.width,cn.height);
  c.textAlign='center';

  // ОДНА фаза керує усім: схемою, електронами, написами,
  // червоним маркером і обома графіками.
  const cycles=2.5;
  const sweep=((t/1000)*f/cycles)%1;
  const phase=sweep*Math.PI*2*cycles;
  const s=Math.sin(phase);
  const open=s>=0;

  // ---------- СХЕМА ВАКУУМНОГО ДІОДА ----------
  c.fillStyle='#355d66';
  c.font='900 15px Segoe UI';
  c.fillText('ВАКУУМНИЙ ДІОД',430,24);

  c.strokeStyle='#8aa0a5';
  c.lineWidth=3;
  c.beginPath();
  c.ellipse(430,105,205,60,0,0,Math.PI*2);
  c.stroke();

  // Катод
  c.fillStyle='#5b6467';
  c.fillRect(270,72,22,68);
  c.fillStyle='#f18b4b';
  c.fillRect(276,79,10,54);

  // Анод
  c.fillStyle='#5b6467';
  c.fillRect(568,68,25,76);

  c.fillStyle='#355d66';
  c.font='800 13px Segoe UI';
  c.fillText('КАТОД',281,160);
  c.fillText('АНОД',580,160);

  // Полярність синхронна з фазою
  c.font='900 21px Segoe UI';
  c.fillStyle=open?'#1687b7':'#e5654f';
  c.fillText(open?'−':'+',281,58);
  c.fillStyle=open?'#e5654f':'#1687b7';
  c.fillText(open?'+':'−',580,58);

  // Електрони
  if(open){
    c.strokeStyle='#0d9998';
    c.lineWidth=3;
    rectArrow(c,315,106,545,106);

    for(let i=0;i<7;i++){
      const px=315+(((t*.12+i*46)%220));
      const py=112+(i%2)*15;
      c.fillStyle='#1587b8';
      c.beginPath();c.arc(px,py,8,0,Math.PI*2);c.fill();
      c.fillStyle='#fff';c.font='900 10px Segoe UI';c.fillText('−',px,py+3);
    }

    c.fillStyle='#0b8c79';
    c.font='900 14px Segoe UI';
    c.fillText('ПРЯМЕ ВВІМКНЕННЯ — СТРУМ Є',430,190);
  }else{
    c.strokeStyle='#c46155';
    c.lineWidth=3;
    rectArrow(c,382,106,315,106);

    for(let i=0;i<5;i++){
      const px=355-(((t*.08+i*29)%55));
      const py=112+(i%2)*15;
      c.fillStyle='#1587b8';
      c.beginPath();c.arc(px,py,8,0,Math.PI*2);c.fill();
      c.fillStyle='#fff';c.font='900 10px Segoe UI';c.fillText('−',px,py+3);
    }

    c.fillStyle='#b65349';
    c.font='900 14px Segoe UI';
    c.fillText('ЗВОРОТНЕ ВВІМКНЕННЯ — СТРУМУ НЕМАЄ',430,190);
  }

  $('#rectText').textContent=open
    ? 'Діод відкритий — струм проходить'
    : 'Діод закритий — струму немає';

  $('#rectState').textContent=open
    ? 'Пряме ввімкнення — струм проходить'
    : 'Зворотне ввімкнення — I = 0';

  $('#rectExplain').textContent=open
    ? 'Анод позитивний відносно катода: електрони рухаються від катода до анода.'
    : 'Анод негативний відносно катода: електричне поле повертає електрони до катода.';

  // ---------- ГРАФІК U(t) ----------
  const left=62,right=25,w=cn.width-left-right;
  const midU=300,ampU=57;
  const midI=445,ampI=55;

  c.strokeStyle='#e2eaec';
  c.lineWidth=1;
  for(let i=0;i<=10;i++){
    const x=left+w*i/10;
    c.beginPath();
    c.moveTo(x,225);c.lineTo(x,508);
    c.stroke();
  }

  c.strokeStyle='#385e66';
  c.lineWidth=2;
  c.beginPath();
  c.moveTo(left,midU);c.lineTo(left+w,midU);
  c.moveTo(left,midI);c.lineTo(left+w,midI);
  c.stroke();

  c.textAlign='left';
  c.fillStyle='#355d66';
  c.font='800 14px Segoe UI';
  c.fillText('Напруга на аноді U(t)',left,230);
  c.fillText('Сила струму в колі I(t)',left,378);

  // Синусоїдна напруга
  c.strokeStyle='#7655aa';
  c.lineWidth=3;
  c.beginPath();
  for(let x=0;x<=w;x++){
    const ph=(x/w)*Math.PI*2*cycles;
    const y=midU-ampU*Math.sin(ph);
    if(x===0)c.moveTo(left+x,y); else c.lineTo(left+x,y);
  }
  c.stroke();

  // Однопівперіодний пульсуючий струм
  c.strokeStyle='#0d9998';
  c.lineWidth=4;
  c.beginPath();
  for(let x=0;x<=w;x++){
    const ph=(x/w)*Math.PI*2*cycles;
    const y=midI-ampI*Math.max(0,Math.sin(ph));
    if(x===0)c.moveTo(left+x,y); else c.lineTo(left+x,y);
  }
  c.stroke();

  // Поточний момент часу - та сама фаза
  const mx=left+w*sweep;
  const uNow=Math.sin(phase);
  const iNow=Math.max(0,uNow);

  c.strokeStyle='#e45a47';
  c.lineWidth=2;
  c.beginPath();
  c.moveTo(mx,242);c.lineTo(mx,505);
  c.stroke();

  c.fillStyle='#e45a47';
  c.beginPath();
  c.arc(mx,midU-ampU*uNow,6,0,Math.PI*2);
  c.fill();
  c.beginPath();
  c.arc(mx,midI-ampI*iNow,6,0,Math.PI*2);
  c.fill();

  // + / - для напруги
  c.textAlign='center';
  c.fillStyle='#607a83';
  c.font='700 12px Segoe UI';
  c.fillText('+',45,midU-35);
  c.fillText('−',45,midU+42);
  c.fillText('I = 0 під час негативного півперіоду',430,515);
}

/* ---------------- ЕЛЕКТРОННИЙ ПУЧОК ---------------- */
const vdr=$('#vDefRange'), hdr=$('#hDefRange'), accr=$('#accRange');
function updateBeam(){
  const v=+vdr.value,h=+hdr.value,a=+accr.value;
  $('#vDefOut').textContent=v;
  $('#hDefOut').textContent=h;
  $('#accOut').textContent=a+' кВ';
  $('#beamPos').textContent=`x = ${h}; y = ${v}`;
  let txt='Світна точка ';
  if(Math.abs(h)<8 && Math.abs(v)<8) txt+='в центрі';
  else {
    txt+=v>8?'вгорі ':v<-8?'внизу ':'';
    txt+=h>8?'праворуч':h<-8?'ліворуч':'';
  }
  $('#spotText').textContent=txt.trim();
}
[vdr,hdr,accr].forEach(x=>x.oninput=updateBeam);

function drawBeam(){
  const cn=$('#beamCanvas'),c=cn.getContext('2d'),V=+vdr.value,H=+hdr.value,A=+accr.value;
  c.clearRect(0,0,cn.width,cn.height);c.fillStyle='#fbfefe';c.fillRect(0,0,cn.width,cn.height);

  // tube outline
  c.strokeStyle='#6f8b91';c.lineWidth=5;c.beginPath();
  c.moveTo(80,175);c.lineTo(620,175);c.lineTo(900,80);c.lineTo(930,80);c.lineTo(930,440);c.lineTo(900,440);c.lineTo(620,345);c.lineTo(80,345);c.closePath();c.stroke();

  // cathode & anodes
  c.fillStyle='#555f62';c.fillRect(105,220,38,80);
  [190,235,280].forEach(x=>{c.strokeStyle='#b39338';c.lineWidth=10;c.beginPath();c.arc(x,260,28,Math.PI/2,Math.PI*1.5);c.stroke()});
  c.fillStyle='#355d66';c.font='800 14px Segoe UI';c.textAlign='center';c.fillText('катод',124,330);c.fillText('аноди',235,330);

  // plates
  c.fillStyle='#7f8b8e';c.fillRect(390,205,85,12);c.fillRect(390,303,85,12);
  c.fillRect(510,220,12,80);c.fillRect(580,220,12,80);
  c.fillStyle='#607a83';c.font='700 13px Segoe UI';c.fillText('вертикальне',432,192);c.fillText('горизонтальне',550,325);

  // screen
  c.fillStyle='#e7f6d1';c.beginPath();c.ellipse(895,260,28,150,0,0,Math.PI*2);c.fill();c.strokeStyle='#9cb170';c.stroke();

  // beam path
  const x0=145,y0=260, x1=650;
  const endX=895,endY=260 - V*1.15;
  const bendX=endX + H*.20;
  c.strokeStyle='#13a8d0';c.lineWidth=Math.max(2,2+A/5);c.beginPath();
  c.moveTo(x0,y0);c.lineTo(x1,y0);c.quadraticCurveTo(750,260-V*.3,Math.min(915,Math.max(875,bendX)),Math.max(100,Math.min(420,endY)));c.stroke();

  // spot
  const sx=Math.min(915,Math.max(875,bendX)),sy=Math.max(100,Math.min(420,endY));
  c.fillStyle='rgba(255,224,60,.30)';c.beginPath();c.arc(sx,sy,20,0,Math.PI*2);c.fill();
  c.fillStyle='#e3b91e';c.beginPath();c.arc(sx,sy,7,0,Math.PI*2);c.fill();

  c.fillStyle='#355d66';c.font='800 15px Segoe UI';c.fillText('електронний пучок',650,230);
}

/* ---------------- ТЕСТ ---------------- */
const qs=[
 ['Електричний струм у вакуумі — це напрямлений рух:',['йонів','вільних електронів','молекул газу'],'b'],
 ['Термоелектронна емісія — це:',['випромінювання електронів нагрітими тілами','йонізація газу','рух протонів'],'a'],
 ['Енергію, потрібну електрону для виходу з металу, називають:',['роботою виходу','силою струму','напругою'],'a'],
 ['У вакуумному діоді електрони вилітають з:',['анода','катода','обох електродів однаково'],'b'],
 ['За прямого ввімкнення вакуумного діода анод має бути:',['позитивним відносно катода','негативним відносно катода','не зарядженим'],'a'],
 ['Однобічна провідність діода дає змогу:',['перетворювати змінний струм на пульсуючий','підвищувати температуру','створювати вакуум'],'a'],
 ['Електронний пучок у ЕПТ відхиляють:',['електричним або магнітним полем','лише силою тяжіння','лише нагріванням'],'a']
];
function build(){
  $('#quizBox').innerHTML=qs.map((q,i)=>`<article class="question"><p>${i+1}. ${q[0]}</p><div class="answers">${q[1].map((a,j)=>`<label><input type="radio" name="q${i}" value="${String.fromCharCode(97+j)}"> ${a}</label>`).join('')}</div></article>`).join('');
}
$('#check').onclick=()=>{
  let s=0;
  qs.forEach((q,i)=>{
    const a=$(`input[name=q${i}]:checked`),card=$$('.question')[i],ok=a?.value===q[2];
    card.className='question '+(ok?'correct':'wrong');if(ok)s++;
  });
  $('#result').textContent=`Результат: ${s} / ${qs.length}`;
  $('#result').className=s>=6?'good':'bad';
};
$('#reset').onclick=()=>{build();$('#result').textContent='';};

/* ---------------- АНІМАЦІЯ ---------------- */
function animate(t){
  drawEmission(t);
  drawDiode(t);
  drawDiodeGraph();
  drawRect(t);
  drawBeam();
  requestAnimationFrame(animate);
}

build();
updateEmission();
updateDiode();
updateRect();
updateBeam();
requestAnimationFrame(animate);
