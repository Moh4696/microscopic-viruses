import {makeKit,THREE as T} from './kit.js';
import {buildModel} from './models.js';
import {specimens} from './specimens.js';
import {createPartPicker} from './visible-parts.js';

const $=id=>document.getElementById(id), num=n=>String(n+1).padStart(2,'0');
const params=new URLSearchParams(location.search);
const models=new Map(), buttons=[], viewerButtons=[], pins=[], lines=[], dots=[];
let kit,picker,model,spec,selected=0,cut=true,labels=true,spin=false,figure=params.get('layout')==='figure';
const stage=$('stage'),canvas=$('gl');
let pendingFrame=0,previousTime=0;
function invalidate(){
  if(kit && !pendingFrame)pendingFrame=requestAnimationFrame(render);
}
function render(t){
  if(spin)kit.controls.update(Math.min((t-previousTime)/1000,.08));
  previousTime=t;kit.renderer.render(kit.scene,kit.camera);drawLabels();
  pendingFrame=0;if(spin)invalidate();
}
try { kit=makeKit(canvas);kit.controls.enableDamping=false;kit.controls.autoRotateSpeed=.9;kit.controls.minDistance=3;kit.controls.maxDistance=24;picker=createPartPicker(kit); }
catch { $('fallback').hidden=false;document.querySelectorAll('.controls button:not(#expand)').forEach(b=>b.disabled=true); }
const svg=(tag)=>document.createElementNS('http://www.w3.org/2000/svg',tag);
function makeButton(label,onClick){const b=document.createElement('button');b.textContent=label;b.onclick=onClick;return b;}
function toggle(id,value){$(id).setAttribute('aria-pressed',String(value));}
function cameraHome(){
  if(!kit)return;
  const ratio=stage.clientWidth/stage.clientHeight;
  const radius=spec.id==='ebola'?2.65:2.22;
  const dist=radius/(Math.tan(kit.camera.fov*Math.PI/360)*Math.min(1,ratio));
  kit.controls.target.set(0,.10,0);kit.camera.position.set(.27,.25,1).normalize().multiplyScalar(dist).add(kit.controls.target);
  kit.controls.update();resize();
}
function resize(){
  if(!kit)return;
  const w=stage.clientWidth,h=stage.clientHeight;
  kit.renderer.setSize(w,h,false);kit.camera.aspect=w/h;
  kit.camera.setViewOffset(w,h,0,-Math.round(h*.045),w,h);kit.camera.updateProjectionMatrix();invalidate();
}
function displayTab(clinical){
  $('clinical').hidden=!clinical;$('anatomy').hidden=clinical;toggle('illnessTab',clinical);toggle('anatomyTab',!clinical);
}
function setCut(on){
  cut=on;model?.setCut(cut);toggle('cut',cut);$('viewname').textContent=cut?'Sectional view':'Exterior view';invalidate();
}
function choosePart(i, fromModel = false) {
  selected = i;
  if (model && !model.exterior.has(i) && !cut) setCut(true);
  if (fromModel) displayTab(false);
  model?.highlight(i);
  for (const [index, button] of buttons.entries()) {
    const active = index === i;
    button.setAttribute('aria-expanded', String(active));
    button.nextElementSibling.hidden = !active;
    viewerButtons[index].setAttribute('aria-pressed', String(active));
    togglePin(index, active);
  }
  const [name, description] = spec.parts[i];
  const heading = document.createElement('strong');
  heading.textContent = num(i) + '  ' + name;
  const body = document.createElement('p');
  body.textContent = description;
  $('viewerDetail').replaceChildren(heading, body);
  invalidate();
}
function togglePin(i,on){pins[i]?.setAttribute('aria-pressed',String(on));}
function setFigure(value){
  figure=value;document.body.classList.toggle('figure',value);
  $('expand').textContent=value?'↙':'⛶';$('expand').setAttribute('aria-label',value?'Return to atlas':'Figure view');
  $('expand').title=value?'Return to atlas':'Figure view';
  const url=new URL(location.href);if(value)url.searchParams.set('layout','figure');else url.searchParams.delete('layout');history.replaceState(null,'',url);
  cameraHome();
}
function switchSpec(index){
  spec=specimens[index];canvas.setAttribute('aria-label','Rotatable 3D model of '+spec.name+'. Use arrow keys to rotate and plus or minus to zoom.');
  $('mobileSpec').value=spec.id;
  [...$('specimens').children].forEach((b,i)=>b.setAttribute('aria-current',String(i===index)));
  $('fig').textContent='Figure '+num(index)+' / 10';$('plate').textContent='Plate V–'+num(index);
  for(const [id,key] of Object.entries({specName:'name',family:'family',intro:'intro',shape:'shape',genome:'genome',symptoms:'symptoms',effects:'effects',disease:'disease'}))$(id).textContent=spec[key];
  $('source').href=spec.source;$('source').textContent=(spec.source.includes('who.int')?'WHO fact sheet':'CDC health profile')+' ↗';
  if(kit){
    if(model)kit.scene.remove(model.root);
    if(!models.has(spec.id))models.set(spec.id,buildModel(kit,spec.id));
    model=models.get(spec.id);kit.scene.add(model.root);cameraHome();
  }
  buttons.length=viewerButtons.length=pins.length=lines.length=dots.length=0;
  for(const id of ['parts','viewerParts','pins','leaders'])$(id).replaceChildren();
  spec.parts.forEach(([name,desc],i)=>{
    const row=document.createElement('div');row.className='part';
    const b=makeButton('',()=>choosePart(i));const badge=document.createElement('span');badge.className='bubble';badge.textContent=num(i);
    b.append(badge,document.createTextNode(name));const p=document.createElement('p');p.textContent=desc;p.id='explain-'+i;b.setAttribute('aria-controls',p.id);
    row.append(b,p);$('parts').append(row);buttons.push(b);
    const keyButton = makeButton('', () => choosePart(i, true));
    const keyBadge = badge.cloneNode(true);
    keyButton.append(keyBadge, document.createTextNode(name));
    keyButton.setAttribute('aria-controls', 'viewerDetail');
    $('viewerParts').append(keyButton);
    viewerButtons.push(keyButton);

    const pin=makeButton('',()=>choosePart(i,true));pin.className='pin';pin.setAttribute('aria-label',num(i)+' '+name);
    const number=document.createElement('span');number.className='pin-number';number.textContent=num(i);
    const title=document.createElement('span');title.className='pname';title.textContent=name;
    pin.append(number,title);$('pins').append(pin);pins.push(pin);
    const line=svg('polyline'),dot=svg('circle');line.setAttribute('fill','none');dot.setAttribute('stroke-width','1.5');
    $('leaders').append(line,dot);lines.push(line);dots.push(dot);
  });
  setCut(true);choosePart(0);
  const url=new URL(location.href);url.searchParams.set('virus',spec.id);history.replaceState(null,'',url);
}
specimens.forEach((s,i)=>{
  const b=makeButton('',()=>switchSpec(i));b.className='spec';const no=document.createElement('span');no.className='num';no.textContent=num(i);
  const img=new Image();img.alt='';img.src='assets/'+s.id+'.png';const name=document.createElement('strong');name.textContent=s.name;
  b.append(no,img,name);$('specimens').append(b);
  $('mobileSpec').add(new Option(num(i)+' · '+s.name,s.id));
});
$('mobileSpec').onchange=e=>switchSpec(specimens.findIndex(s=>s.id===e.target.value));
$('illnessTab').onclick=()=>displayTab(true);$('anatomyTab').onclick=()=>displayTab(false);
$('guide').onclick=()=>$('guideDialog').showModal();$('closeGuide').onclick=()=>$('guideDialog').close();
$('cut').onclick=()=>{setCut(!cut);if(!cut)choosePart(0);};
$('labels').onclick=()=>{labels=!labels;toggle('labels',labels);invalidate();};$('rotate').onclick=()=>{spin=!spin;toggle('rotate',spin);kit.controls.autoRotate=spin;invalidate();};
$('reset').onclick=cameraHome;$('expand').onclick=()=>setFigure(!figure);
canvas.addEventListener('keydown',e=>{
  if(!kit)return;
  const orbit=new T.Spherical().setFromVector3(kit.camera.position.clone().sub(kit.controls.target));
  const delta={ArrowUp:[0,-.14],ArrowDown:[0,.14],ArrowLeft:[-.14,0],ArrowRight:[.14,0]}[e.key];
  if(delta){orbit.theta+=delta[0];orbit.phi+=delta[1];orbit.makeSafe();}
  else if(['+','=','-'].includes(e.key)){orbit.radius=T.MathUtils.clamp(orbit.radius*(e.key==='-'?1.12:.89),3,24);}
  else return;
  e.preventDefault();kit.camera.position.setFromSpherical(orbit).add(kit.controls.target);kit.controls.update();
});
let down;canvas.onpointerdown=e=>{down=[e.clientX,e.clientY];};
canvas.addEventListener('pointerup',e=>{
  if(!kit||!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>4)return;
  const {left, top, width, height} = canvas.getBoundingClientRect();
  picker.update(model, cut, width, height);
  const hit = picker.pick((e.clientX - left) / width, (e.clientY - top) / height);
  if (hit >= 0) choosePart(hit, true);
});

function drawLabels() {
  const enabled = labels && !!kit;
  $('pins').hidden = $('leaders').hidden = !enabled;
  if (!enabled) return;
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  if (!width || !height) return;

  picker.update(model, cut, width, height);
  const preferred = model.anchors.map(anchor => {
    const point = model.root.localToWorld(anchor.clone()).project(kit.camera);
    return {x: (point.x + 1) / 2, y: (1 - point.y) / 2};
  });
  const points = picker.anchors(preferred);
  const active = points.flatMap((point, index) => point ? [index] : []);
  active.sort((a, b) => points[a].x - points[b].x);
  for (const [index, pin] of pins.entries()) {
    pin.hidden = !points[index];
    lines[index].style.display = dots[index].style.display = pin.hidden ? 'none' : '';
  }

  const split = Math.ceil(active.length / 2);
  const railGroups = [active.slice(0, split), active.slice(split)];
  railGroups.forEach((group, right) => {
    group.sort((a, b) => points[a].y - points[b].y);
    const margin = width < 460 ? 9 : 15;
    const floor = height - 36;
    const ceiling = Math.min(127, height * .28);
    let previous = ceiling - 42;
    group.forEach((index, row) => {
      const point = points[index];
      const pin = pins[index];
      const buttonWidth = pin.offsetWidth;
      const x = right ? width - margin - buttonWidth : margin;
      const y = T.MathUtils.clamp(
        point.y * height, previous + 42, floor - (group.length - row - 1) * 42
      );
      previous = y;
      pin.style.left = x + 'px';
      pin.style.top = (y - pin.offsetHeight / 2) + 'px';

      const start = right ? x : x + buttonWidth;
      const endX = point.x * width;
      const endY = point.y * height;
      const bend = start + Math.sign(endX - start) * Math.min(13, Math.abs(endX - start) / 2);
      const color = index === selected ? '#a13c26' : '#464d43';
      lines[index].setAttribute('points', `${start},${y} ${bend},${y} ${endX},${endY}`);
      lines[index].setAttribute('stroke', color);
      lines[index].setAttribute('stroke-width', index === selected ? '1.8' : '1.1');
      dots[index].setAttribute('fill', color);
      dots[index].setAttribute('stroke', '#fbfaf4');
      dots[index].setAttribute('r', index === selected ? '5' : '3.5');
      dots[index].setAttribute('cx', endX);
      dots[index].setAttribute('cy', endY);
    });
  });
}
const idx=specimens.findIndex(s=>s.id===params.get('virus'));switchSpec(Math.max(0,idx));setFigure(figure);
if(kit){
  let lastAspect=stage.clientWidth/stage.clientHeight;
  const watch=new ResizeObserver(()=>{
    const aspect=stage.clientWidth/stage.clientHeight;
    const scale=Math.min(1,lastAspect)/Math.min(1,aspect);
    kit.camera.position.sub(kit.controls.target).multiplyScalar(scale).add(kit.controls.target);
    lastAspect=aspect;resize();
  });watch.observe(stage);
  kit.controls.addEventListener('change',invalidate);
  invalidate();
}else{drawLabels();}
