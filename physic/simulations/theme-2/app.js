const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];
let connection='series';
let animationStart=performance.now();

function fmt(value,digits=2){return Number(value).toFixed(digits).replace('.',',')}

function openTab(id){
  $$('.tab').forEach(tab=>tab.classList.toggle('active',tab.dataset.tab===id));
  $$('.panel').forEach(panel=>panel.classList.toggle('active-panel',panel.id===id));
  $('#'+id)?.scrollIntoView({behavior:'smooth',block:'start'});
}
$$('.tab').forEach(tab=>tab.addEventListener('click',()=>openTab(tab.dataset.tab)));
$$('[data-go]').forEach(button=>button.addEventListener('click',()=>openTab(button.dataset.go)));

const uRange=$('#uRange'),r1Range=$('#r1Range'),r2Range=$('#r2Range'),circuitSwitch=$('#circuitSwitch');
$$('.mode').forEach(button=>button.addEventListener('click',()=>{
  connection=button.dataset.mode;
  $$('.mode').forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active))});
  animationStart=performance.now();updateLab();
}));

function values(){
  const U=+uRange.value,R1=+r1Range.value,R2=+r2Range.value,closed=circuitSwitch.checked;
  const Req=connection==='series'?R1+R2:(R1*R2)/(R1+R2);
  const I=closed?U/Req:0;
  return {U,R1,R2,Req,I,I1:connection==='series'?I:(closed?U/R1:0),I2:connection==='series'?I:(closed?U/R2:0),U1:connection==='series'?I*R1:(closed?U:0),U2:connection==='series'?I*R2:(closed?U:0),closed};
}

function updateLab(){
  const v=values();
  $('#uOut').textContent=v.U+' В';$('#r1Out').textContent=v.R1+' Ом';$('#r2Out').textContent=v.R2+' Ом';
  $('#rEq').textContent=fmt(v.Req)+' Ом';$('#iTotal').textContent=fmt(v.I)+' А';$('#i1').textContent=fmt(v.I1)+' А';$('#i2').textContent=fmt(v.I2)+' А';$('#u1').textContent=fmt(v.U1)+' В';$('#u2').textContent=fmt(v.U2)+' В';
  $('#circuitTitle').textContent=connection==='series'?'Послідовне коло':'Паралельне коло';
  $('#currentCheck').textContent=connection==='series'?`I = I₁ = I₂ = ${fmt(v.I)} А`:`I = I₁ + I₂ = ${fmt(v.I1)} + ${fmt(v.I2)} = ${fmt(v.I)} А`;
  $('#voltageCheck').textContent=connection==='series'?`U = U₁ + U₂ = ${fmt(v.U1)} + ${fmt(v.U2)} = ${fmt(v.U)} В`:`U = U₁ = U₂ = ${fmt(v.U)} В`;
  $('#resistanceCheck').textContent=connection==='series'?`R = R₁ + R₂ = ${v.R1} + ${v.R2} = ${fmt(v.Req)} Ом`:`R = R₁R₂/(R₁+R₂) = ${fmt(v.Req)} Ом`;
  $('#circuitStatus').className='status '+(v.closed?'on':'off');
  $('#circuitStatus').textContent=v.closed?'● Коло замкнене — струм протікає':'○ Коло розімкнене — струму немає';
  drawCircuit(performance.now());
}
[uRange,r1Range,r2Range,circuitSwitch].forEach(input=>input.addEventListener('input',updateLab));
$('#randomBtn').addEventListener('click',()=>{uRange.value=6+Math.floor(Math.random()*19);r1Range.value=5+Math.floor(Math.random()*56);r2Range.value=5+Math.floor(Math.random()*56);circuitSwitch.checked=true;animationStart=performance.now();updateLab()});

function line(ctx,x1,y1,x2,y2,color='#245865',width=6){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.stroke()}
function resistor(ctx,x,y,w,label){ctx.fillStyle='#fff';ctx.strokeStyle='#147f89';ctx.lineWidth=6;ctx.beginPath();ctx.roundRect(x,y-22,w,44,4);ctx.fill();ctx.stroke();ctx.fillStyle='#164653';ctx.font='700 18px Segoe UI';ctx.textAlign='center';ctx.fillText(label,x+w/2,y+7)}
function arrow(ctx,x,y,angle){ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle='#e44e42';ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(-8,-7);ctx.lineTo(-8,7);ctx.closePath();ctx.fill();ctx.restore()}
function battery(ctx){line(ctx,112,142,112,318);line(ctx,112,142,145,142);line(ctx,112,318,145,318);line(ctx,145,128,145,156,'#173f49',5);line(ctx,168,120,168,164,'#173f49',7);ctx.fillStyle='#d94e45';ctx.font='900 22px Segoe UI';ctx.fillText('−',139,108);ctx.fillText('+',163,188);ctx.fillStyle='#53717a';ctx.font='700 15px Segoe UI';ctx.fillText('Джерело',106,350)}
function meter(ctx,x,y,label,value){ctx.fillStyle='#f7ffff';ctx.strokeStyle='#15909a';ctx.lineWidth=5;ctx.beginPath();ctx.arc(x,y,34,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#127d84';ctx.font='900 23px Segoe UI';ctx.textAlign='center';ctx.fillText(label,x,y+7);ctx.font='700 13px Segoe UI';ctx.fillStyle='#355d66';ctx.fillText(value,x+36,y+55)}

function drawCircuit(time){
  const canvas=$('#circuitCanvas'),ctx=canvas.getContext('2d'),v=values();ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#fbfefe';ctx.fillRect(0,0,canvas.width,canvas.height);battery(ctx);
  line(ctx,168,142,275,142);line(ctx,700,142,700,318);line(ctx,700,318,112,318);
  ctx.fillStyle='#fff';ctx.strokeStyle='#285b66';ctx.lineWidth=4;[275,335].forEach(x=>{ctx.beginPath();ctx.arc(x,142,6,0,Math.PI*2);ctx.fill();ctx.stroke()});
  line(ctx,275,142,v.closed?335:316,v.closed?142:116,'#0a8b91',6);ctx.fillStyle='#54717a';ctx.font='700 15px Segoe UI';ctx.fillText('Ключ',280,105);
  if(connection==='series'){
    line(ctx,335,142,700,142);
    resistor(ctx,390,318,105,'R₁');resistor(ctx,535,318,105,'R₂');meter(ctx,700,230,'A',fmt(v.I)+' А');
    if(v.closed){arrow(ctx,240,142,0);arrow(ctx,650,142,0);arrow(ctx,700,275,Math.PI/2);arrow(ctx,665,318,Math.PI);arrow(ctx,350,318,Math.PI);arrow(ctx,112,210,-Math.PI/2)}
  }else{
    line(ctx,335,142,360,142);line(ctx,360,142,360,286);line(ctx,360,210,650,210);line(ctx,360,286,650,286);line(ctx,650,142,650,286);line(ctx,650,142,700,142);resistor(ctx,450,210,110,'R₁');resistor(ctx,450,286,110,'R₂');meter(ctx,700,230,'A',fmt(v.I)+' А');
    ctx.fillStyle='#0c8b91';[[360,210],[360,286],[650,210],[650,286]].forEach(([x,y])=>{ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.fill()});
    if(v.closed){arrow(ctx,240,142,0);arrow(ctx,420,210,0);arrow(ctx,420,286,0);arrow(ctx,610,210,0);arrow(ctx,610,286,0);arrow(ctx,700,275,Math.PI/2);arrow(ctx,665,318,Math.PI);arrow(ctx,260,318,Math.PI);arrow(ctx,112,210,-Math.PI/2)}
  }
  if(v.closed&&v.I>0){
    const phase=((time-animationStart)*Math.min(0.15,0.035+v.I*0.02))%100;ctx.setLineDash([10,16]);ctx.lineDashOffset=-phase;ctx.strokeStyle='#e44e42';ctx.lineWidth=3;ctx.globalAlpha=.75;
    ctx.beginPath();
    if(connection==='series'){
      ctx.moveTo(175,142);ctx.lineTo(700,142);ctx.lineTo(700,318);ctx.lineTo(112,318);ctx.lineTo(112,142);ctx.lineTo(138,142);
    }else{
      ctx.moveTo(175,142);ctx.lineTo(360,142);ctx.lineTo(360,210);ctx.lineTo(650,210);ctx.lineTo(650,142);ctx.lineTo(700,142);ctx.lineTo(700,318);ctx.lineTo(112,318);ctx.lineTo(112,142);ctx.lineTo(138,142);
      ctx.moveTo(360,142);ctx.lineTo(360,286);ctx.lineTo(650,286);ctx.lineTo(650,142);
    }
    ctx.stroke();
    ctx.setLineDash([]);ctx.globalAlpha=1;
  }
}
function animate(time){drawCircuit(time);requestAnimationFrame(animate)}

const raRange=$('#raRange'),nARange=$('#nARange'),rvRange=$('#rvRange'),nVRange=$('#nVRange');
function updateMeters(){const RA=+raRange.value,nA=+nARange.value,RV=+rvRange.value,nV=+nVRange.value;$('#raOut').textContent=RA+' Ом';$('#nAOut').textContent=nA;$('#rvOut').textContent=RV+' кОм';$('#nVOut').textContent=nV;$('#shuntAnswer').textContent='Rш = '+fmt(RA/(nA-1))+' Ом';$('#extraAnswer').textContent='Rд = '+fmt(RV*(nV-1))+' кОм'}
[raRange,nARange,rvRange,nVRange].forEach(input=>input.addEventListener('input',updateMeters));

const questions=[
  ['Що однакове в усіх послідовно з’єднаних провідниках?',['Напруга','Сила струму','Опір'],'b'],
  ['Як визначають загальний опір при послідовному з’єднанні?',['R = R₁ + R₂','1/R = 1/R₁ + 1/R₂','R = R₁ − R₂'],'a'],
  ['Що однакове на паралельних вітках?',['Сила струму','Опір','Напруга'],'c'],
  ['Як пов’язані струми в паралельному колі?',['I = I₁ = I₂','I = I₁ + I₂','I = I₁ − I₂'],'b'],
  ['Як під’єднують шунт до амперметра?',['Паралельно','Послідовно','Замість джерела'],'a'],
  ['Як під’єднують додатковий опір до вольтметра?',['Паралельно','Послідовно','До амперметра'],'b']
];
function buildQuiz(){$('#quizBox').innerHTML=questions.map((q,i)=>`<article class="question"><p>${i+1}. ${q[0]}</p><div class="answers">${q[1].map((answer,j)=>`<label><input type="radio" name="q${i}" value="${String.fromCharCode(97+j)}"> ${answer}</label>`).join('')}</div></article>`).join('')}
$('#checkQuiz').addEventListener('click',()=>{let score=0;questions.forEach((q,i)=>{const selected=$(`input[name="q${i}"]:checked`),card=$$('.question')[i],correct=selected?.value===q[2];card.classList.remove('correct','wrong');card.classList.add(correct?'correct':'wrong');if(correct)score++});const result=$('#quizResult');result.textContent=`Результат: ${score} / ${questions.length}`;result.className=score>=5?'good':'bad'});
$('#resetQuiz').addEventListener('click',()=>{buildQuiz();$('#quizResult').textContent=''});

buildQuiz();updateMeters();updateLab();requestAnimationFrame(animate);
