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
function routeModel(){
 const p=stationRoutes[active.station], ls=stations[active.station].lines;
 const a=ls.indexOf(active.from),b=ls.indexOf(active.to),variation=a+b-1;
 let points=p.points.map(([x,y])=>[x,y+(variation%3)*12]);
 if(a>b)points=points.map(([x,y])=>[760-x,y]);
 if(accessible)points=points.map(([x,y],i)=>[x,y+(i===1||i===2?22:0)]);
 return {...p,points,minutes:p.minutes+variation+(accessible?4:0),distance:p.distance+variation*70+(accessible?120:0)};
}
function routeArrow(a,b){const dx=b[0]-a[0],dy=b[1]-a[1];return Math.abs(dx)>Math.abs(dy)?(dx>0?'→':'←'):(dy>0?'↓':'↑')}
function renderStationMap(r){
 const pts=r.points, segments=pts.slice(1).map((p,i)=>`H${p[0]}V${p[1]}`).join(' '),d=`M${pts[0].join(' ')} ${segments}`;
 const labels=[r.labels[0],accessible?'電梯連接區':r.labels[1],r.labels[2],r.labels[3]];
 $('#map').innerHTML=`<defs><pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#d5e2ee" stroke-width=".6"/></pattern></defs><rect width="780" height="385" fill="url(#grid)"/><g fill="#e2eaf3" stroke="#d0dce9"><rect x="46" y="39" width="204" height="36" rx="6"/><rect x="350" y="39" width="185" height="36" rx="6"/><rect x="565" y="39" width="165" height="36" rx="6"/></g><g fill="#617992" font-size="11" text-anchor="middle"><text x="148" y="62">${stations[active.station].name}站 · 模擬配置</text><text x="442" y="62">${r.level}</text><text x="647" y="62">${accessible?'電梯優先':'一般步行'}</text></g><path d="${d}" fill="none" stroke="white" stroke-width="25" stroke-linejoin="round"/><path id="routePath" d="${d}" fill="none" stroke="#30659b" stroke-width="7" stroke-linejoin="round" ${accessible?'stroke-dasharray="10 5"':''}/>${pts.map(([x,y],i)=>`<g class="map-node" data-step="${i}" tabindex="0" role="button" aria-label="步驟 ${i+1}：${labels[i]}"><circle cx="${x}" cy="${y}" r="16"/><text x="${x}" y="${y+4}">${i+1}</text></g><text x="${x}" y="${y+39}" text-anchor="middle" fill="#526d88" font-size="12">${labels[i]}</text>`).join('')}<text x="45" y="350" fill="#607b96" font-size="11">起點 1 → 終點 4　·　點選數字查看步驟</text><text x="555" y="350" fill="#607b96" font-size="11">${r.via}（模擬）</text>`;
 $('#map').setAttribute('aria-label',`${stations[active.station].name}站 ${active.from} 轉乘 ${active.to} 模擬動線`);
}
function paintLineBadge(el,name){const [code,color]=lineStyles[name]||['●','#30659b'];el.textContent=code;el.style.color=color;el.style.borderColor=color}
