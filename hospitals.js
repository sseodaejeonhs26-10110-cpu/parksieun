// 시간표: 배열은 [시작, 종료], null은 미확인, false는 휴무입니다.
// 점심시간 미확인과 자료 불일치를 실제 영업 중으로 확정하지 않습니다.
const HOSPITALS = [
  {id:'woori',name:'우리이비인후과의원',department:'이비인후과',fields:'이비인후과',address:'대전광역시 중구 동서대로 1218, 3층 301호',phone:'042-528-3300',lat:36.3255430053404,lng:127.39528241826409,
    hours:[null,['14:00','18:30'],['14:00','18:30'],['14:00','18:30'],['14:00','18:30'],['09:00','18:30'],['09:00','13:00']],lunch:null,holiday:null,
    note:'공개 시간표는 월~목 오후 2시 시작으로 표시돼 있어요. 오전 진료 여부와 점심시간, 일요일·공휴일은 전화 확인이 필요해요.',
    sources:[{label:'미리닥 · 시간·주소·전화·좌표',url:'https://miridoc.com/h/31wr0h'}]},
  {id:'dream',name:'태평드림내과의원',department:'내과',fields:'내과',address:'대전광역시 중구 동서대로 1218, 4층',phone:'042-537-7533',lat:36.3255430053404,lng:127.39528241826409,
    hours:[false,['09:00','18:30'],['09:00','18:30'],['09:00','18:30'],['09:00','18:30'],['09:00','18:30'],null],lunch:['12:30','14:00'],holiday:false,
    note:'토요일 종료 시간이 13:00·15:00 등으로 다르게 안내돼 계산에서 제외했어요. 지도는 우리이비인후과와 같은 건물 주소의 좌표를 사용해요.',
    sources:[{label:'어디병원 · 시간·점심·주소·전화',url:'https://www.eodihospital.com/병원/대전/중구/태평드림내과의원-33472/'},{label:'메디닉스 · 토요일 시간 대조',url:'https://medinics.kr/hospitals/37110'}]},
  {id:'bird',name:'버드내내과의원',department:'내과',fields:'내과',address:'대전광역시 중구 태평로 15, 버드내상가 307호',phone:'042-536-8276',lat:36.3179497,lng:127.3913382,
    hours:[false,['09:00','18:30'],['09:00','18:30'],['09:00','18:30'],['09:00','18:30'],['09:00','18:30'],['09:00','13:00']],lunch:null,holiday:null,
    note:'점심시간은 확인되지 않았어요. 공휴일 진료 여부가 자료마다 달라 전화 확인이 필요해요.',
    sources:[{label:'육아크루 · 시간·전화·좌표',url:'https://www.yugacrew.com/daejeon/junggu/hospital/111'},{label:'일상킷 · 진료과·주소·전화',url:'https://ilsangkit.co.kr/hospital/hospital-ace791f519ff'},{label:'캐시닥 · 휴일 시간 대조',url:'https://cashdoc.me/hospital/A1600550/버드내내과의원'}]},
  {id:'yeollin',name:'열린정형외과의원',department:'정형외과',fields:'정형외과 (기타 진료 분야는 병원 문의)',address:'대전광역시 중구 태평로 105',phone:'042-536-6566',lat:36.3261371,lng:127.3946389,
    hours:[null,['09:00','19:00'],['09:00','19:00'],['09:00','19:00'],['09:00','19:00'],['09:00','19:00'],null],lunch:null,holiday:null,
    note:'토요일 마감이 15:00·15:30으로 달라 미확인 처리했어요. 점심시간과 일요일·공휴일도 전화로 확인해 주세요.',
    sources:[{label:'육아크루 · 시간·주소·전화·좌표',url:'https://www.yugacrew.com/daejeon/junggu/hospital/201'},{label:'병ON · 토요일 시간 대조',url:'https://byengon.kr/area/대전/중구/dong/태평동/정형외과'}]},
  {id:'hanguk',name:'한국정형외과의원',department:'정형외과',fields:'정형외과 · 신경외과 · 외과 · 재활의학과',address:'대전광역시 중구 동서대로 1261, 지하 1층·1층',phone:'042-535-5221',lat:36.327327,lng:127.399779,
    hours:[false,['09:00','18:00'],['09:00','18:00'],['09:00','18:00'],['09:00','18:00'],['09:00','18:00'],null],lunch:['12:00','13:30'],holiday:null,conflictDays:[1,2,3,4,5],
    note:'평일 시작이 09:00·09:30, 토요일 마감이 12:00·12:30으로 달라 평일·토요일 상태는 전화 확인이 필요해요. 점심시간도 방문 전 재확인해 주세요.',
    sources:[{label:'내근처 병원 · 시간·진료 분야',url:'https://hospital.guidejung.com/hospital/A1600336'},{label:'어디병원 · 주소·전화·좌표',url:'https://www.eodihospital.com/병원/대전/중구/한국정형외과의원-34950/'},{label:'병ON · 점심·토요일 대조',url:'https://byengon.kr/area/대전/중구/dong/태평동/정형외과'},{label:'모두닥 · 평일 시작 대조',url:'https://www.modoodoc.com/hospital/46274/한국정형외과의원-대전-태평동'}]}
];
