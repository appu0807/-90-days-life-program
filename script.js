const STORE_KEY = 'life90_v5';
const todayISO = () => new Date().toISOString().slice(0,10);
const prettyDate = (iso=todayISO()) => new Date(iso+'T12:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
const defaultHabits = [
  {id:crypto.randomUUID(), name:'SRF Energization', category:'Spiritual'},
  {id:crypto.randomUUID(), name:'Meditation', category:'Spiritual'},
  {id:crypto.randomUUID(), name:'Prayer', category:'Spiritual'},
  {id:crypto.randomUUID(), name:'Protein Target', category:'Health'},
  {id:crypto.randomUUID(), name:'Water Target', category:'Health'},
  {id:crypto.randomUUID(), name:'Movement', category:'Health'},
  {id:crypto.randomUUID(), name:'Sleep Before 10:30 PM', category:'Health'},
  {id:crypto.randomUUID(), name:'Gayathri Program', category:'Growth'},
  {id:crypto.randomUUID(), name:'Goal Journal', category:'Growth'},
  {id:crypto.randomUUID(), name:'Night Goal Script', category:'Growth'},
  {id:crypto.randomUUID(), name:'Daily Money Check', category:'Money'}
];
const affirmations = [
 'Health is the Main Quest. Everything else is a side quest.',
 'My progress comes from returning, not perfection.',
 'I trust myself to come back.',
 'God walks beside me as I heal.',
 'I am becoming a man who takes care of the body God entrusted to him.',
 'Recovery counts. My body comes before my ego.',
 'I allow myself to be seen before I feel ready.'
];
const defaultPlan = {
 Monday:['Workout A'], Tuesday:['1 hour feature film writing','30 min job search'], Wednesday:['Workout B','Visibility create'], Thursday:['1 hour feature film writing','30 min job search'], Friday:['Workout C','Visibility review'], Saturday:['1 hour feature film writing'], Sunday:['Recovery yoga','Full body oil massage','Visibility post','Weekly review']
};
let state = load(); let currentView='today';
function load(){
 try{const saved=JSON.parse(localStorage.getItem(STORE_KEY)); if(saved) return saved;}catch(e){}
 return {startDate:todayISO(), habits:defaultHabits, entries:{}, plan:defaultPlan, focus:'Take care of my body gently today.'};
}
function save(){localStorage.setItem(STORE_KEY, JSON.stringify(state));}
function entry(date=todayISO()){
 if(!state.entries[date]) state.entries[date]={checks:{},health:{protein:0,water:0,steps:0,sleep:0,bp:'',wrist:0,mood:'Calm',energy:5},journal:'',workout:'',weekly:{health:0,creativity:0,visibility:0,money:0,spirituality:0,notes:''}};
 return state.entries[date];
}
function dayNum(){let s=new Date(state.startDate+'T00:00:00'), t=new Date(todayISO()+'T00:00:00'); return Math.min(90, Math.max(1, Math.floor((t-s)/86400000)+1));}
function refreshHeader(){document.getElementById('todayDate').textContent=prettyDate(); document.getElementById('dayNumber').textContent=dayNum(); document.querySelector('.day-ring').style.setProperty('--progress',`${dayNum()/90*100}%`)}
function nav(view){currentView=view; document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===view)); render();}
document.querySelectorAll('.nav-btn').forEach(b=>b.onclick=()=>nav(b.dataset.view));
function html(strings,...vals){return strings.map((s,i)=>s+(vals[i]??'')).join('')}
function habitRows(date=todayISO(), editable=false){ const e=entry(date); return state.habits.map(h=>html`<div class="habit-row"><div class="habit-left"><input class="check" type="checkbox" ${e.checks[h.id]?'checked':''} onchange="toggleHabit('${date}','${h.id}',this.checked)"><div><div class="habit-name">${escapeHtml(h.name)}</div><div class="small">${escapeHtml(h.category)}</div></div></div>${editable?`<button class="pill" onclick="editHabit('${h.id}')">Edit</button>`:''}</div>`).join('')}
function render(){refreshHeader(); const v=document.getElementById('view'); const date=todayISO(); const e=entry(date); const aff=affirmations[(new Date().getHours()+dayNum())%affirmations.length];
 if(currentView==='today') v.innerHTML=html`
  <section class="card feature"><p class="label">Today's affirmation</p><h2 class="affirmation">${aff}</h2></section>
  <div class="two-col"><section class="card"><p class="label">Today's focus</p><div class="focus-box"><div class="focus-icon">☀️</div><div><h2 class="section-title">${escapeHtml(state.focus)}</h2><p class="small">One main focus. No catching up. Just return.</p></div></div><div class="actions"><button class="btn secondary" onclick="editFocus()">Change focus</button></div></section><section class="card"><p class="label">Today progress</p>${progressBlock(date)}</section></div>
  <section class="card"><h2 class="section-title">Today's habits</h2><div class="habit-list">${habitRows(date)}</div></section>
  <section class="card"><h2 class="section-title">Evening journal</h2><textarea placeholder="What did I learn today? What am I grateful for? Did I return today?" oninput="entry('${date}').journal=this.value; save()">${escapeHtml(e.journal)}</textarea></section>`;
 if(currentView==='habits') v.innerHTML=html`<section class="card"><h2 class="section-title">Core habits</h2><p class="small">Edit here once. These habits appear every day for the whole 90 days.</p><div class="habit-list">${state.habits.map(h=>`<div class="habit-row"><div><div class="habit-name">${escapeHtml(h.name)}</div><div class="small">${escapeHtml(h.category)}</div></div><div class="actions"><button class="pill" onclick="editHabit('${h.id}')">Rename</button><button class="pill" onclick="deleteHabit('${h.id}')">Delete</button></div></div>`).join('')}</div><hr><div class="form-grid"><input id="newHabit" class="input" placeholder="New habit"><select id="newCat"><option>Spiritual</option><option>Health</option><option>Growth</option><option>Money</option><option>Creative</option><option>Custom</option></select></div><br><button class="btn" onclick="addHabit()">Add habit</button></section>`;
 if(currentView==='log') v.innerHTML=html`<section class="card"><h2 class="section-title">Past entries</h2><p class="small">Choose any date to check what you logged.</p><input id="logDate" class="input" type="date" value="${date}" onchange="renderLogDate(this.value)"><div id="logContent">${logContent(date)}</div></section><section class="card"><h2 class="section-title">Recent days</h2><div class="log-list">${recentDays()}</div></section>`;
 if(currentView==='health') v.innerHTML=html`<section class="card"><h2 class="section-title">Health log</h2><p class="small">Targets: 90g protein · 3L water · 7000 steps · 8h sleep</p><div class="form-grid">${healthInput('protein','Protein g','number')}${healthInput('water','Water L','number')}${healthInput('steps','Steps','number')}${healthInput('sleep','Sleep hours','number')}${healthInput('bp','Blood pressure','text')}${healthInput('wrist','Wrist pain /10','range')}${healthSelect('mood')}${healthInput('energy','Energy /10','range')}</div></section><section class="card"><h2 class="section-title">Quick progress</h2><div class="stat-grid">${stat('Protein',e.health.protein,90,'g')}${stat('Water',e.health.water,3,'L')}${stat('Steps',e.health.steps,7000,'')}${stat('Sleep',e.health.sleep,8,'h')}</div></section>`;
 if(currentView==='plan') v.innerHTML=html`<section class="card"><h2 class="section-title">Weekly schedule</h2><p class="small">This is your 90-day plan. Keep it light and repeatable.</p><div class="grid">${Object.keys(state.plan).map(d=>`<div class="schedule-day"><strong>${d}</strong><textarea oninput="state.plan['${d}']=this.value.split('\n').filter(Boolean); save()">${state.plan[d].join('\n')}</textarea></div>`).join('')}</div></section><section class="card"><h2 class="section-title">Workout log</h2><select class="input" id="workoutType"><option>Rest / Recovery</option><option>Workout A</option><option>Workout B</option><option>Workout C</option><option>Recovery Yoga</option></select><br><br><textarea oninput="entry('${date}').workout=this.value; save()" placeholder="Exercises, reps, wrist notes, how it felt...">${escapeHtml(e.workout)}</textarea></section>`;
 if(currentView==='report') v.innerHTML=html`<section class="card"><h2 class="section-title">Weekly report</h2><p class="small">This week is about returning, not perfection.</p>${weeklyReport()}</section><section class="card"><h2 class="section-title">Weekly review journal</h2><div class="form-grid">${reviewRange('health','Health')}${reviewRange('creativity','Creativity')}${reviewRange('visibility','Visibility')}${reviewRange('money','Money')}${reviewRange('spirituality','Spirituality')}</div><br><textarea oninput="entry('${date}').weekly.notes=this.value; save()" placeholder="What worked? What didn’t? What am I learning? What will I improve next week?">${escapeHtml(e.weekly.notes||'')}</textarea></section>`;
 save();
}
function progressBlock(date){const e=entry(date); const total=state.habits.length||1; const done=state.habits.filter(h=>e.checks[h.id]).length; const pct=Math.round(done/total*100); return `<h2 class="section-title">${done}/${total} completed</h2><div class="bar"><span style="width:${pct}%"></span></div><p class="small">${pct}% · 80% consistency wins.</p>`}
window.toggleHabit=(date,id,val)=>{entry(date).checks[id]=val; save(); render();}
window.editFocus=()=>{const v=prompt('Today\'s focus',state.focus); if(v!==null){state.focus=v.trim()||state.focus; save(); render();}}
window.addHabit=()=>{const name=document.getElementById('newHabit').value.trim(); const category=document.getElementById('newCat').value; if(!name) return; state.habits.push({id:crypto.randomUUID(),name,category}); save(); render();}
window.editHabit=(id)=>{const h=state.habits.find(x=>x.id===id); if(!h)return; const name=prompt('Habit name',h.name); if(name===null)return; const category=prompt('Category',h.category); h.name=name.trim()||h.name; h.category=(category||h.category).trim(); save(); render();}
window.deleteHabit=(id)=>{if(confirm('Delete this habit from the 90-day system?')){state.habits=state.habits.filter(h=>h.id!==id); Object.values(state.entries).forEach(e=>delete e.checks[id]); save(); render();}}
function healthInput(key,label,type){const val=entry().health[key]??''; if(type==='range') return `<label><p class="label">${label}: <span id="${key}Val">${val}</span></p><input class="input" type="range" min="0" max="10" value="${val}" oninput="entry().health.${key}=this.value; document.getElementById('${key}Val').textContent=this.value; save()"></label>`; return `<label><p class="label">${label}</p><input class="input" type="${type}" value="${escapeHtml(val)}" oninput="entry().health.${key}=this.value; save()"></label>`}
function healthSelect(key){const val=entry().health[key]; return `<label><p class="label">Mood</p><select class="input" onchange="entry().health.mood=this.value; save()"><option ${val==='Calm'?'selected':''}>Calm</option><option ${val==='Good'?'selected':''}>Good</option><option ${val==='Tired'?'selected':''}>Tired</option><option ${val==='Anxious'?'selected':''}>Anxious</option><option ${val==='Low'?'selected':''}>Low</option></select></label>`}
function stat(label,val,target,unit){let pct=Math.min(100,Math.round((Number(val)||0)/target*100)); return `<div class="stat"><span class="small">${label}</span><strong>${val||0}${unit}</strong><div class="bar"><span style="width:${pct}%"></span></div></div>`}
function logContent(date){const e=entry(date); return `<br><h3>${prettyDate(date)}</h3>${progressBlock(date)}<div class="stat-grid">${stat('Protein',e.health.protein,90,'g')}${stat('Water',e.health.water,3,'L')}${stat('Steps',e.health.steps,7000,'')}${stat('Sleep',e.health.sleep,8,'h')}</div><br><p class="label">Journal</p><div class="schedule-day">${escapeHtml(e.journal||'No journal entry yet.')}</div><p class="label">Workout</p><div class="schedule-day">${escapeHtml(e.workout||'No workout log yet.')}</div>`}
window.renderLogDate=(d)=>{document.getElementById('logContent').innerHTML=logContent(d)}
function recentDays(){let out=''; for(let i=0;i<14;i++){let d=new Date(); d.setDate(d.getDate()-i); let iso=d.toISOString().slice(0,10); const e=entry(iso); const done=state.habits.filter(h=>e.checks[h.id]).length; out+=`<div class="log-item"><div><strong>${prettyDate(iso)}</strong><div class="small">${done}/${state.habits.length} habits</div></div><button class="pill" onclick="document.getElementById('logDate').value='${iso}';renderLogDate('${iso}');window.scrollTo({top:0,behavior:'smooth'})">Open</button></div>`} return out}
function weeklyReport(){let total=0,done=0,protein=0,water=0,steps=0,sleep=0,count=7; for(let i=0;i<7;i++){let d=new Date(); d.setDate(d.getDate()-i); let iso=d.toISOString().slice(0,10); let e=entry(iso); total+=state.habits.length; done+=state.habits.filter(h=>e.checks[h.id]).length; protein+=Number(e.health.protein)||0; water+=Number(e.health.water)||0; steps+=Number(e.health.steps)||0; sleep+=Number(e.health.sleep)||0;} let pct=Math.round(done/(total||1)*100); return `<h3>${pct}% habit completion this week</h3><div class="bar"><span style="width:${pct}%"></span></div><br><div class="stat-grid">${stat('Avg Protein',Math.round(protein/count),90,'g')}${stat('Avg Water',(water/count).toFixed(1),3,'L')}${stat('Avg Steps',Math.round(steps/count),7000,'')}${stat('Avg Sleep',(sleep/count).toFixed(1),8,'h')}</div>`}
function reviewRange(key,label){const e=entry(); const val=e.weekly[key]||0; return `<label><p class="label">${label}: <span id="r${key}">${val}</span>/10</p><input class="input" type="range" min="0" max="10" value="${val}" oninput="entry().weekly.${key}=this.value;document.getElementById('r${key}').textContent=this.value;save()"></label>`}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
render();
