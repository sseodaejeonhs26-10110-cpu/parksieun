// 학습용 조건문 규칙입니다. 질병을 진단하거나 확률을 계산하지 않습니다.
const SYMPTOMS = [
  {id:'dizzy',icon:'◌',label:'어지러워요'}, {id:'throat',icon:'♧',label:'목이 아파요'},
  {id:'nose',icon:'♧',label:'콧물이 나요'}, {id:'cough',icon:'≋',label:'기침이 나요'},
  {id:'wrist',icon:'⌁',label:'손목·팔목이 욱신거려요'}, {id:'nausea',icon:'≈',label:'속이 울렁거려요'},
  {id:'ear',icon:'◖',label:'귀가 먹먹해요'}
];
const YESNO = [{label:'예',value:'yes'},{label:'아니요',value:'no'},{label:'잘 모르겠어요',value:'unknown'}];
const QUESTION_SETS = {
  dizzy:[{id:'feeling',text:'어떤 어지러움에 더 가까운가요?',options:[{label:'주변이 빙글빙글 돌아요',value:'spin'},{label:'눈앞이 캄캄하거나 일어날 때 어지러워요',value:'faint'},{label:'잘 모르겠어요',value:'unknown'}]},
    {id:'earSign',text:answers=>answers.feeling==='spin'?'고개를 움직일 때 심해지거나 귀가 먹먹한가요?':'일어날 때 심해지거나 최근 식사·수분 섭취가 부족했나요?'},
    {id:'duration',text:'어지러움이 반복되거나 일상생활을 방해하나요?'}],
  throat:[{id:'swallow',text:'음식을 삼킬 때 목 안이 아프거나 목소리가 변했나요?'},{id:'fever',text:'열이나 오한이 있나요?'},{id:'cold',text:'콧물이나 기침도 함께 있나요?'}],
  nose:[{id:'allergy',text:'맑은 콧물과 재채기, 눈이나 코의 가려움이 있나요?'},{id:'fever',text:'열이나 몸살도 함께 있나요?'},{id:'face',text:'코막힘이나 얼굴 주변의 통증도 있나요?'}],
  cough:[{id:'duration',text:'기침이 3주 이상 이어지고 있나요?'},{id:'fever',text:'열이나 몸살, 가래가 함께 있나요?'},{id:'noseSign',text:'콧물이 목 뒤로 넘어가거나 목이 간질거리나요?'}],
  wrist:[{id:'injury',text:'최근 넘어지거나 손목을 부딪히거나 삔 적이 있나요?'},{id:'motion',text:'손목을 움직이거나 오래 사용할 때 더 아픈가요?'},{id:'swelling',text:'붓거나 저리거나 물건을 잡기 어려운가요?'}],
  nausea:[{id:'stomach',text:'배가 아프거나 설사가 함께 있나요?'},{id:'spin',text:'주변이 빙글빙글 돌거나 귀 증상이 함께 있나요?'},{id:'food',text:'식사 후 심해지거나 속쓰림이 있나요?'}],
  ear:[{id:'suddenHearing',text:'한쪽 귀의 청력이 갑자기 뚜렷하게 떨어졌나요?',urgent:true},{id:'cold',text:'감기나 코막힘이 있거나 최근 비행기를 탔나요?'},{id:'pain',text:'귀가 아프거나 이명·어지러움이 있나요?'}]
};
const KEYWORD_RULES = [
  {id:'extraFever',label:'열·오한',pattern:/열|오한/,text:'체온을 재 보았을 때 38도 이상인가요?'},
  {id:'extraVomit',label:'구토',pattern:/구토|토했|토해|토하|토할|토가|토를|토함|게워/,text:'하루에 몇 번 정도 토했나요?',options:[{label:'토하지 않았거나 1~2번이에요',value:'few'},{label:'3번 이상이거나 물도 마시기 어려워요',value:'many'},{label:'잘 모르겠어요',value:'unknown'}]},
  {id:'extraHead',label:'두통·머리',pattern:/두통|머리/,text:'머리를 부딪힌 뒤 두통·구토가 심해지거나, 갑자기 매우 심한 두통이 생겼나요?',emergency:true},
  {id:'extraBreath',label:'숨·호흡',pattern:/숨|호흡/,text:'지금 숨쉬기가 많이 힘들거나 말하기 어려울 정도인가요?',emergency:true},
  {id:'extraNumb',label:'저림',pattern:/저림|저려|저린/,text:'저린 부위가 계속 넓어지나요?'},
  {id:'extraChest',label:'가슴·의식',pattern:/가슴|흉통|의식|실신|기절/,text:'지금 가슴 통증이 있거나, 의식을 잃을 것 같거나 의식이 흐려지나요?',emergency:true}
];
const DANGER_QUESTION={id:'danger',text:'지금 다음 위험 신호 중 하나라도 있나요?',context:'심한 호흡곤란, 가슴 통증, 의식 저하·실신 직전, 갑작스러운 한쪽 마비나 말이 어눌해지는 증상',emergency:true,options:[{label:'위험 신호가 있어요',value:'yes'},{label:'없어요',value:'no'},{label:'잘 모르겠어요',value:'unknown'}]};
function getKeywordRules(text){return KEYWORD_RULES.filter(rule=>rule.pattern.test(text));}
function recommend(symptom,answers){
  const relevant=(QUESTION_SETS[symptom]||[]).map(q=>answers[q.id]);
  if(!relevant.some(a=>a && a!=='unknown'))return {department:null,cause:'정보가 조금 부족해요. 다시 답하거나 가까운 병원에서 의료진과 상담해 주세요.'};
  let department='내과',cause='여러 원인에 의한 증상일 수 있어요.';
  if(symptom==='dizzy'){
    if(answers.feeling==='spin'){department='이비인후과';cause='귀 속 평형기관의 문제일 수 있어요. 자세 변화와 관련된다면 이석증 등도 확인이 필요해요.';}
    else {cause='혈압 변화나 탈수, 빈혈 등과 관련된 증상일 수 있어요.';}
  }
  if(symptom==='throat'){department='이비인후과';cause='인후염이나 편도염 등 목 안의 염증일 수 있어요.';}
  if(symptom==='nose'){department='이비인후과';cause=answers.allergy==='yes'?'알레르기 비염 등 코 점막의 자극과 관련된 증상일 수 있어요.':'감기나 비염 등과 관련된 증상일 수 있어요.';}
  if(symptom==='cough'){department=answers.duration!=='yes'&&answers.noseSign==='yes'?'이비인후과':'내과';cause=department==='이비인후과'?'콧물이 목 뒤로 넘어가거나 상기도 자극에 의한 기침일 수 있어요.':'감기나 기관지 염증 등 여러 원인에 의한 기침일 수 있어요.';}
  if(symptom==='wrist'){department='정형외과';cause=answers.injury==='yes'?'염좌나 골절 등 손상과 관련된 증상일 수 있어요.':'반복적인 사용에 따른 힘줄이나 관절의 문제일 수 있어요.';}
  if(symptom==='nausea'){department=answers.spin==='yes'&&answers.stomach!=='yes'?'이비인후과':'내과';cause=department==='이비인후과'?'귀 속 평형기관의 문제와 관련된 메스꺼움일 수 있어요.':'위장염이나 소화불량 등과 관련된 증상일 수 있어요.';}
  if(symptom==='ear'){department='이비인후과';cause='귀의 압력 조절 문제나 염증 등과 관련된 증상일 수 있어요.';}
  // 추가 답변도 추천에 반영합니다. 손목·귀처럼 특정 부위 증상은 유지해요.
  if(['cough','nausea'].includes(symptom)&&(answers.extraFever==='yes'||answers.extraVomit==='many')){department='내과';cause='발열이나 반복되는 구토를 동반하는 전신·소화기 문제일 수 있어요.';}
  const notices=[];
  if(answers.extraFever==='yes')notices.push('측정된 발열이 있다는 점을 진료 시 알려 주세요.');
  if(answers.extraVomit==='many')notices.push('구토가 반복되거나 물을 마시기 어렵다면 오늘 바로 의료진의 평가를 받으세요.');
  if(answers.extraNumb==='yes')notices.push('저림이 넓어지는 증상은 빠른 진료가 필요해요. 갑작스러운 한쪽 마비·말 어눌함이 동반되면 119에 도움을 요청하세요.');
  return {department,cause,notices};
}
function koreaTime(date=new Date()){
  const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date);
  const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));
  return {day:new Date(Date.UTC(+p.year,+p.month-1,+p.day)).getUTCDay(),minute:+p.hour*60 + +p.minute,label:`${p.year}.${p.month}.${p.day} ${p.hour}:${p.minute} (한국 시간)`};
}
function minutes(time){const [h,m]=time.split(':').map(Number);return h*60+m;}
function hospitalStatus(h,time=koreaTime(),holiday=false){
  const range=holiday?h.holiday:h.hours[time.day];
  if(range===false)return {type:'closed',label:holiday?'공휴일 휴무':'오늘 휴무',detail:'시간표 기준 휴무예요.'};
  if(!range||(!holiday&&h.conflictDays?.includes(time.day)))return {type:'unknown',label:'시간 확인 필요',detail:'정보가 없거나 출처가 달라요. 전화로 확인해 주세요.'};
  const start=minutes(range[0]),end=minutes(range[1]);
  if(time.minute<start)return {type:'closed',label:'진료 전',detail:`오늘 ${range[0]} 진료 시작 예정`};
  if(time.minute>=end)return {type:'closed',label:'진료 종료',detail:`오늘 ${range[1]} 종료 · 다음 진료는 전화 문의`};
  if(time.day>=1&&time.day<=5&&!holiday&&h.lunch&&time.minute>=minutes(h.lunch[0])&&time.minute<minutes(h.lunch[1]))return {type:'lunch',label:'점심시간',detail:`${h.lunch[1]} 오후 진료 시작 예정`};
  return {type:'open',label:'시간표상 진료 중',detail:`오늘 ${range[1]}까지${h.lunch?'':' · 점심시간 미확인'}`};
}
function distanceKm(a,b){const r=Math.PI/180,dlat=(b.lat-a.lat)*r,dlng=(b.lng-a.lng)*r;const v=Math.sin(dlat/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dlng/2)**2;return 6371*2*Math.atan2(Math.sqrt(v),Math.sqrt(1-v));}
