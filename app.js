const $=id=>document.getElementById(id);
const state={symptom:null,questions:[],answers:{},index:0,department:'전체',location:null,selected:null};
let map=null,markers=[];
function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function mapUrl(h){return `https://map.naver.com/p/search/${encodeURIComponent(h.name+' 대전 '+h.address)}`;}
function link(url,label){return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;}
function selectSymptom(id){
  state.symptom=id;state.answers={};state.index=0;
  document.querySelectorAll('.symptom').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.id===id)));
  $('symptom-input').hidden=false;$('quiz').hidden=true;$('result').hidden=true;
}
function startQuiz(){
  if(!state.symptom)return;
  state.answers={};state.index=0;
  state.questions=[DANGER_QUESTION,...QUESTION_SETS[state.symptom],...getKeywordRules($('extra').value)];
  $('result').hidden=true;$('symptom-input').hidden=true;$('quiz').hidden=false;renderQuestion();
}
function renderQuestion(){
  const q=state.questions[state.index];
  $('question-step').textContent=`질문 ${state.index+1} / ${state.questions.length}`;
  $('progress-fill').style.width=`${(state.index+1)/state.questions.length*100}%`;
  $('question-context').textContent=q.context||(q.label?`추가 증상 확인 · ${q.label}`:SYMPTOMS.find(s=>s.id===state.symptom).label);
  $('question-title').textContent=typeof q.text==='function'?q.text(state.answers):q.text;
  $('answers').replaceChildren();
  (q.options||YESNO).forEach(option=>{const b=document.createElement('button');b.className='answer';b.textContent=option.label;b.onclick=()=>answerQuestion(q,option.value);$('answers').append(b);});
  $('previous').hidden=state.index===0;
  $('question-title').focus({preventScroll:true});
}
function answerQuestion(q,value){
  state.answers[q.id]=value;
  if(q.emergency&&(value==='yes'||(q.id==='danger'&&value==='unknown'))){showEmergency(value==='unknown');return;}
  if(q.urgent&&value==='yes'){showUrgent();return;}
  if(state.index<state.questions.length-1){state.index++;renderQuestion();}else showResult();
}
function showEmergency(uncertain=false){
  $('quiz').hidden=true;$('result').hidden=false;$('result').className='result-panel emergency-result';
  $('result').innerHTML=`<span class="eyebrow">${uncertain?'危険 신호 확인이 어려워요'.replace('危険','위험'):'응급 안내'}</span><h3>지금 바로 도움을 요청하세요</h3><p>119 또는 가까운 응급실에 도움을 요청하고, 보호자나 선생님께 현재 상태를 알려 주세요.</p><a class="button danger" href="tel:119">119 전화하기</a> ${link('https://www.e-gen.or.kr/egen/main.do','응급실 찾기')}<p class="safety">참고용이며 정확한 진단은 병원에서 받아야 해요.</p><button class="text-button" id="restart-result">처음부터 다시 확인</button>`;
  $('restart-result').onclick=resetQuiz;$('emergency').showModal();
}
function showUrgent(){
  $('quiz').hidden=true;$('result').hidden=false;$('result').className='result-panel';
  $('result').innerHTML='<span class="eyebrow">빠른 진료가 필요해요</span><h3>오늘 바로 이비인후과 진료를 받아 주세요</h3><p>갑작스러운 청력 저하는 빠른 평가가 필요해요. 진료가 어렵다면 응급실에 문의해 주세요. 아래 병원 목록이 진료를 보장하지는 않아요.</p><button class="button primary" id="recommended-hospitals">이비인후과 병원 보기</button><p class="safety">참고용이며 정확한 진단은 병원에서 받아야 해요.</p><button class="text-button" id="restart-result">다시 선택하기</button>';
  $('recommended-hospitals').onclick=()=>chooseDepartment('이비인후과',true);$('restart-result').onclick=resetQuiz;
}
function showResult(){
  const r=recommend(state.symptom,state.answers);
  $('quiz').hidden=true;$('result').hidden=false;$('result').className='result-panel';
  $('result').innerHTML=`<span class="eyebrow">문답 결과 · 참고용</span><h3>${r.department?`${r.department}부터 상담해 보세요`:'조금 더 확인이 필요해요'}</h3><p>${escapeHtml(r.cause)}</p>${(r.notices||[]).map(n=>`<p>${escapeHtml(n)}</p>`).join('')}<p class="muted">선택한 증상과 답변을 정해진 규칙으로 연결했어요. 다른 질환이나 진료과의 가능성을 배제하지 않아요.</p><button class="button primary" id="recommended-hospitals">${r.department||'주변'} 병원 보기</button><p class="safety">참고용이며 정확한 진단은 병원에서 받아야 해요.</p><button class="text-button" id="restart-result">다시 선택하기</button>`;
  $('recommended-hospitals').onclick=()=>chooseDepartment(r.department||'전체',true);$('restart-result').onclick=resetQuiz;
}
function resetQuiz(){
  state.symptom=null;state.answers={};state.index=0;
  $('quiz').hidden=true;$('result').hidden=true;$('symptom-input').hidden=true;$('extra').value='';
  document.querySelectorAll('.symptom').forEach(b=>b.setAttribute('aria-pressed','false'));
  $('check').scrollIntoView({behavior:'smooth'});document.querySelector('.symptom').focus({preventScroll:true});
}
function chooseDepartment(department,scroll=false){state.department=department;state.selected=null;document.querySelectorAll('.filter').forEach(b=>b.setAttribute('aria-pressed',String(b.textContent===department)));renderHospitals();if(scroll)$('hospitals').scrollIntoView({behavior:'smooth'});}
function renderHospitals(){
  const time=koreaTime();$('clock').textContent=time.label;
  const holiday=$('holiday').checked,only=$('only-open').checked;
  const hospitals=HOSPITALS.filter(h=>state.department==='전체'||h.department===state.department).map(h=>({...h,status:hospitalStatus(h,time,holiday),distance:state.location?distanceKm(state.location,h):null}));
  hospitals.sort((a,b)=>state.location?a.distance-b.distance:({open:0,lunch:1,unknown:2,closed:3}[a.status.type]-{open:0,lunch:1,unknown:2,closed:3}[b.status.type]));
  const open=hospitals.filter(h=>h.status.type==='open');
  const shown=only?open:hospitals;
  $('hospital-count').textContent=`${state.department} ${shown.length}곳 · 시간표상 진료 중 ${open.length}곳${state.location?' · 내 위치에서 직선거리순':''}`;
  $('hospital-list').replaceChildren();
  if(!open.length){const note=document.createElement('div');note.className='empty-state';note.textContent=only?'시간표상 진료 중인 병원이 없어요. 필터를 해제해 진료 예정 시간이나 전화 확인이 필요한 병원을 확인해 주세요.':'시간표상 진료 중인 병원이 없어요. 아래 병원에 다음 진료 시간을 전화로 문의해 보세요.';$('hospital-list').append(note);}
  shown.forEach(h=>{
    const card=document.createElement('article');card.className='hospital-card'+(state.selected===h.id?' selected':'');card.dataset.id=h.id;
    card.innerHTML=`<div class="hospital-card-top"><button class="hospital-title">${h.name}</button><span class="status ${h.status.type}">${h.status.label}</span></div><div class="department-label">${h.department}${h.distance!==null?` · 직선 ${h.distance.toFixed(2)}km`:''}</div><p>${h.address}</p><p>${h.status.detail}</p><div class="card-actions"><button class="button secondary details-button">상세 정보</button><a class="button secondary" href="tel:${h.phone}">전화</a><a class="button secondary" href="${mapUrl(h)}" target="_blank" rel="noopener noreferrer">지도 보기</a></div>`;
    card.querySelector('.hospital-title').onclick=()=>openDetail(h.id);card.querySelector('.details-button').onclick=()=>openDetail(h.id);$('hospital-list').append(card);
  });
  updateMap(shown);
}
function hoursText(value){return value===false?'휴무':value?`${value[0]} ~ ${value[1]}`:'전화 확인 필요';}
function openDetail(id){
  const h=HOSPITALS.find(x=>x.id===id);if(!h)return;
  state.selected=id;document.querySelectorAll('.hospital-card').forEach(c=>c.classList.toggle('selected',c.dataset.id===id));
  const status=hospitalStatus(h,koreaTime(),$('holiday').checked);
  $('detail-content').innerHTML=`<h2>${h.name}</h2><span class="detail-status">${status.label}<br>${status.detail}</span><dl><dt>주소</dt><dd>${h.address}</dd><dt>전화번호</dt><dd><a href="tel:${h.phone}">${h.phone}</a></dd><dt>진료 분야</dt><dd>${h.fields}</dd><dt>대표 시술</dt><dd>확인된 정보 없음 · 병원 문의</dd><dt>평일 점심</dt><dd>${h.lunch?h.lunch.join(' ~ '):'정보 없음 · 전화 확인 필요'}</dd></dl><table aria-label="요일별 진료 시간"><tbody>${[1,2,3,4,5,6,0].map(d=>`<tr><th>${['일','월','화','수','목','금','토'][d]}요일</th><td>${hoursText(h.hours[d])}${h.conflictDays?.includes(d)?' (자료 불일치 · 확인 필요)':''}</td></tr>`).join('')}<tr><th>공휴일</th><td>${hoursText(h.holiday)}</td></tr></tbody></table><p class="data-notice">${h.note}</p><a class="button primary" href="tel:${h.phone}">전화로 확인하기</a><a class="button secondary" href="${mapUrl(h)}" target="_blank" rel="noopener noreferrer">지도 보기</a><p class="safety">참고용이며 정확한 정보는 병원에 확인하세요.</p><p class="muted">자료 확인일 2026. 11. 23. · 전화 확인 전</p>${h.sources.map(s=>link(s.url,s.label)).join('<br>')}`;
  if(map)map.panTo([h.lat,h.lng]);if(!$('detail').open)$('detail').showModal();
}
function initializeMap(){
  if(!window.L){$('map').innerHTML='<p class="muted">지도를 불러오지 못했어요.<br>병원 카드의 지도 보기를 이용해 주세요.</p>';return;}
  map=L.map('map',{scrollWheelZoom:false}).setView([36.323,127.395],15);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
}
function updateMap(hospitals){
  if(!map)return;markers.forEach(m=>map.removeLayer(m));markers=[];
  // 같은 주소의 병원은 좌표를 옮기지 않고 하나의 핀으로 묶어요.
  const groups=new Map();hospitals.forEach(h=>{const key=`${h.lat},${h.lng}`;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(h);});
  [...groups.values()].forEach((group,i)=>{
    const h=group[0],type=group.some(x=>x.status.type==='open')?'open':h.status.type;
    const marker=L.marker([h.lat,h.lng],{title:group.map(x=>x.name).join(', '),icon:L.divIcon({className:`map-pin ${type}`,html:String(i+1),iconSize:[34,34],iconAnchor:[17,17]})}).addTo(map);
    const content=document.createElement('div');group.forEach(x=>{const row=document.createElement('div');const b=document.createElement('button');b.textContent=x.name;b.onclick=()=>openDetail(x.id);row.append(b,document.createElement('br'),document.createTextNode(x.status.label));content.append(row);});
    marker.bindPopup(content);markers.push(marker);
  });
  if(hospitals.length)map.fitBounds(L.latLngBounds(hospitals.map(h=>[h.lat,h.lng])),{padding:[45,45],maxZoom:16});
}
$('symptoms').innerHTML=SYMPTOMS.map(s=>`<button class="symptom" data-id="${s.id}" aria-pressed="false"><span class="symptom-icon" aria-hidden="true">${s.icon}</span><span>${s.label}</span></button>`).join('');
document.querySelectorAll('.symptom').forEach(b=>b.onclick=()=>selectSymptom(b.dataset.id));
$('extra').oninput=()=>{const found=getKeywordRules($('extra').value);$('keywords').textContent=found.length?'추가 질문: '+found.map(x=>x.label).join(', '):'관련 키워드가 없으면 기본 질문으로 이어져요.';};
$('begin').onclick=startQuiz;$('reset-quiz').onclick=resetQuiz;
$('previous').onclick=()=>{if(state.index>0){const previous=state.index-1;state.questions.slice(previous).forEach(q=>delete state.answers[q.id]);state.index=previous;renderQuestion();}};
$('department-filters').innerHTML=['전체','내과','이비인후과','정형외과'].map(d=>`<button class="filter" aria-pressed="${d==='전체'}">${d}</button>`).join('');
document.querySelectorAll('.filter').forEach(b=>b.onclick=()=>chooseDepartment(b.textContent));
$('only-open').onchange=renderHospitals;$('holiday').onchange=renderHospitals;
$('locate').onclick=()=>{
  if(!navigator.geolocation){$('location-message').textContent='이 브라우저는 위치 기능을 지원하지 않아요. 태평동 병원 목록을 이용해 주세요.';return;}
  $('locate').disabled=true;$('location-message').textContent='현재 위치를 확인하고 있어요…';
  navigator.geolocation.getCurrentPosition(position=>{state.location={lat:position.coords.latitude,lng:position.coords.longitude};$('locate').disabled=false;$('location-message').textContent='등록된 태평동 병원만 내 위치에서 가까운 순서로 표시해요. 직선거리이며 실제 이동 거리와 달라요.';renderHospitals();},()=>{$('locate').disabled=false;$('location-message').textContent='위치를 확인할 수 없어요. 위치 권한과 보안 연결(HTTPS)을 확인해 주세요. 태평동 병원 목록은 계속 이용할 수 있어요.';},{timeout:10000,maximumAge:60000});
};
document.querySelectorAll('dialog .close-button').forEach(b=>b.onclick=()=>b.closest('dialog').close());
document.querySelector('.brand').onclick=e=>{e.preventDefault();resetQuiz();window.scrollTo({top:0,behavior:'smooth'});};
$('source-list').innerHTML=HOSPITALS.map(h=>`<article><strong>${h.name}</strong><p>${h.note}</p>${h.sources.map(s=>link(s.url,s.label)).join('<br>')}</article>`).join('');
initializeMap();renderHospitals();setInterval(renderHospitals,60000);
