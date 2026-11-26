import {THREE as T} from './kit.js';
const TAU=Math.PI*2, V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const sphere=new T.SphereGeometry(1,14,10);
const grain=new T.IcosahedronGeometry(1,0);
const up=V(0,1,0);
const cutCorner=p=>p.x>-.03 && p.z>.02;
const filament=new T.CatmullRomCurve3([V(-2.3,-1.05,.12),V(-1.15,-.88,.16),V(.05,-.25,.25),V(1.1,.48,.1),V(1.68,1.28,-.06),V(1.25,1.56,-.2),V(.43,1.16,-.45),V(.2,.6,-.42)]);
const unitDirections=count=>Array.from({length:count},(_,i)=>{
  const y=1-2*(i+.5)/count, r=Math.sqrt(1-y*y), a=i*2.39996323;
  return V(r*Math.cos(a),y,r*Math.sin(a));
});
function coil(points,radius) {return new T.TubeGeometry(new T.CatmullRomCurve3(points),Math.max(45,points.length*2),radius,8,false);}
function spikeGeometry() {
  const profile=[[.072,0],[.063,.12],[.074,.18],[.105,.215],[.148,.26],[.15,.305],[.108,.344],[.055,.365],[0,.36]];
  const g=new T.LatheGeometry(profile.map(([x,y])=>new T.Vector2(x,y)),24);
  const pos=g.attributes.position;
  for(let i=0;i<pos.count;i++){
    const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),a=Math.atan2(z,x);
    const k=1+(y>.19?.17:.04)*Math.cos(3*a+.55)+.035*Math.sin(9*a+19*y);
    pos.setXYZ(i,x*k,y+.018*Math.cos(3*a)*Math.min(1,y*3),z*k);
  }
  g.computeVertexNormals();return g;
}
const club=spikeGeometry();
const cylinder=new T.CylinderGeometry(1,1,1,10);
// Keep two non-overlapping portions of each triangle outside the sectional window.
// Interpolate normals at the cut so the two edges meet cleanly even on an angled face.
function trimmed(g, filamentCut=false) {
  const geo=g.index?g.toNonIndexed():g, pos=geo.attributes.position, normals=geo.attributes.normal;
  const vertices=[], shading=[];
  const xDistance=filamentCut?p=>-.65-p.x:p=>p.x+.03;
  const zDistance=filamentCut?p=>p.z-.16:p=>p.z-.02;
  function clip(poly,distance,positive){
    const out=[];
    for(let i=0;i<poly.length;i++){
      const a=poly[i],b=poly[(i+1)%poly.length],da=distance(a.p),db=distance(b.p);
      const keepA=positive?da>=0:da<0,keepB=positive?db>=0:db<0;
      if(keepA)out.push(a);
      if(keepA!==keepB){
        const t=da/(da-db);
        out.push({p:a.p.clone().lerp(b.p,t),n:a.n.clone().lerp(b.n,t).normalize()});
      }
    }
    return out;
  }
  function append(poly){
    for(let j=1;j<poly.length-1;j++){
      for(const v of [poly[0],poly[j],poly[j+1]]){vertices.push(...v.p.toArray());shading.push(...v.n.toArray());}
    }
  }
  for(let i=0;i<pos.count;i+=3){
    const tri=[i,i+1,i+2].map(j=>({p:V().fromBufferAttribute(pos,j),n:V().fromBufferAttribute(normals,j)}));
    append(clip(tri,xDistance,false));
    append(clip(clip(tri,xDistance,true),zDistance,false));
  }
  const out=new T.BufferGeometry();
  out.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
  out.setAttribute('normal',new T.Float32BufferAttribute(shading,3));
  if(geo!==g)geo.dispose();
  return out;
}
export function buildModel(kit,id) {
  const root=new T.Group(), outer=new T.Group(), whole=new T.Group(), inside=new T.Group();
  root.add(outer,whole,inside);
  const anchors=[], picks=[], batches=new Map();
  const surfaceInk=new T.MeshBasicMaterial({color:0x603b32,side:T.BackSide});
  const tint=(c)=>new T.MeshStandardMaterial({color:c,roughness:.86,side:T.DoubleSide});
  const shell=tint('#aeb6b1'), shadow=tint('#86958d'), red=tint('#bd4b37'), dark=tint('#774037'), core=tint('#797974'), ivory=tint('#d2c9ac'), rust=tint('#d88559');
  const isFil=id==='ebola', isBullet=id==='rabies', isPoly=id==='adenovirus', isLayer=id==='rotavirus', isNoro=id==='norovirus', isHB=id==='hepatitis-b';
  const facets=isPoly||isLayer||isNoro;
  const stretch=id==='influenza'?V(1.12,.89,.94):id==='measles'?V(1.09,.9,1):V(1,1,1);
  const removed=isFil ? p=>p.x<-.65 && p.z>.16 : cutCorner;
  const register=(p,i,prefer)=>{if(i==null)return; if(!anchors[i]||prefer)anchors[i]=p.clone();};
  function mesh(g,m,group,part) {
    const obj=new T.Mesh(g,m);group.add(obj);
    if(part!=null){obj.userData.part=part;picks.push(obj);}return obj;
  }
  function batch(g,m,group,part,p,s,q,preferred=false){
    const key=[g.uuid,m.uuid,group.uuid,part].join('/');
    if(!batches.has(key))batches.set(key,{g,m,group,part,matrices:[]});
    batches.get(key).matrices.push(new T.Matrix4().compose(p,q||new T.Quaternion(),s));
    register(p,part,preferred);
  }
  const orient=d=>new T.Quaternion().setFromUnitVectors(up,d.clone().normalize());
  const fullShellIndex=isNoro?1:id==='influenza'?2:isPoly?2:1;
  function shellPair(g,m,index) {
    mesh(g,m,whole,index);
    mesh(trimmed(g,isFil),m,outer,index);
  }
  function surface(d) {
    const n=1.48*(1+.023*Math.sin(7*d.x+2*d.z)*Math.cos(6*d.y-d.z)+.012*Math.sin(14*d.z+3*d.x));
    return d.clone().multiply(stretch).multiplyScalar(n);
  }
  function sphericalGeometry(radius=1) {
    const g=new T.IcosahedronGeometry(1,facets?(isPoly?0:3):28),pos=g.attributes.position;
    for(let i=0;i<pos.count;i++){
      const p=surface(V().fromBufferAttribute(pos,i).normalize()).multiplyScalar(radius);
      pos.setXYZ(i,p.x,p.y,p.z);
    }
    g.computeVertexNormals();return g;
  }
  const fib=filament.computeFrenetFrames(160,false);
  function filPoint(t,a,r) {
    const k=Math.min(160,Math.round(t*160));
    const n=fib.normals[k].clone().multiplyScalar(Math.cos(a)).addScaledVector(fib.binormals[k],Math.sin(a));
    return [filament.getPointAt(t).addScaledVector(n,r),n];
  }
  const bulletProfile=[V(.05,-1.53),V(.64,-1.53),V(.75,-1.47),V(.78,-1.35),V(.78,.70),V(.75,.97),V(.65,1.22),V(.49,1.43),V(.28,1.56),V(.01,1.61)];
  function body(radius=1){
    if(isFil)return new T.TubeGeometry(filament,180,.265*radius,36,false);
    if(isBullet)return new T.LatheGeometry(bulletProfile.map(p=>new T.Vector2(p.x*radius,p.y*radius)),80);
    return sphericalGeometry(radius);
  }
  shellPair(body(),shell,fullShellIndex);
  // A second skin gives the open illustration a visible inner wall.
  shellPair(body(.965),shadow,fullShellIndex);
  const directions=unitDirections(isFil?145:isBullet?152:isPoly?12:id==='sars-cov-2'?70:id==='influenza'?218:168);
  const corona=id==='sars-cov-2';
  let fibVertices=[];
  if(isPoly){
    const g=new T.IcosahedronGeometry(1,0),pos=g.attributes.position;
    for(let i=0;i<pos.count;i++){
      const p=V().fromBufferAttribute(pos,i);
      if(!fibVertices.some(v=>v.distanceToSquared(p)<.001))fibVertices.push(p);
    }
  }
  function projection(p,n,i){
    const group=removed(p)?whole:outer;
    // Outer features surviving the cut are shared between both views.
    const groups=group===outer?[outer,whole]:[whole];
    for(const dst of groups){
      const q=orient(n),top=p.clone().addScaledVector(n,isPoly?.54:.27);
      if(isPoly){
        batch(cylinder,core,dst,1,p.clone().lerp(top,.5),V(.026,.56,.026),q);
        batch(grain,red,dst,0,top,V(.115,.125,.115),q);
      }else if(id==='dengue'||isHB||isNoro){
        const len=id==='dengue'?.22:.13;
        for(const sign of [-1,1]){
          const side=V(sign*.072,0,0).applyQuaternion(q);
          batch(sphere,isNoro?ivory:id==='dengue'?rust:shadow,dst,0,p.clone().add(side),V(len,.073,.098),q);
        }
      }else{
        const part=id==='influenza'&&i%5===0?1:0;
        if(isLayer && i%3!==0) continue;
        const s=corona?.93:isFil?.35:isBullet?.54:id==='influenza'?.53:.65;
        batch(club,part===1?ivory:red,dst,part,p,V(s,s,s),q);
        batch(club,surfaceInk,dst,null,p,V(s*1.048,s*1.012,s*1.048),q);
      }
    }
  }
  directions.forEach((d,i)=>{
    let p=surface(d),n=d;
    if(isFil){[p,n]=filPoint((i+.5)/directions.length,i*2.39996,.263);}
    if(isBullet){
      const y=-1.46+3*(i+.5)/directions.length,a=i*2.39996;
      const r=y>.70?.78*Math.sqrt(Math.max(.05,1-((y-.7)/.92)**2)):.78;
      p=V(r*Math.cos(a),y,r*Math.sin(a));n=V(Math.cos(a),Math.max(0,y-.7),Math.sin(a)).normalize();
    }
    if(isPoly){n=fibVertices[i];p=surface(n);}
    projection(p,n,i);
  });
  // Fine granules on the lipid surface. One instanced draw per material.
  if(!isPoly){
    unitDirections(isFil?1450:1750).forEach((d,i)=>{
      let p=surface(d),n=d;
      if(isFil){[p,n]=filPoint((i+.5)/1450,i*2.399963,.265);}
      if(isBullet){
        const y=-1.46+3.04*(i+.5)/1750,a=i*2.39996,r=y>.7?.78*Math.sqrt(Math.max(.02,1-((y-.7)/.92)**2)):.78;
        p=V(r*Math.cos(a),y,r*Math.sin(a));n=V(Math.cos(a),Math.max(0,y-.7),Math.sin(a)).normalize();
      }
      const sz=(isFil?.017:.025)*(1+.43*Math.sin(i*17));
      const material=i%4===0?shadow:shell;
      const add=dst=>batch(grain,material,dst,null,p,V(sz,sz*.8,sz),orient(n));
      add(whole);if(!removed(p))add(outer);
    });
  }
  function innerShell(radius,mat,i) {
    const g=body(radius);mesh(trimmed(g,isFil),mat,inside,i);
  }
  if(isFil||isBullet){
    const path=[];
    for(let i=0;i<=450;i++){
      const t=i/450,a=t*TAU*(isFil?45:23);
      path.push(isFil?filPoint(t,a,.14)[0]:V(.49*Math.cos(a),-1.39+2.68*t,.49*Math.sin(a)));
    }
    mesh(coil(path,isFil?.047:.068),ivory,inside,isFil?2:3);
    if(isFil)mesh(new T.TubeGeometry(filament,150,.055,8,false),dark,inside,3);
    else innerShell(.87,rust,2);
  }else if(id==='influenza'){
    for(let k=0;k<8;k++){
      const a=k*TAU/7, cx=k===7?0:.51*Math.cos(a),cz=k===7?0:.51*Math.sin(a),pts=[];
      for(let i=0;i<55;i++)pts.push(V(cx+.07*Math.cos(i*.51),-.8+i*.032,cz+.07*Math.sin(i*.51)));
      mesh(coil(pts,.065),k%2?rust:ivory,inside,3);
    }
  }else{
    const coreIndex=isNoro?2:3;
    if(id==='measles')innerShell(.86,rust,2);
    if(isLayer||isHB){
      const g=new T.IcosahedronGeometry(isHB?.96:1.19,isHB?0:2);
      mesh(trimmed(g,isFil),rust,inside,2);
      if(isLayer){
        const obj=kit.part(new T.IcosahedronGeometry(.85,2),kit.M.steel,{edges:16,outline:false});
        inside.add(obj);obj.traverse(o=>{if(o.isMesh){o.userData.part=3;picks.push(o);}});
      }
    }
    if(!isLayer){
      const pts=[];
      for(let i=0;i<=225;i++){
        const a=TAU*i/225;
        if(isHB)pts.push(V(.58*Math.cos(a),.57*Math.sin(a),.22*Math.sin(2*a)));
        else pts.push(V(.72*Math.sin(3*a+.5)+.19*Math.cos(9*a),.82*Math.cos(2*a)+.14*Math.sin(7*a),.60*Math.sin(5*a)));
      }
      mesh(coil(pts,isHB?.045:.049),dark,inside,coreIndex);
      if(isHB||isPoly)mesh(coil(pts.slice(isHB?45:0).map((p,i)=>p.clone().add(V(.07*Math.cos(i*.22),.07*Math.sin(i*.22),.03))),.032),ivory,inside,coreIndex);
      if(corona||id==='dengue'||id==='measles'){
        const k=id==='measles'?3:2;
        pts.filter((_,i)=>i%3===0 && i%21<15).forEach((v,i)=>batch(sphere,i%3?rust:ivory,inside,k,v,V(.115,.107,.097)));
      }
    }
  }
  for(const {g,m,group,part,matrices} of batches.values()){
    const obj=new T.InstancedMesh(g,m,matrices.length);
    matrices.forEach((matrix,i)=>obj.setMatrixAt(i,matrix));group.add(obj);
    if(part!=null){obj.userData.part=part;picks.push(obj);}
  }
  // Anchors are placed on actual geometry in the cutaway's initial viewing direction.
  function nearestFeature(index,target){
    let best=null,dist=Infinity;
    for(const b of batches.values()){
      if(b.part!==index||b.group===whole)continue;
      for(const mat of b.matrices){
        const p=V().setFromMatrixPosition(mat),d=p.distanceToSquared(target);
        if(d<dist){dist=d;best=p;}
      }
    }
    return best||target;
  }
  anchors[0]=nearestFeature(0,isFil?V(.8,1.3,.2):V(-.78,1.05,.65));
  anchors[fullShellIndex]=isFil?filPoint(.82,1,.265)[0]:isBullet?V(-.72,.23,.3):surface(V(-.82,-.22,.53).normalize());
  if(isPoly)anchors[1]=nearestFeature(1,V(.1,1.45,-.25));
  if(id==='influenza')anchors[1]=nearestFeature(1,V(1,.6,-.25));
  if(isFil){anchors[2]=filPoint(.12,1,.14)[0];anchors[3]=filament.getPointAt(.028);}
  else if(isBullet){anchors[2]=V(.66,-.3,-.06);anchors[3]=V(.42,-.55,.25);}
  else if(id==='influenza'){anchors[3]=V(.54,.22,.08);}
  else if(isLayer){anchors[2]=V(1.02,.40,-.03);anchors[3]=V(.4,.27,.65);}
  else if(isHB){anchors[2]=V(.78,.13,-.05);anchors[3]=V(.56,.12,.09);}
  else{
    if(id==='measles')anchors[2]=V(1.14,-.15,-.06);
    else if(corona||id==='dengue')anchors[2]=nearestFeature(2,V(.65,.6,.25));
    const idx=isNoro?2:3;anchors[idx]=id==='measles'?nearestFeature(3,V(.62,.20,.52)):V(.54,-.38,.52);
  }
  if(isBullet)root.rotation.z=-.44;
  if(!isFil&&!isBullet)root.rotation.z=-.19;
  // Snap each leader to a vertex of its labeled structure. Open-side vertices
  // are preferred on inner components so the leader lands inside the window.
  anchors.forEach((target,index)=>{
    let closest=null,dist=Infinity;
    for(const obj of picks){
      if(obj.userData.part!==index || obj.parent===whole)continue;
      if(obj.isInstancedMesh)continue;
      const pos=obj.geometry.attributes.position,indices=obj.geometry.index;
      const count=indices?indices.count:pos.count;
      for(let j=0;j<count;j++){
        const p=V().fromBufferAttribute(pos,indices?indices.getX(j):j);
        const d=p.distanceToSquared(target);
        if(d<dist){dist=d;closest=p;}
      }
    }
    if(closest)anchors[index]=closest;
  });
  const exterior=new Set([0,fullShellIndex]);if(isPoly||id==='influenza')exterior.add(1);
  const highlighted = new Map();
  for (const object of picks) {
    const original = object.material;
    if (!highlighted.has(original)) {
      const accent = original.clone();
      accent.color.lerp(new T.Color('#e7862e'), .68);
      accent.emissive.set('#c86021');
      accent.emissiveIntensity = .32;
      highlighted.set(original, accent);
    }
    object.userData.originalMaterial = original;
  }
  return {
    root,
    anchors,
    exterior,
    setCut(on) { outer.visible = on; inside.visible = on; whole.visible = !on; },
    highlight(part) {
      for (const object of picks) {
        const original = object.userData.originalMaterial;
        object.material = object.userData.part === part ? highlighted.get(original) : original;
      }
    }
  };
}
