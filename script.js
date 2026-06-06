const START_DATE_KEY = 'life90StartDate';
const todayKey = new Date().toISOString().slice(0,10);
const dataKey = `life90-${todayKey}`;
const defaultHabits = ['SRF Energization','Meditation','Prayer','Protein Target','Water Target','Movement','Sleep Before 10:30 PM','Gayathri Program 30 mins','Goal Journal','Night Goal Script','Daily Money Check'];
const affirmations = ['I am becoming a man who takes care of the body God entrusted to him.','My progress comes from returning, not perfection.','I trust myself to come back.','God walks beside me as I heal.','I love myself for who I am.','Health is my main quest. Everything else is a side quest.','I trust myself to bounce back.','Recovery counts. My body comes before my ego.'];
const rules = ['Health is the Main Quest. Everything else is a side quest.','Never Miss Twice. If I miss once, I simply return.','No Catching Up. No punishment. No doubling tasks. Continue normally.','Recovery Counts. Recovery is productive.','80% Consistency Wins. Perfection is not required.','No New Systems for 90 Days. Follow this system.','My body comes before my ego. If my body needs rest, recovery wins.'];
const schedule = {
  Monday:['Workout A','Health focus','Daily money check'],
  Tuesday:['1 hour feature film writing','30 min job search','Stay with resistance'],
  Wednesday:['Workout B','Create visibility content','Health focus'],
  Thursday:['1 hour feature film writing','30 min job search'],
  Friday:['Workout C','Review visibility content'],
  Saturday:['1 hour feature film writing','Weekly reset'],
  Sunday:['Recovery Yoga','Full Body Oil Massage','Post content','Weekly review']
};
let state = load(dataKey) || {habits: defaultHabits.map(name=>({name,done:false}))};
let start = localStorage.getItem(START_DATE_KEY); if(!start){start=todayKey;localStorage.setItem(START_DATE_KEY,start)}
function load(k){try{return JSON.parse(localStorage.getItem(k))}catch{return null}}
function save(){localStorage.setItem(dataKey, JSON.stringify(state))}
function dayNumber(){return Math.min(90, Math.max(1, Math.floor((new Date(todayKey)-new Date(start))/(86400000))+1));}
function currentWeek(){return Math.ceil(dayNumber()/7)}
function el(id){return document.getElementById(id)}
function init(){
  el('todayDate').textContent = new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  const d=dayNumber(); el('dayNumber').textContent=d; el('ringProgress').style.strokeDashoffset = 327 - (327*(d/90));
  el('affirmationText').textContent = affirmations[Math.floor(Date.now()/3600000)%affirmations.length];
  renderHabits(); renderFocus(); renderSchedule(); renderVisibility(); renderRules(); bindInputs();
}
function renderHabits(){
  const list=el('habitList'); list.innerHTML='';
  state.habits.forEach((h,i)=>{ const row=document.createElement('div'); row.className='habit'; row.innerHTML=`<div class="habit-left"><input type="checkbox" ${h.done?'checked':''}/><span class="habit-name ${h.done?'done':''}">${h.name}</span></div><div><button class="icon-btn rename">Rename</button> <button class="icon-btn del">Delete</button></div>`;
    row.querySelector('input').onchange=e=>{h.done=e.target.checked;save();renderHabits()};
    row.querySelector('.del').onclick=()=>{state.habits.splice(i,1);save();renderHabits()};
    row.querySelector('.rename').onclick=()=>{const n=prompt('Rename habit/task',h.name); if(n&&n.trim()){h.name=n.trim();save();renderHabits()}};
    list.appendChild(row);
  });
  const done=state.habits.filter(h=>h.done).length; el('habitCount').textContent=`${done}/${state.habits.length}`;
}
el('habitForm').addEventListener('submit',e=>{e.preventDefault();const v=el('newHabit').value.trim();if(v){state.habits.push({name:v,done:false});el('newHabit').value='';save();renderHabits()}});
function renderFocus(){const day=new Date().toLocaleDateString('en-GB',{weekday:'long'}); el('todayFocus').innerHTML=(schedule[day]||[]).map((x,i)=>`<div class="focus-pill"><b>${x}</b><span>${i==0?'Main':'Side'}</span></div>`).join('')||'<p>No fixed focus. Recovery counts.</p>'}
function renderSchedule(){const day=new Date().toLocaleDateString('en-GB',{weekday:'long'}); el('weeklySchedule').innerHTML=Object.entries(schedule).map(([d,items])=>`<div class="schedule-card ${d===day?'today':''}"><h4>${d}</h4><ul>${items.map(i=>`<li>${i}</li>`).join('')}</ul></div>`).join('')}
function renderVisibility(){const week=currentWeek(); let html=''; for(let i=1;i<=13;i++){const req=i%2===0?'Face / Voice / Video required':'Image / Text optional'; html+=`<div class="timeline-item ${i===week?'active':''}"><div><b>Week ${i}</b><small>${req}</small></div><span class="badge">${i%2===0?'Be seen':'Prepare'}</span></div>`} el('visibilityPlan').innerHTML=html}
function renderRules(){el('rulesList').innerHTML=rules.map((r,i)=>`<div class="rule-card"><b>Rule ${i+1}</b>${r}</div>`).join('')}
function bindInputs(){['protein','water','steps','sleep','bp','wrist','mood','energy','healthNote','workoutType','workoutLog','morningJournal','eveningJournal','scoreHealth','scoreCreativity','scoreVisibility','scoreMoney','scoreSpirit','weeklyJournal'].forEach(id=>{const node=el(id); if(!node)return; if(state[id]!==undefined) node.value=state[id]; node.addEventListener('input',()=>{state[id]=node.value;save(); if(id==='wrist')el('wristVal').textContent=node.value+'/10'; if(id==='energy')el('energyVal').textContent=node.value+'/10';});}); el('wristVal').textContent=(el('wrist').value||0)+'/10'; el('energyVal').textContent=(el('energy').value||5)+'/10'}
document.querySelectorAll('.tab').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.tab,.view').forEach(x=>x.classList.remove('active'));btn.classList.add('active');el(btn.dataset.tab).classList.add('active'); window.scrollTo({top:0,behavior:'smooth'});}));
init();
