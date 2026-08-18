const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const fmt=(n,d=2)=>Number(n).toFixed(d).replace('.',',');

function tab(id){
  $$('.tab').forEach(x=>x.classList.toggle('active',x.dataset.tab===id));
  $$('.panel').forEach(x=>x.classList.toggle('active-panel',x.id===id));
  $('#'+id)?.scrollIntoView({behavior:'smooth'});
}
$$('.tab').forEach(x=>x.onclick=()=>tab(x.dataset.tab));
$$('[data-go]').forEach(x=>x.onclick=()=>tab(x.dataset.go));

/* -------- ρ(T) -------- */
function drawRhoGraph(){
  const cn=$('#rhoGraph'),c=cn.getContext('2d'),p={l:80,r:40,t:35,b:60},w=cn.width-p.l-p.r,h=cn.height-p.t-p.b;
  c.clearRect(0,0,cn.width,cn.height);c.fillStyle='#fff';c.fillRect(0,0,cn.width,cn.height);
  c.strokeStyle='#dce7e9';
  for(let i=0;i<=8;i++){let x=p.l+w*i/8;c.beginPath();c.moveTo(x,p.t);c.lineTo(x,p.t+h);c.stroke()}
  for(let i=0;i<=5;i++){let y=p.t+h*i/5;c.beginPath();c.moveTo(p.l,y);c.lineTo(p.l+w,y);c.stroke()}
  c.strokeStyle='#385e66';c.lineWidth=2;c.beginPath();c.moveTo(p.l,p.t+h);c.lineTo(p.l+w,p.t+h);c.moveTo(p.l,p.t+h);c.lineTo(p.l,p.t);c.stroke();
  c.fillStyle='#385e66';c.font='16px Segoe UI';c.fillText('T',cn.width-35,cn.height-20);c.fillText('ρ',25,30);
  c.strokeStyle='#e56b55';c.lineWidth=4;c.beginPath();
  for(let x=0;x<=w;x++){
    const u=x/w, y=p.t+25+h*(1-Math.exp(-2.9*u))*.80;
    if(x===0)c.moveTo(p.l+x,y);else c.lineTo(p.l+x,y);
  }c.stroke();
  c.fillStyle='#607a83';c.font='700 15px Segoe UI';c.fillText('зі зростанням T питомий опір зменшується',p.l+250,p.t+55);
}

/* -------- ВЛАСНА ПРОВІДНІСТЬ -------- */
const tempR=$('#tempRange'), fieldR=$('#fieldRange');
const lattice=Array.from({length:30},(_,i)=>({x:120+(i%6)*120,y:105+Math.floor(i/6)*80}));
const pairSeeds=Array.from({length:24},(_,i)=>({x:160+(i*83)%570,y:130+(i*67)%280,ph:i*71}));

function pairNumber(T){ return Math.max(1,Math.min(18,Math.round(1+Math.pow((T-250)/550,1.55)*17))); }

function updateIntrinsic(){
  const T=+tempR.value,E=+fieldR.value,n=pairNumber(T);
  $('#tempOut').textContent=T+' K';
  $('#fieldOut').textContent=E+' %';
  $('#pairCount').textContent=n;
  $('#pairStatus').textContent=n<5?'Мало вільних носіїв':n<11?'Носіїв стає більше':'Багато електронно-діркових пар';
}
[tempR,fieldR].forEach(x=>x.oninput=updateIntrinsic);

function drawIntrinsic(t){
  const cn=$('#intrinsicCanvas'),c=cn.getContext('2d'),T=+tempR.value,E=+fieldR.value,n=pairNumber(T);
  c.clearRect(0,0,cn.width,cn.height);c.fillStyle='#fbfefe';c.fillRect(0,0,cn.width,cn.height);

  // bonds
  c.strokeStyle='#aebfc3';c.lineWidth=2;
  lattice.forEach((p,i)=>{
    if((i%6)<5){c.beginPath();c.moveTo(p.x+22,p.y);c.lineTo(p.x+98,p.y);c.stroke()}
    if(i<24){c.beginPath();c.moveTo(p.x,p.y+18);c.lineTo(p.x,p.y+62);c.stroke()}
  });
  // Si atoms
  lattice.forEach(p=>{
    c.fillStyle='#d96d93';c.beginPath();c.arc(p.x,p.y,20,0,Math.PI*2);c.fill();
    c.fillStyle='#fff';c.font='900 13px Segoe UI';c.textAlign='center';c.fillText('Si',p.x,p.y+5);
  });

  pairSeeds.slice(0,n).forEach((p,i)=>{
    const drift=E*.018*t;
    const ex=120+(((p.x-120+drift*.35+p.ph)%650)+650)%650;
    const hx=780-(((780-p.x+drift*.22+p.ph)%650)+650)%650;
    c.fillStyle='#1687b7';c.beginPath();c.arc(ex,p.y,10,0,Math.PI*2);c.fill();
    c.fillStyle='#fff';c.font='900 12px Segoe UI';c.fillText('−',ex,p.y+4);
    c.fillStyle='#e5654f';c.beginPath();c.arc(hx,p.y+28,11,0,Math.PI*2);c.fill();
    c.fillStyle='#fff';c.fillText('+',hx,p.y+32);
  });

  c.fillStyle='#355d66';c.font='800 15px Segoe UI';
  if(E>5){
    c.fillText('електрони →',690,45);
    c.fillText('← дірки',180,45);
  }else{
    c.fillText('без поля носії рухаються хаотично',450,45);
  }
}

/* -------- ДОМІШКИ -------- */
const dopSel=$('#dopantSelect'), dopR=$('#dopantRange');
function updateDoping(){
  const donor=dopSel.value==='donor',p=+dopR.value;
  $('#dopantOut').textContent=p+' %';
  $('#dopingType').textContent=donor?'n-тип':'p-тип';
  $('#mainCarrier').textContent=donor?'Електрони':'Дірки';
  $('#dopantExplain').textContent=donor
    ? 'Донорна домішка додає до кристала додаткові вільні електрони.'
    : 'Акцепторна домішка створює в кристалі додаткові дірки.';
  $('#dopantLegend').innerHTML=donor
    ? '<i class="swatch donor"></i>атом донорної домішки As'
    : '<i class="swatch acceptor"></i>атом акцепторної домішки In';
  $('#carrierLegend').innerHTML=donor
    ? '<i class="swatch electron"></i>додаткові вільні електрони'
    : '<i class="swatch hole"></i>додаткові дірки';
}
[dopSel,dopR].forEach(x=>x.oninput=updateDoping);

function drawDoping(){
  const cn=$('#dopingCanvas'),c=cn.getContext('2d'),donor=dopSel.value==='donor',p=+dopR.value;
  c.clearRect(0,0,cn.width,cn.height);c.fillStyle='#fbfefe';c.fillRect(0,0,cn.width,cn.height);

  const atoms=Array.from({length:30},(_,i)=>({x:110+(i%6)*125,y:90+Math.floor(i/6)*85}));
  c.strokeStyle='#aebfc3';c.lineWidth=2;
  atoms.forEach((a,i)=>{
    if(i%6<5){c.beginPath();c.moveTo(a.x+20,a.y);c.lineTo(a.x+105,a.y);c.stroke()}
    if(i<24){c.beginPath();c.moveTo(a.x,a.y+20);c.lineTo(a.x,a.y+65);c.stroke()}
  });
  atoms.forEach((a,i)=>{
    const impurity=(i===14 || (p>55 && i===8) || (p>80 && i===21));
    c.fillStyle=impurity?(donor?'#68a92f':'#e59b45'):'#d96d93';
    c.beginPath();c.arc(a.x,a.y,20,0,Math.PI*2);c.fill();
    c.fillStyle='#fff';c.font='900 12px Segoe UI';c.textAlign='center';c.fillText(impurity?(donor?'As':'In'):'Si',a.x,a.y+4);
  });

  const carriers=Math.max(1,Math.round(p/7));
  for(let i=0;i<carriers;i++){
    const x=170+(i*83)%560,y=120+(i*61)%280;
    if(donor){
      c.fillStyle='#1687b7';c.beginPath();c.arc(x,y,10,0,Math.PI*2);c.fill();c.fillStyle='#fff';c.fillText('−',x,y+4);
    }else{
      c.fillStyle='#e5654f';c.beginPath();c.arc(x,y,11,0,Math.PI*2);c.fill();c.fillStyle='#fff';c.fillText('+',x,y+4);
    }
  }

  c.fillStyle='#355d66';c.font='800 16px Segoe UI';
  c.fillText(donor?'Донорна домішка → надлишок електронів':'Акцепторна домішка → надлишок дірок',450,45);
}

/* -------- p-n-ПЕРЕХІД -------- */
const jr=$('#junctionRange');
$('#restartJunction').onclick=()=>{jr.value=0;updateJunction()};
function updateJunction(){
  const v=+jr.value;
  if(v<33){
    $('#junctionStage').textContent='1. Контакт p- і n-ділянок';
    $('#junctionState').textContent='Починається дифузія носіїв';
    $('#junctionExplain').textContent='Електрони з n-ділянки та дірки з p-ділянки рухаються до межі.';
  }else if(v<70){
    $('#junctionStage').textContent='2. Рекомбінація';
    $('#junctionState').textContent='Біля межі носії зникають';
    $('#junctionExplain').textContent='Електрони рекомбінують із дірками, залишаючи нерухомі заряджені йони домішок.';
  }else{
    $('#junctionStage').textContent='3. Запірний шар';
    $('#junctionState').textContent='Утворилося внутрішнє електричне поле';
    $('#junctionExplain').textContent='Поле запірного шару перешкоджає подальшій дифузії основних носіїв.';
  }
}
jr.oninput=updateJunction;

function drawJunction(){
  const cn=$('#junctionCanvas'),c=cn.getContext('2d'),v=+jr.value/100;
  c.clearRect(0,0,cn.width,cn.height);c.fillStyle='#fbfefe';c.fillRect(0,0,cn.width,cn.height);

  c.fillStyle='#fff0d8';c.fillRect(70,80,380,340);
  c.fillStyle='#e8f5fb';c.fillRect(450,80,380,340);
  c.fillStyle='#8a4465';c.font='900 28px Segoe UI';c.fillText('p',100,115);
  c.fillStyle='#2e6780';c.fillText('n',785,115);

  const barrier=20+130*Math.max(0,(v-.28)/.72);
  c.fillStyle='rgba(238,112,71,.16)';c.fillRect(450-barrier/2,80,barrier,340);

  for(let i=0;i<18;i++){
    let x=105+(i*71)%310,y=135+(i*57)%235;
    const shift=Math.min(95,v*120);
    x += shift*(i%3===0?1:.25);
    if(x<450-barrier/2){
      c.fillStyle='#e5654f';c.beginPath();c.arc(x,y,11,0,Math.PI*2);c.fill();c.fillStyle='#fff';c.font='900 12px Segoe UI';c.textAlign='center';c.fillText('+',x,y+4);
    }
  }
  for(let i=0;i<18;i++){
    let x=505+(i*73)%285,y=135+(i*59)%235;
    const shift=Math.min(95,v*120);
    x -= shift*(i%3===0?1:.25);
    if(x>450+barrier/2){
      c.fillStyle='#1687b7';c.beginPath();c.arc(x,y,10,0,Math.PI*2);c.fill();c.fillStyle='#fff';c.font='900 12px Segoe UI';c.textAlign='center';c.fillText('−',x,y+4);
    }
  }

  if(v>.28){
    const ions=Math.round(3+v*8);
    for(let i=0;i<ions;i++){
      const y=120+i*(255/Math.max(1,ions-1));
      c.fillStyle='#9b6aa7';c.beginPath();c.arc(450-barrier*.25,y,9,0,Math.PI*2);c.fill();
      c.fillStyle='#fff';c.font='900 11px Segoe UI';c.fillText('−',450-barrier*.25,y+4);
      c.fillStyle='#cc7444';c.beginPath();c.arc(450+barrier*.25,y,9,0,Math.PI*2);c.fill();
      c.fillStyle='#fff';c.fillText('+',450+barrier*.25,y+4);
    }
  }

  if(v>.65){
    c.strokeStyle='#ad694c';c.lineWidth=3;
    c.beginPath();c.moveTo(530,60);c.lineTo(370,60);c.stroke();
    c.beginPath();c.moveTo(370,60);c.lineTo(384,52);c.moveTo(370,60);c.lineTo(384,68);c.stroke();
    c.fillStyle='#ad694c';c.font='800 14px Segoe UI';c.fillText('Eзап',450,45);
  }
}

/* -------- ДІОД -------- */
const du=$('#diodeURange');

function diodeCurrent(U){
  if(U>=0){
    if(U<.3) return .005*Math.exp(5*U);
    return .02*Math.exp(8.2*(U-.3)); // мА
  }
  if(U>-4.2) return -0.002;          // мкА умовно дуже малий
  return -0.002-0.12*Math.pow((-U-4.2),2); // наближення до пробою
}

function updateDiode(){
  const U=+du.value,I=diodeCurrent(U),forward=U>=0;
  $('#diodeUOut').textContent=fmt(U,2)+' В';
  $('#biasMode').textContent=forward?'Пряме ввімкнення':'Зворотне ввімкнення';

  if(forward){
    $('#diodeIOut').textContent='I = '+fmt(Math.max(0,I),2)+' мА';
    $('#diodeExplain').textContent='Запірний шар звужується, основні носії проходять через p-n-перехід.';
    $('#barrierBar').style.width=(Math.max(10,55-U*45))+'%';
  }else{
    $('#diodeIOut').textContent=U>-4.2?'Iзвор ≈ 2 мкА':'Початок пробою';
    $('#diodeExplain').textContent=U>-4.2
      ? 'Запірний шар розширюється. Тече лише дуже малий зворотний струм неосновних носіїв.'
      : 'Зворотна напруга наближається до пробою p-n-переходу.';
    $('#barrierBar').style.width=(Math.min(95,60+(-U)*7))+'%';
  }
}
du.oninput=updateDiode;

const pCar=Array.from({length:14},(_,i)=>({x:120+(i*57)%260,y:140+(i*67)%240,ph:i*61}));
const nCar=Array.from({length:14},(_,i)=>({x:540+(i*59)%250,y:140+(i*63)%240,ph:i*71}));

function drawDiode(t){
  const cn=$('#diodeCanvas'),c=cn.getContext('2d'),U=+du.value,forward=U>=0;
  c.clearRect(0,0,cn.width,cn.height);c.fillStyle='#fbfefe';c.fillRect(0,0,cn.width,cn.height);

  c.fillStyle='#fff0d8';c.fillRect(70,95,380,315);
  c.fillStyle='#e8f5fb';c.fillRect(450,95,380,315);

  const barrier=forward?Math.max(25,90-U*65):Math.min(170,90+(-U)*18);
  c.fillStyle='rgba(238,112,71,.17)';c.fillRect(450-barrier/2,95,barrier,315);

  c.fillStyle='#8a4465';c.font='900 28px Segoe UI';c.fillText('p',100,130);
  c.fillStyle='#2e6780';c.fillText('n',790,130);

  // polarity
  c.font='900 24px Segoe UI';
  c.fillStyle=forward?'#e5654f':'#1687b7';c.fillText(forward?'+':'−',170,65);
  c.fillStyle=forward?'#1687b7':'#e5654f';c.fillText(forward?'−':'+',720,65);

  if(forward){
    const speed=0.06+U*.18;
    pCar.forEach(p=>{
      const x=100+(((p.x-100+t*speed+p.ph)%320)+320)%320;
      c.fillStyle='#e5654f';c.beginPath();c.arc(x,p.y,11,0,Math.PI*2);c.fill();c.fillStyle='#fff';c.font='900 12px Segoe UI';c.textAlign='center';c.fillText('+',x,p.y+4);
    });
    nCar.forEach(p=>{
      const x=800-(((800-p.x+t*speed+p.ph)%320)+320)%320;
      c.fillStyle='#1687b7';c.beginPath();c.arc(x,p.y,10,0,Math.PI*2);c.fill();c.fillStyle='#fff';c.fillText('−',x,p.y+4);
    });
    c.fillStyle='#0b8c79';c.font='800 15px Segoe UI';c.fillText('основні носії рухаються до p-n-переходу → струм великий',450,455);
  }else{
    pCar.forEach((p,i)=>{
      const x=120+Math.abs(Math.sin((t+p.ph)/700))*130;
      c.fillStyle='#e5654f';c.beginPath();c.arc(x,p.y,11,0,Math.PI*2);c.fill();c.fillStyle='#fff';c.fillText('+',x,p.y+4);
    });
    nCar.forEach((p,i)=>{
      const x=780-Math.abs(Math.sin((t+p.ph)/700))*130;
      c.fillStyle='#1687b7';c.beginPath();c.arc(x,p.y,10,0,Math.PI*2);c.fill();c.fillStyle='#fff';c.fillText('−',x,p.y+4);
    });
    c.fillStyle='#b65349';c.font='800 15px Segoe UI';c.fillText('основні носії віддаляються від переходу → струм дуже малий',450,455);
  }
}

function drawDiodeGraph(){
  const cn=$('#diodeGraph'),c=cn.getContext('2d'),p={l:100,r:45,t:35,b:70},w=cn.width-p.l-p.r,h=cn.height-p.t-p.b;
  c.clearRect(0,0,cn.width,cn.height);c.fillStyle='#fff';c.fillRect(0,0,cn.width,cn.height);

  const x0=p.l+w*.70, y0=p.t+h*.62;
  c.strokeStyle='#e1eaec';
  for(let i=0;i<=10;i++){let x=p.l+w*i/10;c.beginPath();c.moveTo(x,p.t);c.lineTo(x,p.t+h);c.stroke()}
  for(let i=0;i<=7;i++){let y=p.t+h*i/7;c.beginPath();c.moveTo(p.l,y);c.lineTo(p.l+w,y);c.stroke()}

  c.strokeStyle='#385e66';c.lineWidth=2;c.beginPath();c.moveTo(p.l,y0);c.lineTo(p.l+w,y0);c.moveTo(x0,p.t);c.lineTo(x0,p.t+h);c.stroke();

  c.fillStyle='#385e66';c.font='16px Segoe UI';c.fillText('U, В',cn.width-60,y0+28);c.fillText('Iпр, мА',x0+12,28);c.fillText('Iзв, мкА',x0+12,cn.height-20);

  // forward branch
  c.strokeStyle='#e45a47';c.lineWidth=4;c.beginPath();
  for(let U=0;U<=1;U+=.01){
    const I=Math.min(7,Math.max(0,diodeCurrent(U)));
    const x=x0+(p.l+w-x0)*(U/1);
    const y=y0-(y0-p.t-10)*(I/7);
    if(U===0)c.moveTo(x,y);else c.lineTo(x,y);
  }c.stroke();

  // reverse branch with breakdown
  c.beginPath();
  for(let U=-5;U<=0;U+=.02){
    const val=diodeCurrent(U);
    const x=p.l+(x0-p.l)*((U+5)/5);
    let down;
    if(U>-4.2) down=8;
    else down=8+Math.min(120,Math.abs(val)*250);
    const y=y0+down;
    if(U===-5)c.moveTo(x,y);else c.lineTo(x,y);
  }c.stroke();

  // breakdown marker
  const xb=p.l+(x0-p.l)*((-.8)/5); // corresponding -4.2 V
  c.setLineDash([6,5]);c.strokeStyle='#b65349';c.lineWidth=1.5;
  c.beginPath();c.moveTo(xb,p.t);c.lineTo(xb,p.t+h);c.stroke();c.setLineDash([]);
  c.fillStyle='#b65349';c.font='700 13px Segoe UI';c.fillText('Uпробою',xb-28,p.t+18);

  // point
  const U=+du.value;
  let x,y;
  if(U>=0){
    const I=Math.min(7,Math.max(0,diodeCurrent(U)));
    x=x0+(p.l+w-x0)*(U/1); y=y0-(y0-p.t-10)*(I/7);
  }else{
    x=p.l+(x0-p.l)*((U+5)/5);
    const val=diodeCurrent(U);
    y=y0+(U>-4.2?8:8+Math.min(120,Math.abs(val)*250));
  }
  c.fillStyle='#0d9998';c.beginPath();c.arc(x,y,8,0,Math.PI*2);c.fill();
}

/* -------- QUIZ -------- */
const qs=[
 ['Як змінюється питомий опір напівпровідника зі зростанням температури?',['зростає','зменшується','не змінюється'],'b'],
 ['У чистому напівпровіднику струм створюють:',['лише електрони','лише дірки','електрони і дірки'],'c'],
 ['Донорна домішка утворює напівпровідник:',['n-типу','p-типу','без провідності'],'a'],
 ['Основні носії струму в напівпровіднику p-типу:',['електрони','дірки','протони'],'b'],
 ['Що утворюється біля межі p- і n-ділянок?',['запірний шар','металевий шар','вакуум'],'a'],
 ['За прямого ввімкнення p-ділянку з’єднують:',['з плюсом джерела','з мінусом джерела','не підключають'],'a'],
 ['За зворотного ввімкнення ширина запірного шару:',['зменшується','збільшується','зникає'],'b'],
 ['Основна властивість напівпровідникового діода:',['однобічна провідність','повна ізоляція','провідність лише без напруги'],'a']
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
  $('#result').className=s>=7?'good':'bad';
};
$('#reset').onclick=()=>{build();$('#result').textContent='';};

function animate(t){
  drawIntrinsic(t);
  drawDoping();
  drawJunction();
  drawDiode(t);
  drawDiodeGraph();
  requestAnimationFrame(animate);
}

drawRhoGraph();
build();
updateIntrinsic();
updateDoping();
updateJunction();
updateDiode();
requestAnimationFrame(animate);
