const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const fmt=(n,d=1)=>Number(n).toFixed(d).replace('.',',');

function tab(id){
  $$('.tab').forEach(x=>x.classList.toggle('active',x.dataset.tab===id));
  $$('.panel').forEach(x=>x.classList.toggle('active-panel',x.id===id));
  $('#'+id)?.scrollIntoView({behavior:'smooth'});
}
$$('.tab').forEach(x=>x.onclick=()=>tab(x.dataset.tab));
$$('[data-go]').forEach(x=>x.onclick=()=>tab(x.dataset.go));

function arrow(c,x1,y1,x2,y2,color='#0d9998',width=3){
  const a=Math.atan2(y2-y1,x2-x1),h=10;
  c.strokeStyle=color;c.lineWidth=width;
  c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();
  c.beginPath();c.moveTo(x2,y2);
  c.lineTo(x2-h*Math.cos(a-Math.PI/6),y2-h*Math.sin(a-Math.PI/6));
  c.moveTo(x2,y2);
  c.lineTo(x2-h*Math.cos(a+Math.PI/6),y2-h*Math.sin(a+Math.PI/6));
  c.stroke();
}

function oppositePole(p){ return p==='N' ? 'S' : 'N'; }

function drawBarMagnet(c,x,y,w,h,leftPole,rightPole){
  c.fillStyle=leftPole==='N'?'#1687b7':'#e65349';c.fillRect(x,y,w/2,h);
  c.fillStyle=rightPole==='N'?'#1687b7':'#e65349';c.fillRect(x+w/2,y,w/2,h);
  c.strokeStyle='#40555b';c.lineWidth=2;c.strokeRect(x,y,w,h);
  c.fillStyle='#fff';c.font='900 22px Segoe UI';c.textAlign='center';
  c.fillText(leftPole,x+w*.25,y+h*.62);c.fillText(rightPole,x+w*.75,y+h*.62);
}

/* -------- МАГНІТИ -------- */
const lp=$('#leftPole'),rp=$('#rightPole'),dr=$('#distanceRange');
function updateMagnets(){
  const same=lp.value===rp.value;
  $('#distanceOut').textContent=dr.value+' ум. од.';
  $('#magnetState').textContent=same?'Однойменні полюси — відштовхування':'Різнойменні полюси — притягання';
  $('#forceResult').textContent=same?'Магніти відштовхуються':'Магніти притягуються';
  $('#forceHint').textContent=same?'До центра повернені однойменні полюси '+lp.value+' і '+rp.value+'. Кожен окремий магніт має полюси N і S.':'До центра повернені різнойменні полюси '+lp.value+' і '+rp.value+'. Кожен окремий магніт має полюси N і S.';
}
[lp,rp,dr].forEach(x=>x.oninput=updateMagnets);

function drawMagnets(){
  const cn=$('#magnetCanvas'),c=cn.getContext('2d'),d=+dr.value,same=lp.value===rp.value;
  c.clearRect(0,0,cn.width,cn.height);c.fillStyle='#fbfefe';c.fillRect(0,0,cn.width,cn.height);
  const center=450,w=220,h=80;
  const x1=center-d/2-w,x2=center+d/2;
  // Кожен магніт завжди має протилежні полюси N і S.
  // Зміна полюса біля центра означає перевертання всього магніту.
  drawBarMagnet(c,x1,210,w,h,oppositePole(lp.value),lp.value);
  drawBarMagnet(c,x2,210,w,h,rp.value,oppositePole(rp.value));
  c.fillStyle='#607a83';c.font='700 14px Segoe UI';c.textAlign='center';c.fillText('відстань між полюсами',450,175);
  c.strokeStyle='#8ca4aa';c.setLineDash([6,5]);c.beginPath();c.moveTo(x1+w,190);c.lineTo(x2,190);c.stroke();c.setLineDash([]);
  if(same){
    arrow(c,x1+w-30,335,x1+w-120,335,'#0d9998',4);
    arrow(c,x2+30,335,x2+120,335,'#0d9998',4);
  }else{
    arrow(c,x1+w-130,335,x1+w-35,335,'#0d9998',4);
    arrow(c,x2+130,335,x2+35,335,'#0d9998',4);
  }
  c.fillStyle='#355d66';c.font='900 18px Segoe UI';
  c.fillText(same?'ВІДШТОВХУВАННЯ':'ПРИТЯГАННЯ',450,395);
}

/* -------- ТОЧКА КЮРІ -------- */
const cs=$('#curieSelect'),ct=$('#curieTemp');
function updateCurie(){
  const Tk=+cs.value,T=+ct.value,ok=T<Tk;
  $('#curieTempOut').textContent=T+' °C';
  $('#curieState').textContent=ok?'Магнітні властивості зберігаються':'Магнітні властивості зникають';
  $('#curieHint').textContent=ok?'T < TКюрі = '+Tk+' °C':'T ≥ TКюрі = '+Tk+' °C';
}
[cs,ct].forEach(x=>x.oninput=updateCurie);

/* -------- ЕРСТЕД -------- */
const sw=$('#currentSwitch'),ir=$('#currentRange'),idir=$('#currentDirectionSelect');
function updateOersted(){
  const on=sw.checked,I=+ir.value,dir=idir.value;
  $('#currentOut').textContent=fmt(I,1)+' А';
  $('#switchText').textContent=on?'Струм є':'Струму немає';
  $('#oerstedCurrentText').textContent=dir==='right'?'зліва → вправо':'справа → вліво';

  if(!on){
    $('#needleResult').textContent='Стрілка паралельна провіднику';
    $('#needleHint').textContent='Без струму магнітна стрілка орієнтується вздовж магнітного меридіана; провідник у досліді розташовано паралельно цьому напряму.';
    $('#oerstedFieldText').textContent='поле струму відсутнє';
    $('#oerstedDeflectText').textContent='0°';
  }else{
    const angle=Math.round(Math.min(90,18+I/8*72));
    $('#needleResult').textContent='Стрілка повертається відносно провідника';
    $('#needleHint').textContent='Зі збільшенням струму поле провідника посилюється, тому стрілка сильніше повертається до перпендикулярного напряму.';
    $('#oerstedFieldText').textContent=dir==='right'
      ?'біля компаса B спрямоване поперек провідника'
      :'напрям B змінився на протилежний';
    $('#oerstedDeflectText').textContent=(dir==='right'?'':'−')+angle+'°';
  }
}
[sw,ir,idir].forEach(x=>x.oninput=updateOersted);

function drawOersted(){
  const cn=$('#oerstedCanvas'),c=cn.getContext('2d'),
        on=sw.checked,I=+ir.value,dir=idir.value;

  c.clearRect(0,0,cn.width,cn.height);
  c.fillStyle='#fbfefe';c.fillRect(0,0,cn.width,cn.height);
  c.textAlign='center';

  // Провідник розташовано вздовж магнітного меридіана.
  const wireY=165;
  c.strokeStyle='#7c8d92';c.lineWidth=5;
  c.beginPath();c.moveTo(150,wireY);c.lineTo(150,360);c.stroke();
  c.beginPath();c.moveTo(750,wireY);c.lineTo(750,360);c.stroke();

  c.strokeStyle='#4f5d61';c.lineWidth=10;
  c.beginPath();c.moveTo(150,wireY);c.lineTo(750,wireY);c.stroke();

  // Струм уздовж провідника.
  if(dir==='right') arrow(c,300,125,600,125,'#df4f4f',4);
  else arrow(c,600,125,300,125,'#df4f4f',4);
  c.fillStyle='#df4f4f';c.font='900 17px Segoe UI';c.fillText('I',450,107);

  const cx=450,cy=350;
  c.fillStyle='#eef7f8';c.beginPath();c.arc(cx,cy,105,0,Math.PI*2);c.fill();
  c.strokeStyle='#789096';c.lineWidth=3;c.beginPath();c.arc(cx,cy,105,0,Math.PI*2);c.stroke();

  // Початковий напрям компаса ПАРАЛЕЛЬНИЙ провіднику.
  c.setLineDash([7,6]);c.strokeStyle='#a7b7bb';c.lineWidth=2;
  c.beginPath();c.moveTo(cx-95,cy);c.lineTo(cx+95,cy);c.stroke();
  c.setLineDash([]);
  c.fillStyle='#758a90';c.font='700 12px Segoe UI';
  c.fillText('Пн',cx+113,cy+4);
  c.fillText('Пд',cx-113,cy+4);

  // Поле провідника у точці компаса перпендикулярне до провідника.
  if(on){
    const sign=dir==='right'?1:-1;
    const strength=Math.min(1,I/8);

    // Показуємо вектор B саме в місці компаса.
    if(sign>0) arrow(c,cx,cy+92,cx,cy-92,'#398297',4);
    else arrow(c,cx,cy-92,cx,cy+92,'#398297',4);

    c.fillStyle='#398297';c.font='800 14px Segoe UI';
    c.fillText('B провідника',cx+72,cy-70*sign);

    // Додаткові короткі дуги навколо провідника, інтенсивність залежить від I.
    c.strokeStyle=`rgba(57,130,151,${0.22+0.60*strength})`;
    c.lineWidth=1.5+2.5*strength;
    const count=2+Math.round(strength*4);
    for(let k=0;k<count;k++){
      const rx=55+k*28;
      c.beginPath();
      c.ellipse(cx,wireY,rx,rx*.35,0,0,Math.PI*2);
      c.stroke();
    }
  }

  // Без струму стрілка горизонтальна, паралельно провіднику.
  // За наявності струму вона повертається до перпендикулярного напряму;
  // максимальний струм у моделі дає майже 90°.
  let angle=0;
  if(on){
    const sign=dir==='right'?-1:1;
    angle=sign*Math.min(Math.PI/2,(18+I/8*72)*Math.PI/180);
  }

  const len=82;
  c.save();c.translate(cx,cy);c.rotate(angle);
  c.fillStyle='#1687b7';
  c.beginPath();c.moveTo(0,-10);c.lineTo(len,0);c.lineTo(0,10);c.closePath();c.fill();
  c.fillStyle='#e65349';
  c.beginPath();c.moveTo(0,-10);c.lineTo(-len,0);c.lineTo(0,10);c.closePath();c.fill();
  c.restore();

  const dx=Math.cos(angle)*len,dy=Math.sin(angle)*len;
  c.fillStyle='#1687b7';c.font='900 16px Segoe UI';c.fillText('N',cx+dx*.88,cy+dy*.88);
  c.fillStyle='#e65349';c.fillText('S',cx-dx*.88,cy-dy*.88);

  c.fillStyle='#355d66';c.font='800 15px Segoe UI';
  c.fillText(
    on
      ?'I ↑ → магнітне поле сильніше → стрілка сильніше повертається'
      :'I = 0 → магнітна стрілка паралельна провіднику',
    450,495
  );
}

/* -------- АМПЕР -------- */
const w1=$('#wire1'),w2=$('#wire2'),air=$('#ampereCurrent');
function updateAmpere(){
  const same=w1.value===w2.value,I=+air.value;
  $('#ampereCurrentOut').textContent=fmt(I,1)+' А';
  $('#ampereState').textContent=same?'Струми одного напрямку — притягання':'Струми протилежних напрямків — відштовхування';
  $('#ampereResult').textContent=same?'Провідники притягуються':'Провідники відштовхуються';
  $('#ampereHint').textContent=same?'Струми течуть в одному напрямку.':'Струми течуть у протилежних напрямках.';
}
[w1,w2,air].forEach(x=>x.oninput=updateAmpere);

function drawAmpere(){
  const cn=$('#ampereCanvas'),c=cn.getContext('2d'),
        same=w1.value===w2.value,I=+air.value;

  c.clearRect(0,0,cn.width,cn.height);
  c.fillStyle='#fbfefe';c.fillRect(0,0,cn.width,cn.height);
  c.textAlign='center';

  const top=100,bottom=410;
  const x1=320,x2=580;
  const bend=Math.min(55,12+I*5);

  // верхні опори
  c.strokeStyle='#4f5d61';c.lineWidth=8;
  c.beginPath();c.moveTo(240,75);c.lineTo(400,75);c.stroke();
  c.beginPath();c.moveTo(500,75);c.lineTo(660,75);c.stroke();

  // гнучкі провідники: при однакових струмах згинаються один до одного,
  // при протилежних - один від одного
  c.strokeStyle='#777';c.lineWidth=18;
  c.beginPath();
  c.moveTo(x1,top);
  c.quadraticCurveTo(same?x1+bend:x1-bend,255,x1,bottom);
  c.stroke();

  c.beginPath();
  c.moveTo(x2,top);
  c.quadraticCurveTo(same?x2-bend:x2+bend,255,x2,bottom);
  c.stroke();

  function currentArrow(x,dir){
    if(dir==='up') arrow(c,x,350,x,160,'#df4f4f',4);
    else arrow(c,x,160,x,350,'#df4f4f',4);
  }
  currentArrow(x1,w1.value);
  currentArrow(x2,w2.value);

  if(same){
    arrow(c,360,255,425,255,'#0d9998',4);
    arrow(c,540,255,475,255,'#0d9998',4);
  }else{
    arrow(c,300,255,220,255,'#0d9998',4);
    arrow(c,600,255,680,255,'#0d9998',4);
  }

  c.fillStyle='#355d66';c.font='900 17px Segoe UI';
  c.fillText(same?'СТРУМИ ОДНОГО НАПРЯМКУ → ПРИТЯГАННЯ':'СТРУМИ ПРОТИЛЕЖНИХ НАПРЯМКІВ → ВІДШТОВХУВАННЯ',450,462);
  c.font='700 13px Segoe UI';
  c.fillText('взаємодія зумовлена магнітними силами',450,492);
}

/* -------- МАГНІТНЕ ПОЛЕ -------- */
const fsrc=$('#fieldSource'),fdir=$('#fieldCurrentDirection'),fir=$('#fieldCurrent');
function updateField(){
  const source=fsrc.value,out=fdir.value==='out',I=+fir.value;
  $('#fieldCurrentOut').textContent=fmt(I,1)+' А';
  $('#fieldDirectionLabel').style.display=source==='wire'?'block':'none';
  $('#fieldStrengthBox').style.display=source==='wire'?'block':'none';

  const pct=Math.round((I/8)*100);
  $('#fieldStrengthBar').style.width=Math.max(6,pct)+'%';
  $('#fieldStrengthText').textContent=I<2.5?'слабке':I<5.5?'середнє':'сильне';

  if(source==='wire'){
    $('#fieldResult').textContent=out
      ?'Лінії поля йдуть проти годинникової стрілки'
      :'Лінії поля йдуть за годинниковою стрілкою';
    $('#fieldDirectionText').textContent=out?'Струм із площини екрана ⊙':'Струм у площину екрана ⊗';
    $('#fieldHint').textContent='Зі збільшенням I на рисунку зростають кількість, товщина та насиченість ліній поля.';
  }else{
    $('#fieldResult').textContent='Зовні магніту лінії поля спрямовані від N до S';
    $('#fieldDirectionText').textContent='Поле постійного магніту';
    $('#fieldHint').textContent='Магнітні лінії замкнені: зовні магніту N → S, усередині S → N.';
  }
}
[fsrc,fdir,fir].forEach(x=>x.oninput=updateField);

function drawField(){
  const cn=$('#fieldCanvas'),c=cn.getContext('2d'),
        source=fsrc.value,out=fdir.value==='out',I=+fir.value;

  c.clearRect(0,0,cn.width,cn.height);
  c.fillStyle='#fbfefe';c.fillRect(0,0,cn.width,cn.height);
  c.textAlign='center';

  if(source==='wire'){
    const cx=450,cy=250;
    const strength=Math.max(.06,Math.min(1,I/8));

    // Переріз прямого провідника.
    c.fillStyle='#555';c.beginPath();c.arc(cx,cy,40,0,Math.PI*2);c.fill();
    c.fillStyle='#fff';c.font='900 36px Segoe UI';c.fillText(out?'⊙':'⊗',cx,cy+12);

    // Видима залежність від сили струму:
    // I ↑ -> більше ліній, вони товстіші та насиченіші.
    const rings=2+Math.round(strength*6);      // 2...8 кіл
    const maxR=80+strength*150;               // поле "поширюється" візуально далі
    const gap=maxR/rings;

    for(let k=1;k<=rings;k++){
      const r=42+k*gap;
      const alpha=.20+.58*strength;
      c.strokeStyle=`rgba(57,130,151,${alpha})`;
      c.lineWidth=1.2+2.6*strength;
      c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.stroke();

      // Напрям поля по дотичній.
      const a=-Math.PI/4;
      const x=cx+r*Math.cos(a),y=cy+r*Math.sin(a);
      const tangent=a+(out?-Math.PI/2:Math.PI/2);
      arrow(
        c,
        x-13*Math.cos(tangent),y-13*Math.sin(tangent),
        x+13*Math.cos(tangent),y+13*Math.sin(tangent),
        '#398297',1.8+1.3*strength
      );
    }

    // Підпис величини I безпосередньо на схемі.
    c.fillStyle='#355d66';c.font='900 16px Segoe UI';
    c.fillText(`I = ${fmt(I,1)} А`,450,32);
    c.font='800 14px Segoe UI';
    c.fillText(
      I<2.5?'слабше поле — менше й тонші лінії':
      I<5.5?'поле посилилося':
      'сильніше поле — більше й товстіші лінії',
      450,495
    );

  }else{
    // Поле постійного штабового магніту.
    const x=330,y=220,w=240,h=90;
    drawBarMagnet(c,x,y,w,h,'N','S');

    c.strokeStyle='#398297';c.lineWidth=2.5;

    // Замкнені лінії поля: зовні N -> S.
    for(let k=0;k<4;k++){
      const off=35+k*28;
      c.beginPath();
      c.moveTo(x+20,y+20);
      c.bezierCurveTo(x-80-off,y-110-off/3,x+w+80+off,y-110-off/3,x+w-20,y+20);
      c.stroke();
      arrow(c,420,102+k*4,480,102+k*4,'#398297',2.2);
    }
    for(let k=0;k<4;k++){
      const off=35+k*28;
      c.beginPath();
      c.moveTo(x+20,y+h-20);
      c.bezierCurveTo(x-80-off,y+h+110+off/3,x+w+80+off,y+h+110+off/3,x+w-20,y+h-20);
      c.stroke();
      arrow(c,420,405-k*4,480,405-k*4,'#398297',2.2);
    }

    c.fillStyle='#355d66';c.font='800 15px Segoe UI';
    c.fillText('зовні магніту: N → S',450,485);
  }
}

/* -------- ТЕСТ -------- */
const qs=[
 ['Скільки полюсів має постійний магніт?',['один','два','три'],'b'],
 ['Однойменні полюси магнітів:',['притягуються','відштовхуються','не взаємодіють'],'b'],
 ['Дослід Ерстеда показав, що:',['струм створює магнітне поле','магніт створює заряд','тепло створює струм'],'a'],
 ['Як поводяться паралельні провідники, якщо струми течуть в одному напрямку?',['притягуються','відштовхуються','не взаємодіють'],'a'],
 ['Як поводяться паралельні провідники, якщо струми течуть у протилежних напрямках?',['притягуються','відштовхуються','не взаємодіють'],'b'],
 ['Що відбувається з магнітними властивостями при нагріванні до точки Кюрі?',['посилюються','зникають','не змінюються'],'b'],
 ['Магнітне поле існує навколо:',['лише магнітів','лише провідників зі струмом','магнітів, струмів і рухомих заряджених частинок'],'c'],
 ['Якщо струм спрямований із площини екрана ⊙, лінії поля йдуть:',['за годинниковою стрілкою','проти годинникової стрілки','радіально'],'b']
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

function animate(){
  drawMagnets();
  drawOersted();
  drawAmpere();
  drawField();
  requestAnimationFrame(animate);
}

build();
updateMagnets();
updateCurie();
updateOersted();
updateAmpere();
updateField();
requestAnimationFrame(animate);
