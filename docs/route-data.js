// All distances, floors and paths below are fictional demo data, not surveyed routes.
const stationRoutes = {
  shinjuku: {minutes:8,distance:350,via:'中央轉乘通道',level:'地下通道',points:[[100,120],[280,120],[280,255],[660,255]],labels:['下車月台','中央通道','地下連絡道','乘車月台'],actions:['沿月台尋找中央通道指標','下樓後，沿地下連絡道前進'],photos:['platform.jpg','passage.jpg','signs.jpg','platform.jpg']},
  tokyo: {minutes:11,distance:520,via:'地下連絡通道',level:'地下轉乘層',points:[[100,235],[250,235],[250,100],[660,100]],labels:['下車月台','地下連絡口','長距離通道','乘車月台'],actions:['依地下連絡口指標離開月台','通過長距離通道，留意前方分岔'],photos:['platform.jpg','signs.jpg','passage.jpg','platform.jpg']},
  shibuya: {minutes:10,distance:420,via:'樓層連接大廳',level:'上層大廳',points:[[100,265],[100,125],[460,125],[660,125]],labels:['下車月台','垂直轉乘區','上層大廳','乘車月台'],actions:['前往垂直轉乘區，留意樓層提示','進入上層大廳後，核對轉乘路線'],photos:['platform.jpg','platform.jpg','signs.jpg','passage.jpg']},
  ueno: {minutes:6,distance:230,via:'站內轉乘大廳',level:'轉乘大廳',points:[[100,110],[320,110],[500,110],[500,255]],labels:['下車月台','轉乘大廳','連接通道','乘車月台'],actions:['離開月台後，前往轉乘大廳','沿連接通道前進，留意下行指標'],photos:['platform.jpg','signs.jpg','passage.jpg','platform.jpg']},
  ikebukuro: {minutes:9,distance:390,via:'地下中央通路',level:'地下大廳',points:[[100,120],[100,255],[470,255],[660,255]],labels:['下車月台','地下大廳','中央通路','乘車月台'],actions:['沿指標下樓，進入地下大廳','穿過中央通路，於分岔確認方向'],photos:['platform.jpg','passage.jpg','signs.jpg','platform.jpg']}
};
const lineStyles={
 'JR 山手線':['JY','#6b9d32'],'東京 Metro 丸之內線':['M','#cf4848'],
 '東京 Metro 銀座線':['G','#a96c00'],'東京 Metro 半藏門線':['Z','#8061b6'],
 '東京 Metro 日比谷線':['H','#64757f'],'東京 Metro 有樂町線':['Y','#997d32'],
 'JR 中央線':['JC','#cc602b'],'JR 京葉線':['JE','#bf3656'],'JR 常磐線':['JJ','#2b8577'],
 '小田急線':['OH','#2580b2'],'京王線':['KO','#b3457e'],'東急東橫線':['TY','#b84848'],'西武池袋線':['SI','#9a740c']
};
// Floor values are illustrative and deliberately separate from real station data.
const stationFloors={shinjuku:{lines:['2F','B1','1F','B2'],hall:'1F'},tokyo:{lines:['2F','B1','3F','B4'],hall:'1F'},shibuya:{lines:['2F','3F','B3','B5'],hall:'1F'},ueno:{lines:['2F','B1','B2','1F'],hall:'1F'},ikebukuro:{lines:['1F','B2','B3','1F'],hall:'B1'}};
let selectedFloor='all';
const floorHeight=f=>f.startsWith('B')?-Number(f.slice(1)):Number(f.slice(0,-1));
function floorDirection(a,b){return a===b?'同層前進':floorHeight(b)>floorHeight(a)?'上樓':'下樓'}
function floorInstruction(a,b){return a===b?`在 ${a} 同層前進`:`${accessible?'搭乘電梯':'使用樓梯／手扶梯'}${floorDirection(a,b)}，${a} → ${b}`}
function routeModel(){
 const p=stationRoutes[active.station], ls=stations[active.station].lines;
 const a=ls.indexOf(active.from),b=ls.indexOf(active.to),variation=a+b-1;
 let points=p.points.map(([x,y])=>[x,y+(variation%3)*12]);
 if(a>b)points=points.map(([x,y])=>[760-x,y]);
 if(accessible)points=points.map(([x,y],i)=>[x,y+(i===1||i===2?22:0)]);
 const f=stationFloors[active.station],floors=[f.lines[a],f.hall,f.hall,f.lines[b]];
 return {...p,points,floors,minutes:p.minutes+variation+(accessible?4:0),distance:p.distance+variation*70+(accessible?120:0)};
}
function routeArrow(a,b){const dx=b[0]-a[0],dy=b[1]-a[1];return Math.abs(dx)>Math.abs(dy)?(dx>0?'→':'←'):(dy>0?'↓':'↑')}
function renderStationMap(r){
 const pts=r.points,labels=[r.labels[0],accessible?'電梯連接區':r.labels[1],r.labels[2],r.labels[3]];
 const floors=[...new Set(r.floors)].sort((a,b)=>floorHeight(b)-floorHeight(a));
 if(selectedFloor!=='all'&&!floors.includes(selectedFloor))selectedFloor='all';
 const show=i=>selectedFloor==='all'||r.floors[i]===selectedFloor;
 $('#floorControls').innerHTML=`<span class="floor-label">樓層檢視</span>${['all',...floors].map(f=>`<button type="button" data-floor="${f}" aria-pressed="${f===selectedFloor}" class="${f===selectedFloor?'selected':''}">${f==='all'?'全部樓層':f}</button>`).join('')}<span class="floor-demo">模擬樓層</span>`;
 document.querySelectorAll('[data-floor]').forEach(btn=>btn.onclick=()=>{selectedFloor=btn.dataset.floor;renderStep(false)});
 const segments=pts.slice(1).map(([x,y],i)=>{
  const [sx,sy]=pts[i],cross=r.floors[i]!==r.floors[i+1],visible=show(i)||show(i+1);
  return `<g opacity="${visible?1:.12}"><path d="M${sx} ${sy}H${x}V${y}" fill="none" stroke="white" stroke-width="24" stroke-linejoin="round"/><path d="M${sx} ${sy}H${x}V${y}" fill="none" stroke="${cross?'#7c97b5':'#30659b'}" stroke-width="7" stroke-linejoin="round" ${cross?'stroke-dasharray="9 7"':''}/></g>`;
 }).join('');
 $('#map').innerHTML=`<defs><pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#d5e2ee" stroke-width=".6"/></pattern></defs><rect width="780" height="385" fill="url(#grid)"/><g fill="#e2eaf3" stroke="#d0dce9"><rect x="46" y="8" width="205" height="24" rx="6"/><rect x="280" y="8" width="210" height="24" rx="6"/><rect x="520" y="8" width="215" height="24" rx="6"/></g><g fill="#617992" font-size="12" text-anchor="middle"><text x="148" y="25">${stations[active.station].name}站 · 模擬配置</text><text x="385" y="25">${selectedFloor==='all'?'全部樓層連接示意':selectedFloor+' 樓層動線'}</text><text x="627" y="25">${accessible?'電梯優先':'樓梯／手扶梯'}</text></g>${segments}${pts.map(([x,y],i)=>`<g opacity="${show(i)?1:.24}"><g class="map-node" data-step="${i}" tabindex="0" role="button" aria-label="步驟 ${i+1}：${r.floors[i]} ${labels[i]}"><circle cx="${x}" cy="${y}" r="16"/><text x="${x}" y="${y+4}">${i+1}</text></g><rect x="${x-23}" y="${y-44}" width="46" height="21" rx="5" fill="${show(i)?'#24588d':'#849bb3'}"/><text x="${x}" y="${y-29}" text-anchor="middle" fill="white" font-size="12" font-weight="600">${r.floors[i]}</text><text x="${x}" y="${y+39}" text-anchor="middle" fill="#526d88" font-size="12">${labels[i]}</text></g>`).join('')}<text x="45" y="350" fill="#607b96" font-size="11">實線：同層步行　 虛線：跨樓層連接</text><text x="535" y="350" fill="#607b96" font-size="11">${r.via}（模擬）</text>`;
 $('#map').setAttribute('aria-label',`${stations[active.station].name}站樓層示意：${r.floors.join(' → ')}，${selectedFloor==='all'?'顯示全部樓層':'目前檢視 '+selectedFloor}`);
 $('#floorJourney').innerHTML=r.floors.slice(1).map((f,i)=>`<div class="floor-leg ${i===Math.max(0,step-1)?'current':''}"><span>步驟 ${i+1} → ${i+2}</span><strong>${r.floors[i]} → ${f}</strong><small>${floorInstruction(r.floors[i],f)}</small></div>`).join('');
 $('#floorStatus').textContent=`步驟 ${step+1} 所在樓層：${r.floors[step]}${selectedFloor!=='all'?' · 檢視 '+selectedFloor:''}`;
}
function paintLineBadge(el,name){const [code,color]=lineStyles[name]||['●','#30659b'];el.textContent=code;el.style.color=color;el.style.borderColor=color}

