const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],fmt=(n,d=2)=>Number(n).toFixed(d).replace('.',',');
function tab(id){$$('.tab').forEach(x=>x.classList.toggle('active',x.dataset.tab===id));$$('.panel').forEach(x=>x.classList.toggle('active-panel',x.id===id));$('#'+id)?.scrollIntoView({behavior:'smooth'})}$$('.tab').forEach(x=>x.onclick=()=>tab(x.dataset.tab));$$('[data-go]').forEach(x=>x.onclick=()=>tab(x.dataset.go));
let fieldOn=true;$$('.field').forEach(b=>b.onclick=()=>{fieldOn=b.dataset.field==='on';$$('.field').forEach(x=>x.classList.toggle('active',x===b))});
const ir=$('#iRange'),sr=$('#sRange'),nr=$('#nRange');function updateElectrons(){const I=+ir.value,S=+sr.value*1e-6,n=+nr.value*1e28,v=I/(n*1.602e-19*S);$('#iOut').textContent=fmt(I,1)+' А';$('#sOut').textContent=fmt(S*1e6,1)+' мм²';$('#nOut').textContent=fmt(n/1e28,1)+'·10²⁸ м⁻³';$('#speed').textContent=v.toExponential(2).replace('.',',')+' м/с'}[ir,sr,nr].forEach(x=>x.oninput=updateElectrons);
const particles=Array.from({length:34},(_,i)=>({x:80+(i*67)%650,y:120+(i*83)%190,p:i}));function drawElectrons(t){const cn=$('#electronCanvas'),c=cn.getContext('2d');c.clearRect(0,0,cn.width,cn.height);c.fillStyle='#eef7f7';c.fillRect(55,75,710,285);c.strokeStyle='#31717b';c.lineWidth=5;c.strokeRect(55,75,710,285);for(let x=95;x<750;x+=75)for(let y=105;y<350;y+=70){c.fillStyle='#e85a4d';c.beginPath();c.arc(x,y,7,0,Math.PI*2);c.fill()}particles.forEach((p,i)=>{const drift=fieldOn?-(t*.025*(+.2+ +ir.value/5)):0,pulse=Math.sin(t/180+i)*12;let x=80+(((p.x+drift-80)%660)+660)%660,y=p.y+pulse;c.fillStyle='#168fc0';c.beginPath();c.arc(x,y,6,0,Math.PI*2);c.fill();c.fillStyle='#fff';c.font='10px Arial';c.textAlign='center';c.fillText('−',x,y+3)});c.font='800 16px Segoe UI';if(fieldOn){c.fillStyle='#e24f43';c.fillText('Напрям струму  →',620,48);c.fillStyle='#168fc0';c.fillText('←  Дрейф електронів',180,48)}else{c.fillStyle='#607a83';c.fillText('Поле відсутнє: рух хаотичний',410,48)}}
const metals={copper:{name:'Мідь',a:.0039},aluminum:{name:'Алюміній',a:.0038},tungsten:{name:'Вольфрам',a:.0045},steel:{name:'Сталь',a:.006}};const metal=$('#metal'),r0=$('#r0Range'),temp=$('#tRange'),ur=$('#uRange');function tv(){const m=metals[metal.value],R0=+r0.value,t=+temp.value,R=Math.max(.01,R0*(1+m.a*t)),I=+ur.value/R;return{m,R0,t,R,I,U:+ur.value}}function updateTemp(){const v=tv();$('#r0Out').textContent=v.R0+' Ом';$('#tOut').textContent=v.t+' °C';$('#uOut').textContent=v.U+' В';$('#resistance').textContent='R = '+fmt(v.R)+' Ом';$('#current').textContent='I = '+fmt(v.I)+' А';drawGraph()}[metal,r0,temp,ur].forEach(x=>x.oninput=updateTemp);function drawGraph(){const cn=$('#graph'),c=cn.getContext('2d'),v=tv(),p={l:70,r:30,t:30,b:60},w=cn.width-p.l-p.r,h=cn.height-p.t-p.b;c.clearRect(0,0,cn.width,cn.height);c.fillStyle='#fff';c.fillRect(0,0,cn.width,cn.height);c.strokeStyle='#dce7e9';for(let k=0;k<=6;k++){let x=p.l+w*k/6,y=p.t+h*k/6;c.beginPath();c.moveTo(x,p.t);c.lineTo(x,p.t+h);c.stroke();c.beginPath();c.moveTo(p.l,y);c.lineTo(p.l+w,y);c.stroke()}const maxR=v.R0*(1+v.m.a*500)*1.1;c.strokeStyle='#0a9292';c.lineWidth=4;c.beginPath();for(let k=0;k<=100;k++){let T=-100+600*k/100,R=Math.max(0,v.R0*(1+v.m.a*T)),x=p.l+w*k/100,y=p.t+h-h*R/maxR;k?c.lineTo(x,y):c.moveTo(x,y)}c.stroke();let x=p.l+w*(v.t+100)/600,y=p.t+h-h*v.R/maxR;c.fillStyle='#e35346';c.beginPath();c.arc(x,y,7,0,Math.PI*2);c.fill();c.fillStyle='#365d66';c.font='15px Segoe UI';c.fillText('t, °C',cn.width-60,cn.height-20);c.fillText('R, Ом',20,28);c.fillText(`${v.m.name}: α = ${v.m.a.toFixed(4)} K⁻¹`,p.l+18,p.t+22)}
const sm=$('#superMaterial'),kr=$('#kelvinRange'),critical={mercury:4.2,lead:7.2,ceramic:93};function updateSuper(){const T=+kr.value,Tc=critical[sm.value],superOn=T<Tc;$('#kelvinOut').textContent=T+' K';$('#rhoValue').textContent=superOn?'ρ = 0':'ρ > 0';$('#superStatus').textContent=superOn?'Надпровідний стан: опір дорівнює нулю':'Звичайний провідний стан';$('#superStatus').className='status '+(superOn?'superconducting':'');drawSuper()}[sm,kr].forEach(x=>x.oninput=updateSuper);function drawSuper(){const cn=$('#superCanvas'),c=cn.getContext('2d'),T=+kr.value,Tc=critical[sm.value],on=T<Tc;c.clearRect(0,0,cn.width,cn.height);c.fillStyle='#fbfefe';c.fillRect(0,0,cn.width,cn.height);c.strokeStyle='#294f58';c.lineWidth=4;c.beginPath();c.arc(410,220,135,0,Math.PI*2);c.stroke();c.strokeStyle=on?'#18b8d3':'#df5b4f';c.lineWidth=12;c.beginPath();c.arc(410,220,115,0,Math.PI*2);c.stroke();c.fillStyle=on?'#dff8ff':'#fff0ec';c.beginPath();c.arc(410,220,70,0,Math.PI*2);c.fill();c.fillStyle=on?'#0785a0':'#a55048';c.font='900 28px Segoe UI';c.textAlign='center';c.fillText(on?'R = 0':'R > 0',410,230);c.font='700 16px Segoe UI';c.fillText(`T = ${T} K   Tc = ${Tc} K`,410,330)}
const qs=[['Носії струму в металах:',['Вільні електрони','Протони','Нейтрони'],'a'],['Електрони дрейфують:',['Від + до −','Від − до +','Без напрямку'],'b'],['При нагріванні металу його опір:',['Зростає','Зменшується','Не змінюється'],'a'],['Формула температурної залежності:',['R=R₀(1+αt)','R=R₀/t','R=α/t'],'a'],['Надпровідність — це:',['Стрибкоподібне падіння опору до нуля','Плавлення','Зростання опору'],'a'],['Одиниця α:',['К⁻¹','Ом','А'],'a']];function build(){$('#quizBox').innerHTML=qs.map((q,i)=>`<article class="question"><p>${i+1}. ${q[0]}</p><div class="answers">${q[1].map((a,j)=>`<label><input type="radio" name="q${i}" value="${String.fromCharCode(97+j)}"> ${a}</label>`).join('')}</div></article>`).join('')}$('#check').onclick=()=>{let s=0;qs.forEach((q,i)=>{const a=$(`input[name=q${i}]:checked`),card=$$('.question')[i],ok=a?.value===q[2];card.className='question '+(ok?'correct':'wrong');if(ok)s++});$('#result').textContent=`Результат: ${s} / 6`;$('#result').className=s>=5?'good':'bad'};$('#reset').onclick=()=>{build();$('#result').textContent=''};
function animate(t){drawElectrons(t);drawSuper();requestAnimationFrame(animate)}build();updateElectrons();updateTemp();updateSuper();requestAnimationFrame(animate);

// Написи температур винесені нижче зображення кільця.
function drawSuper(){
  const cn=$('#superCanvas'),c=cn.getContext('2d'),T=+kr.value,Tc=critical[sm.value],on=T<Tc;
  c.clearRect(0,0,cn.width,cn.height);c.fillStyle='#fbfefe';c.fillRect(0,0,cn.width,cn.height);
  c.strokeStyle='#294f58';c.lineWidth=4;c.beginPath();c.arc(410,195,130,0,Math.PI*2);c.stroke();
  c.strokeStyle=on?'#18b8d3':'#df5b4f';c.lineWidth=12;c.beginPath();c.arc(410,195,110,0,Math.PI*2);c.stroke();
  c.fillStyle=on?'#dff8ff':'#fff0ec';c.beginPath();c.arc(410,195,66,0,Math.PI*2);c.fill();
  c.fillStyle=on?'#0785a0':'#a55048';c.font='900 28px Segoe UI';c.textAlign='center';c.fillText(on?'R = 0':'R > 0',410,205);
  c.fillStyle='#365d66';c.font='700 18px Segoe UI';c.fillText(`T = ${T} K   Tc = ${Tc} K`,410,385);
}

// Точні позначення за підручником: I = n|e|v̄S, v̄ = I/(n|e|S).
document.querySelector('.hero aside b').textContent='I = n|e|v̄S';
document.querySelector('#electrons .answer > span').textContent='Середня швидкість напрямленого руху';
document.querySelector('#electrons .answer small').textContent='v̄ = I/(n|e|S)';

function scientificUk(value){
  const superscript={'-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
  const [mantissa,exponent]=value.toExponential(2).split('e');
  return mantissa.replace('.',',')+'·10'+[...String(Number(exponent))].map(ch=>superscript[ch]).join('');
}

function updateElectrons(){
  const I=+ir.value,S=+sr.value*1e-6,n=+nr.value*1e28;
  const averageVelocity=I/(n*1.602176634e-19*S);
  $('#iOut').textContent=fmt(I,1)+' А';
  $('#sOut').textContent=fmt(S*1e6,1)+' мм²';
  $('#nOut').textContent=fmt(n/1e28,1)+'·10²⁸ м⁻³';
  $('#speed').textContent=scientificUk(averageVelocity)+' м/с';
}

function drawElectrons(t){
  const cn=$('#electronCanvas'),c=cn.getContext('2d');
  c.clearRect(0,0,cn.width,cn.height);c.fillStyle='#eef7f7';c.fillRect(55,75,710,285);c.strokeStyle='#31717b';c.lineWidth=5;c.strokeRect(55,75,710,285);
  for(let x=95;x<750;x+=75)for(let y=105;y<350;y+=70){c.fillStyle='#e85a4d';c.beginPath();c.arc(x,y,7,0,Math.PI*2);c.fill()}
  particles.forEach((p,i)=>{const drift=fieldOn?-(t*.025*(.2+(+ir.value)/5)):0,pulse=Math.sin(t/180+i)*12;const x=80+(((p.x+drift-80)%660)+660)%660,y=p.y+pulse;c.fillStyle='#168fc0';c.beginPath();c.arc(x,y,6,0,Math.PI*2);c.fill();c.fillStyle='#fff';c.font='10px Arial';c.textAlign='center';c.fillText('−',x,y+3)});
  c.font='800 16px Segoe UI';c.textAlign='center';
  if(fieldOn){c.fillStyle='#e24f43';c.fillText('Напрям струму I  →',620,45);c.fillStyle='#5e49a7';c.fillText('Напрям поля E⃗  →',410,45);c.fillStyle='#168fc0';c.fillText('←  Середня швидкість v̄',190,45)}
  else{c.fillStyle='#607a83';c.fillText('E⃗ = 0: електрони рухаються хаотично, напрямленого струму немає',410,45)}
}

// Повторне оновлення після виправлення позначень і точного значення |e|.
updateElectrons();
