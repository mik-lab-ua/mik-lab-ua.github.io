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
      c.fillStyle='#cc7444';c.beginPath();c.arc(450-barrier*.25,y,9,0,Math.PI*2);c.fill();
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
  const U=+du.value, forward=U>=0;
  $('#diodeUOut').textContent=fmt(U,2)+' В';
  $('#biasMode').textContent=forward?'Пряме ввімкнення':'Зворотне ввімкнення';

  if(forward){
    $('#polarityText').textContent='p → +, n → −';
    $('#electronDirection').textContent='n → p';
    $('#holeDirection').textContent='p → n';
    $('#currentDirection').textContent='p → n (через діод)';
    if(U<0.3){
      $('#diodeIOut').textContent='Струм дуже малий';
      $('#currentText').textContent='майже немає';
      $('#diodeExplain').textContent='Пряме ввімкнення є, але напруга ще замала: потенціальний бар’єр істотно не подолано.';
    }else{
      $('#diodeIOut').textContent='Прямий струм швидко зростає';
      $('#currentText').textContent='великий';
      $('#diodeExplain').textContent='p-ділянка з’єднана з «+», n-ділянка - з «−». Запірний шар звужується, основні носії проходять через p-n-перехід.';
    }
    $('#barrierBar').style.width=(Math.max(10,58-U*52))+'%';
  }else{
    $('#polarityText').textContent='p → −, n → +';
    $('#electronDirection').textContent='від переходу в n';
    $('#holeDirection').textContent='від переходу в p';
    $('#currentDirection').textContent='n → p (дуже малий)';
    if(U>-4.2){
      $('#diodeIOut').textContent='Зворотний струм дуже малий';
      $('#currentText').textContent='мкА';
      $('#diodeExplain').textContent='p-ділянка з’єднана з «−», n-ділянка - з «+». Запірний шар розширюється; через перехід рухаються лише неосновні носії.';
    }else{
      $('#diodeIOut').textContent='Пробій p-n-переходу';
      $('#currentText').textContent='різко зростає';
      $('#diodeExplain').textContent='Досягнуто напруги пробою. На ВАХ після цієї точки зворотна гілка різко йде вниз майже вертикально.';
    }
    $('#barrierBar').style.width=(Math.min(95,64+(-U)*6.5))+'%';
  }
}
du.oninput=updateDiode;

const pCar=Array.from({length:14},(_,i)=>({x:120+(i*57)%260,y:140+(i*67)%240,ph:i*61}));
const nCar=Array.from({length:14},(_,i)=>({x:540+(i*59)%250,y:140+(i*63)%240,ph:i*71}));

function drawDiode(t){
  const cn=$('#diodeCanvas'),c=cn.getContext('2d'),U=+du.value,forward=U>=0;
  c.clearRect(0,0,cn.width,cn.height);
  c.fillStyle='#fbfefe';c.fillRect(0,0,cn.width,cn.height);
  c.textAlign='center';

  const L=70,R=830,T=115,B=405,M=450;
  const barrier=forward ? Math.max(26,92-U*68) : Math.min(180,92+(-U)*18);

  c.fillStyle='#fff0d8'; c.fillRect(L,T,M-L,B-T);
  c.fillStyle='#e8f5fb'; c.fillRect(M,T,R-M,B-T);
  c.fillStyle='rgba(238,112,71,.18)';
  c.fillRect(M-barrier/2,T,barrier,B-T);

  c.font='900 30px Segoe UI';
  c.fillStyle='#8a4465'; c.fillText('p',105,150);
  c.fillStyle='#2e6780'; c.fillText('n',795,150);

  c.font='700 13px Segoe UI';
  c.fillStyle='#607a83';
  c.fillText('діркова провідність',180,174);
  c.fillText('електронна провідність',720,174);

  c.font='900 26px Segoe UI';
  c.fillStyle=forward?'#e5654f':'#1687b7'; c.fillText(forward?'+':'−',160,72);
  c.fillStyle=forward?'#1687b7':'#e5654f'; c.fillText(forward?'−':'+',740,72);

  c.font='800 14px Segoe UI';
  c.fillStyle='#355d66';
  c.fillText(forward?'p до «+»':'p до «−»',160,94);
  c.fillText(forward?'n до «−»':'n до «+»',740,94);

  const ionCount=8;
  for(let i=0;i<ionCount;i++){
    const y=145+i*31;
    const xl=M-barrier*.24, xr=M+barrier*.24;
    c.fillStyle='#9b6aa7'; c.beginPath(); c.arc(xl,y,9,0,Math.PI*2); c.fill();
    c.fillStyle='#fff'; c.font='900 10px Segoe UI'; c.fillText('−',xl,y+3);
    c.fillStyle='#cc7444'; c.beginPath(); c.arc(xr,y,9,0,Math.PI*2); c.fill();
    c.fillStyle='#fff'; c.fillText('+',xr,y+3);
  }

  const holes = Array.from({length:12},(_,i)=>({x:110+(i*53)%275,y:205+(i*47)%150,ph:i*53}));
  const electrons = Array.from({length:12},(_,i)=>({x:520+(i*57)%275,y:205+(i*43)%150,ph:i*61}));

  if(forward){
    const speed=.03+Math.max(0,U)*.16;
    holes.forEach(p=>{
      const x=100+(((p.x-100+t*speed+p.ph)%315)+315)%315;
      c.fillStyle='#e5654f'; c.beginPath(); c.arc(x,p.y,11,0,Math.PI*2); c.fill();
      c.fillStyle='#fff'; c.font='900 12px Segoe UI'; c.fillText('+',x,p.y+4);
    });
    electrons.forEach(p=>{
      const x=800-(((800-p.x+t*speed+p.ph)%315)+315)%315;
      c.fillStyle='#1687b7'; c.beginPath(); c.arc(x,p.y,10,0,Math.PI*2); c.fill();
      c.fillStyle='#fff'; c.fillText('−',x,p.y+4);
    });

    c.strokeStyle='#355d66'; c.lineWidth=2.3;
    for(const y of [225,285,345]){
      c.beginPath(); c.moveTo(150,y); c.lineTo(335,y); c.stroke();
      c.beginPath(); c.moveTo(335,y); c.lineTo(321,y-7); c.moveTo(335,y); c.lineTo(321,y+7); c.stroke();
      c.beginPath(); c.moveTo(750,y); c.lineTo(565,y); c.stroke();
      c.beginPath(); c.moveTo(565,y); c.lineTo(579,y-7); c.moveTo(565,y); c.lineTo(579,y+7); c.stroke();
    }

    // Умовний струм через діод: p -> n (ліворуч -> праворуч)
    c.strokeStyle='#d64b90'; c.lineWidth=4;
    c.beginPath(); c.moveTo(285,382); c.lineTo(615,382); c.stroke();
    c.beginPath(); c.moveTo(615,382); c.lineTo(600,374); c.moveTo(615,382); c.lineTo(600,390); c.stroke();
    c.fillStyle='#d64b90'; c.font='900 14px Segoe UI';
    c.fillText('Iпр: p → n',450,405);
    c.fillStyle='#0b8c79'; c.font='900 15px Segoe UI';
    c.fillText('запірний шар звужений',450,430);
  }else{
    holes.forEach(p=>{
      const x=125+Math.abs(Math.sin((t+p.ph)/720))*135;
      c.fillStyle='#e5654f'; c.beginPath(); c.arc(x,p.y,11,0,Math.PI*2); c.fill();
      c.fillStyle='#fff'; c.font='900 12px Segoe UI'; c.fillText('+',x,p.y+4);
    });
    electrons.forEach(p=>{
      const x=775-Math.abs(Math.sin((t+p.ph)/720))*135;
      c.fillStyle='#1687b7'; c.beginPath(); c.arc(x,p.y,10,0,Math.PI*2); c.fill();
      c.fillStyle='#fff'; c.fillText('−',x,p.y+4);
    });

    c.strokeStyle='#355d66'; c.lineWidth=2.3;
    for(const y of [225,285,345]){
      c.beginPath(); c.moveTo(335,y); c.lineTo(150,y); c.stroke();
      c.beginPath(); c.moveTo(150,y); c.lineTo(164,y-7); c.moveTo(150,y); c.lineTo(164,y+7); c.stroke();
      c.beginPath(); c.moveTo(565,y); c.lineTo(750,y); c.stroke();
      c.beginPath(); c.moveTo(750,y); c.lineTo(736,y-7); c.moveTo(750,y); c.lineTo(736,y+7); c.stroke();
    }

    // Зворотний умовний струм через діод: n -> p (праворуч -> ліворуч)
    c.strokeStyle='#d64b90'; c.lineWidth=3;
    c.beginPath(); c.moveTo(615,382); c.lineTo(285,382); c.stroke();
    c.beginPath(); c.moveTo(285,382); c.lineTo(300,374); c.moveTo(285,382); c.lineTo(300,390); c.stroke();
    c.fillStyle='#d64b90'; c.font='900 14px Segoe UI';
    c.fillText('Iзв: n → p (дуже малий)',450,405);
    c.fillStyle='#b65349'; c.font='900 15px Segoe UI';
    c.fillText(U>-4.2?'запірний шар розширений':'пробій запірного шару',450,430);
  }

  c.fillStyle='#7a5b4a'; c.font='800 13px Segoe UI';
  c.fillText('ЗАПІРНИЙ ШАР',450,108);
}

function drawDiodeGraph(){
  const cn=$('#diodeGraph'), c=cn.getContext('2d');
  c.clearRect(0,0,cn.width,cn.height);
  c.fillStyle='#fff'; c.fillRect(0,0,cn.width,cn.height);

  const left=125, right=75, top=58, bottom=78;
  const W=cn.width-left-right, H=cn.height-top-bottom;
  const x0=left+W*.64;
  const y0=top+H*.56;

  // Сітка
  c.strokeStyle='#e4ecee'; c.lineWidth=1;
  for(let i=0;i<=10;i++){
    const x=left+W*i/10;
    c.beginPath(); c.moveTo(x,top); c.lineTo(x,top+H); c.stroke();
  }
  for(let i=0;i<=8;i++){
    const y=top+H*i/8;
    c.beginPath(); c.moveTo(left,y); c.lineTo(left+W,y); c.stroke();
  }

  // Осі
  c.strokeStyle='#385e66'; c.lineWidth=2;
  c.beginPath();
  c.moveTo(left,y0); c.lineTo(left+W,y0);
  c.moveTo(x0,top); c.lineTo(x0,top+H);
  c.stroke();

  // Стрілки осей
  c.beginPath();
  c.moveTo(left+W,y0); c.lineTo(left+W-12,y0-6);
  c.moveTo(left+W,y0); c.lineTo(left+W-12,y0+6);
  c.moveTo(x0,top); c.lineTo(x0-6,top+12);
  c.moveTo(x0,top); c.lineTo(x0+6,top+12);
  c.stroke();

  // Підписи осей
  c.fillStyle='#385e66'; c.font='16px Segoe UI';
  c.textAlign='left';
  c.fillText('U, В',cn.width-60,y0+29);
  c.fillText('Iпр, мА',x0+12,29);
  c.fillText('Iзв, мкА',x0+12,cn.height-25);
  c.fillText('0',x0-18,y0-10);

  // ПРЯМА ГІЛКА
  c.strokeStyle='#e45a47'; c.lineWidth=4;
  c.beginPath();
  for(let U=0;U<=1;U+=.005){
    let I=U<.3 ? .025*(U/.3) : .025+6.1*Math.pow((U-.3)/.7,2.75);
    I=Math.min(6.1,I);
    const x=x0+(left+W-x0)*U;
    const y=y0-(y0-top-14)*(I/6.1);
    if(U===0)c.moveTo(x,y); else c.lineTo(x,y);
  }
  c.stroke();

  // ЗВОРОТНА ГІЛКА ДО ПРОБОЮ: майже сталий малий струм
  const Ubreak=-4.2;
  const xBreak=left+(x0-left)*((Ubreak+5)/5);
  const reverseY=y0+17;

  c.beginPath();
  c.moveTo(x0,y0);
  c.quadraticCurveTo(x0-35,y0+15,x0-72,reverseY);
  c.lineTo(xBreak,reverseY);

  // ПІСЛЯ ПРОБОЮ - ВЕРТИКАЛЬНА ГІЛКА
  const breakdownBottom=top+H-12;
  c.lineTo(xBreak,breakdownBottom);
  c.stroke();

  // Лінія Uпробою
  c.setLineDash([6,5]);
  c.strokeStyle='#b65349'; c.lineWidth=1.4;
  c.beginPath(); c.moveTo(xBreak,top+10); c.lineTo(xBreak,breakdownBottom); c.stroke();
  c.setLineDash([]);

  c.fillStyle='#b65349'; c.font='700 13px Segoe UI'; c.textAlign='center';
  c.fillText('Uпробою',xBreak,top+22);

  // Підписи гілок
  c.fillStyle='#607a83'; c.font='700 14px Segoe UI';
  c.textAlign='left';
  c.fillText('зворотний струм',left+45,reverseY+38);
  c.fillText('прямий струм',x0+135,top+48);
  c.fillText('пробій',Math.max(left+5,xBreak-78),breakdownBottom-8);

  // Орієнтири напруги
  c.fillStyle='#607a83'; c.font='700 12px Segoe UI'; c.textAlign='center';
  const x03=x0+(left+W-x0)*.3;
  const x07=x0+(left+W-x0)*.7;
  c.fillText('0,3',x03,y0+24);
  c.fillText('0,7',x07,y0+24);
  c.fillText('1,0',left+W-2,y0+24);
  c.fillText('−4,2',xBreak,y0+24);
  c.fillText('−5',left,y0+24);

  // Поточна робоча точка
  const U=+du.value;
  let x,y;
  if(U>=0){
    let I=U<.3 ? .025*(U/.3) : .025+6.1*Math.pow((U-.3)/.7,2.75);
    I=Math.min(6.1,Math.max(0,I));
    x=x0+(left+W-x0)*U;
    y=y0-(y0-top-14)*(I/6.1);
  }else if(U>Ubreak){
    x=left+(x0-left)*((U+5)/5);
    // плавний перехід від нуля до малої зворотної гілки
    const k=Math.min(1,(-U)/.5);
    y=y0+17*k;
  }else{
    // після пробою точка рухається ВЕРТИКАЛЬНО по x = Uпробою
    x=xBreak;
    const q=Math.min(1,(-U-4.2)/.8);
    y=reverseY+(breakdownBottom-reverseY)*q;
  }

  c.fillStyle='#0d9998';
  c.beginPath(); c.arc(x,y,8,0,Math.PI*2); c.fill();

  // Підпис точки
  c.fillStyle='#355d66'; c.font='700 12px Segoe UI'; c.textAlign='center';
  let label=`U = ${fmt(U,2)} В`;
  if(U<=Ubreak) label+=' · пробій';
  const lx=Math.min(cn.width-92,Math.max(92,x));
  const ly=Math.max(top+18,Math.min(top+H-8,y-14));
  c.fillText(label,lx,ly);
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
