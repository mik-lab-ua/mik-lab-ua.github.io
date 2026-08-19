const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const fmt=(n,d=2)=>Number(n).toFixed(d).replace('.',',');

function tab(id){
  $$('.tab').forEach(x=>x.classList.toggle('active',x.dataset.tab===id));
  $$('.panel').forEach(x=>x.classList.toggle('active-panel',x.id===id));
  $('#'+id)?.scrollIntoView({behavior:'smooth'});
}
$$('.tab').forEach(x=>x.onclick=()=>tab(x.dataset.tab));
$$('[data-go]').forEach(x=>x.onclick=()=>tab(x.dataset.go));

function vectorLabel(c, x, y, sub=''){
  // Позначення вектора магнітної індукції: стрілка ОБОВ'ЯЗКОВО над B.
  c.save();
  c.fillStyle='#16313a';
  c.strokeStyle='#16313a';
  c.lineWidth=1.6;
  c.textAlign='center';
  c.font='italic 900 20px Georgia, serif';
  c.fillText('B', x, y);
  const w=14, ay=y-22;
  c.beginPath(); c.moveTo(x-w/2,ay); c.lineTo(x+w/2,ay); c.stroke();
  c.beginPath(); c.moveTo(x+w/2,ay); c.lineTo(x+w/2-5,ay-3); c.moveTo(x+w/2,ay); c.lineTo(x+w/2-5,ay+3); c.stroke();
  if(sub){
    c.font='700 11px Segoe UI';
    c.fillText(sub, x+12, y+5);
  }
  c.restore();
}

function arrow(c,x1,y1,x2,y2,color='#2f9dc0',width=2.4){
  const a=Math.atan2(y2-y1,x2-x1),h=9;
  c.strokeStyle=color;c.lineWidth=width;
  c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();
  c.beginPath();c.moveTo(x2,y2);
  c.lineTo(x2-h*Math.cos(a-Math.PI/6),y2-h*Math.sin(a-Math.PI/6));
  c.moveTo(x2,y2);
  c.lineTo(x2-h*Math.cos(a+Math.PI/6),y2-h*Math.sin(a+Math.PI/6));
  c.stroke();
}

/* ---------- ПРАВИЛО СВЕРДЛИКА ---------- */
const sd=$('#screwDirection'),sc=$('#screwCurrent');
function updateScrew(){
  const out=sd.value==='out',I=+sc.value;
  $('#screwCurrentOut').textContent=fmt(I,1)+' А';
  $('#screwState').textContent=out?'I до нас ⊙ → B проти годинникової стрілки':'I від нас ⊗ → B за годинниковою стрілкою';
  $('#screwAnswer').textContent=out?'Обертання проти годинникової стрілки':'Обертання за годинниковою стрілкою';
  $('#screwHint').textContent=out
    ?'Великий палець правої руки спрямований до нас, зігнуті пальці показують напрям B.'
    :'Великий палець правої руки спрямований від нас, зігнуті пальці показують напрям B.';
  const pct=Math.round(I/8*100);
  $('#screwBar').style.width=Math.max(8,pct)+'%';
  $('#screwStrengthText').textContent=I<2.5?'слабка':I<5.5?'середня':'сильна';
}
[sd,sc].forEach(x=>x.oninput=updateScrew);

function drawScrew(){
  const cn=$('#screwCanvas'),c=cn.getContext('2d'),out=sd.value==='out',I=+sc.value;
  c.clearRect(0,0,cn.width,cn.height);c.fillStyle='#fbfefe';c.fillRect(0,0,cn.width,cn.height);
  c.textAlign='center';
  const cx=460,cy=270,str=Math.max(.08,I/8);

  // провідник як переріз
  c.fillStyle='#f2bf45';c.beginPath();c.arc(cx,cy,35,0,Math.PI*2);c.fill();
  c.strokeStyle='#4a5559';c.lineWidth=2;c.stroke();
  c.fillStyle='#333';c.font='900 34px Segoe UI';c.fillText(out?'⊙':'⊗',cx,cy+11);

  // концентричні лінії як у рис. 3.3
  const rings=4+Math.round(str*4);
  c.strokeStyle=`rgba(47,157,192,${.45+.45*str})`;c.lineWidth=1.4+1.8*str;
  for(let k=1;k<=rings;k++){
    const r=48+k*28;
    c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.stroke();

    const a=-Math.PI/3;
    const x=cx+r*Math.cos(a),y=cy+r*Math.sin(a);
    const tangent=a+(out?-Math.PI/2:Math.PI/2);
    arrow(c,x-12*Math.cos(tangent),y-12*Math.sin(tangent),x+12*Math.cos(tangent),y+12*Math.sin(tangent),'#2f9dc0',2);
  }

  // стилізований свердлик праворуч
  c.strokeStyle='#666';c.lineWidth=8;
  c.beginPath();c.moveTo(760,160);c.lineTo(760,385);c.stroke();
  c.strokeStyle='#444';c.lineWidth=4;
  for(let y=185;y<365;y+=22){
    c.beginPath();c.moveTo(745,y);c.lineTo(775,y+12);c.stroke();
  }
  if(out) arrow(c,735,405,785,405,'#355d66',3);
  else arrow(c,785,405,735,405,'#355d66',3);

  vectorLabel(c, cx+185, cy-125);
  vectorLabel(c,cx+185,cy-125);
  c.fillStyle='#355d66';c.font='800 14px Segoe UI';
  c.fillText(out?'правило свердлика: обертання ↺':'правило свердлика: обертання ↻',760,445);
}

/* ---------- ПРЯМИЙ ПРОВІДНИК ---------- */
const sic=$('#straightCurrent'),r1=$('#r1'),r2=$('#r2');
function Bmodel(I,r){ return I/r; }

function updateStraight(){
  const I=+sic.value,R1=+r1.value,R2=+r2.value,b1=Bmodel(I,R1),b2=Bmodel(I,R2);
  $('#straightCurrentOut').textContent=fmt(I,1)+' А';
  $('#r1Out').textContent=R1+' ум. од.';
  $('#r2Out').textContent=R2+' ум. од.';
  $('#b1Text').textContent=fmt(b1,3)+' ум. од.';
  $('#b2Text').textContent=fmt(b2,3)+' ум. од.';
  const relation=Math.abs(b1-b2)<.0005?'B₁ = B₂':b1>b2?'B₁ > B₂':'B₁ < B₂';
  $('#straightAnswer').textContent=relation;
  $('#straightState').textContent=relation+(R1<R2?' — точка 1 ближче':' — порівняй відстані');
}
[sic,r1,r2].forEach(x=>x.oninput=updateStraight);

function drawStraight(){
  const cn=$('#straightCanvas'),c=cn.getContext('2d'),I=+sic.value,R1=+r1.value,R2=+r2.value;
  c.clearRect(0,0,cn.width,cn.height);c.fillStyle='#fbfefe';c.fillRect(0,0,cn.width,cn.height);
  c.textAlign='center';
  const cx=430,cy=270,str=I/8;

  c.fillStyle='#f2bf45';c.beginPath();c.arc(cx,cy,32,0,Math.PI*2);c.fill();
  c.strokeStyle='#4a5559';c.lineWidth=2;c.stroke();
  c.fillStyle='#222';c.font='900 33px Segoe UI';c.fillText('⊗',cx,cy+11);

  c.strokeStyle=`rgba(47,157,192,${.4+.5*str})`;c.lineWidth=1.4+1.3*str;
  for(let r=55;r<=220;r+=33){c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.stroke()}

  // точки 1 і 2 праворуч-вгорі, як у підручнику
  const p1={x:cx-R1*.65,y:cy+R1*.55};
  const p2={x:cx+R2*.12,y:cy-R2*.78};
  c.fillStyle='#222';
  c.beginPath();c.arc(p1.x,p1.y,6,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(p2.x,p2.y,6,0,Math.PI*2);c.fill();
  c.font='800 14px Segoe UI';c.fillText('1',p1.x-18,p1.y+4);c.fillText('2',p2.x+16,p2.y-4);

  function tangentVector(p,r,label){
    const vx=p.x-cx,vy=p.y-cy,m=Math.hypot(vx,vy)||1;
    // для струму в площину — за годинниковою стрілкою
    const tx=vy/m,ty=-vx/m;
    const L=50+70*(I/r)/(I/55);
    arrow(c,p.x,p.y,p.x+tx*L,p.y+ty*L,'#16313a',3);
    const lx=p.x+tx*(L+22), ly=p.y+ty*(L+22);
    vectorLabel(c,lx,ly,label==='B₁'?'1':'2');
  }
  tangentVector(p1,R1,'B₁');
  tangentVector(p2,R2,'B₂');

  c.fillStyle='#607a83';c.font='700 13px Segoe UI';
  c.fillText('чим далі від провідника, тим менший модуль B',460,505);
}

/* ---------- КОТУШКА ---------- */
const cd=$('#coilDirection'),cc=$('#coilCurrent'),tr=$('#turnsRange');
function updateCoil(){
  const normal=cd.value==='normal',I=+cc.value,N=+tr.value;
  $('#coilCurrentOut').textContent=fmt(I,1)+' А';
  $('#turnsOut').textContent=N;
  $('#coilState').textContent=normal?'Ліворуч N, праворуч S':'Ліворуч S, праворуч N';
  $('#coilPoles').textContent=normal?'Лівий торець — N, правий — S':'Лівий торець — S, правий — N';
  const strength=Math.min(100,Math.round(I/8*60+N/20*40));
  $('#coilBar').style.width=strength+'%';
  $('#coilStrengthText').textContent=strength<35?'слабка':strength<70?'середня':'сильна';
}
[cd,cc,tr].forEach(x=>x.oninput=updateCoil);

function drawCoil(){
  const cn=$('#coilCanvas'),c=cn.getContext('2d'),
        normal=cd.value==='normal',I=+cc.value,N=+tr.value;
  c.clearRect(0,0,cn.width,cn.height);c.fillStyle='#fbfefe';c.fillRect(0,0,cn.width,cn.height);
  c.textAlign='center';

  const x0=250,x1=670,cy=275,amp=70,str=Math.min(1,(I/8+N/20)/2);

  // витки котушки
  c.strokeStyle='#a95b45';c.lineWidth=4;
  for(let i=0;i<N;i++){
    const x=x0+i*(x1-x0)/(N-1);
    c.beginPath();c.ellipse(x,cy,18,amp,0,0,Math.PI*2);c.stroke();
  }

  // напрям струму на передній частині витків
  c.strokeStyle='#d64b90';c.lineWidth=3;
  if(normal){
    arrow(c,300,205,300,345,'#d64b90',3);
    arrow(c,620,345,620,205,'#d64b90',3);
  }else{
    arrow(c,300,345,300,205,'#d64b90',3);
    arrow(c,620,205,620,345,'#d64b90',3);
  }
  c.fillStyle='#d64b90';c.font='900 14px Segoe UI';c.fillText('I',280,195);

  // Полюси
  const leftPole=normal?'N':'S',rightPole=normal?'S':'N';
  c.fillStyle=leftPole==='N'?'#1687b7':'#e65349';c.fillRect(185,245,50,60);
  c.fillStyle='#fff';c.font='900 22px Segoe UI';c.fillText(leftPole,210,282);
  c.fillStyle=rightPole==='N'?'#1687b7':'#e65349';c.fillRect(685,245,50,60);
  c.fillStyle='#fff';c.fillText(rightPole,710,282);

  // лінії поля, як у рис. 3.6
  c.strokeStyle=`rgba(47,157,192,${.4+.5*str})`;c.lineWidth=1.4+1.7*str;
  const n=4+Math.round(str*4);
  for(let k=0;k<n;k++){
    const dy=55+k*28;
    c.beginPath();c.moveTo(220,255);
    c.bezierCurveTo(100,255-dy,820,255-dy,710,255);c.stroke();
    c.beginPath();c.moveTo(220,295);
    c.bezierCurveTo(100,295+dy,820,295+dy,710,295);c.stroke();
  }

  // напрям зовні N -> S
  if(normal){
    arrow(c,300,115,600,115,'#2f9dc0',2.5);
    arrow(c,300,435,600,435,'#2f9dc0',2.5);
    arrow(c,610,275,310,275,'#2f9dc0',3); // усередині S -> N
  }else{
    arrow(c,600,115,300,115,'#2f9dc0',2.5);
    arrow(c,600,435,300,435,'#2f9dc0',2.5);
    arrow(c,310,275,610,275,'#2f9dc0',3);
  }

  vectorLabel(c,460,300);
  c.fillStyle='#355d66';c.font='800 13px Segoe UI';
  c.fillText('усередині котушки вектор магнітної індукції напрямлений до її північного полюса N',460,510);
}

/* ---------- QUIZ ---------- */
const qs=[
 ['Лінії магнітного поля прямого провідника зі струмом мають вигляд:',['концентричних кіл','прямих ліній','спіралей'],'a'],
 ['Якщо струм спрямований до нас ⊙, лінії B йдуть:',['за годинниковою стрілкою','проти годинникової стрілки','радіально'],'b'],
 ['Якщо струм спрямований від нас ⊗, лінії B йдуть:',['за годинниковою стрілкою','проти годинникової стрілки','не мають напряму'],'a'],
 ['Зі збільшенням сили струму магнітна індукція:',['зменшується','збільшується','не змінюється'],'b'],
 ['Зі збільшенням відстані від провідника B:',['збільшується','зменшується','не змінюється'],'b'],
 ['Вектор B у точці біля прямого провідника напрямлений:',['по дотичній до магнітної лінії','до провідника','від провідника'],'a'],
 ['Котушка зі струмом має:',['один полюс','два полюси N і S','полюсів не має'],'b'],
 ['Щоб визначити N-полюс котушки, використовують:',['правило правої руки','закон Ома','правило лівої руки'],'a'],
 ['Якщо змінити напрям струму в котушці, її полюси:',['не зміняться','поміняються місцями','зникнуть'],'b']
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
  $('#result').className=s>=8?'good':'bad';
};
$('#reset').onclick=()=>{build();$('#result').textContent='';};

function animate(){
  drawScrew();
  drawStraight();
  drawCoil();
  requestAnimationFrame(animate);
}

build();
updateScrew();
updateStraight();
updateCoil();
requestAnimationFrame(animate);
