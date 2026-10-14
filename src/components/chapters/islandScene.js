// Scene geometry and walking mechanics ported from the approved Projects G3v2 reference.
// The reference's sample projects are replaced with the curated portfolio projects.
export function createIsland(stage, projects, { onSelect, onOpen, onFailure }) {
  let stopped = false, renderer, scene, resizeObserver, visibleObserver;
  const controller = new AbortController();
  const listen = (el,type,handler) => el.addEventListener(type,handler,{signal:controller.signal});
  const colors=['#FF8A3D','#5EB1FF','#7ED69B','#E58BFF','#FFD25E','#FF8FBA'];
  const PR=projects.map((p,i)=>({n:p.name,c:colors[i]}));
  const io=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){io.disconnect();boot();}});
  io.observe(stage);
  function dispose(){
    stopped=true;controller.abort();io.disconnect();resizeObserver?.disconnect();visibleObserver?.disconnect();
    if(renderer){renderer.setAnimationLoop(null);const disposed=new Set();scene?.traverse(o=>{if(o.geometry&&!disposed.has(o.geometry)){o.geometry.dispose();disposed.add(o.geometry);}for(const m of (Array.isArray(o.material)?o.material:[o.material])){if(!m||disposed.has(m))continue;for(const v of Object.values(m))if(v?.isTexture&&!disposed.has(v)){v.dispose();disposed.add(v);}m.dispose();disposed.add(m);}});renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();}
    stage.querySelector('[data-island-pins]')?.replaceChildren();
  }
  async function boot(){
    let T;
    try{T=await import('../../vendor/three.module.min.js');}catch{if(!stopped)onFailure();return;}
    if(stopped)return;
    try{renderer=new T.WebGLRenderer({antialias:true,powerPreference:'low-power'});}catch{onFailure();return;}
    const R=renderer;R.setPixelRatio(Math.min(devicePixelRatio,1.5));R.setClearColor(0x0B0B0F);stage.prepend(R.domElement);
    scene=new T.Scene();const S=scene;
    const mat=color=>new T.MeshLambertMaterial({color});const box=(w,h,d,color)=>new T.Mesh(new T.BoxGeometry(w,h,d),mat(color));
    const ctx={T,S,R,st:stage,mat,box,listen,openDet:onOpen,showCard:i=>{stage.querySelectorAll('.island-pin').forEach((p,j)=>p.classList.toggle('current',i===j));onSelect(i);}};
    const ray=new T.Raycaster(),point=new T.Vector2();ctx.pick=(e,objs)=>{const b=R.domElement.getBoundingClientRect();point.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);ray.setFromCamera(point,ctx.cam);return ray.intersectObjects(objs,true)[0];};
    const pins=[];ctx.pin=(text,obj,off)=>{const el=document.createElement('button');el.type='button';el.className='island-pin';el.textContent=text;el.title=text;el.setAttribute('aria-label','Walk to '+text);stage.querySelector('[data-island-pins]').append(el);pins.push({el,obj,off:off||new T.Vector3()});return el;};
    SCENE(ctx);
    const v=new T.Vector3();const size=()=>{if(stopped)return;const W=stage.clientWidth,H=stage.clientHeight;R.setSize(W,H,false);ctx.W=W;ctx.H=H;ctx.resize(W,H);};
    resizeObserver=new ResizeObserver(size);resizeObserver.observe(stage);size();
    let last=performance.now(),visible=true;
    const loop=t=>{if(stopped)return;const dt=Math.min(.05,(t-last)/1000);last=t;ctx.tick(dt,t/1000);for(const p of pins){p.obj.getWorldPosition(v).add(p.off).project(ctx.cam);const half=Math.min(ctx.W/2,p.el.offsetWidth/2+12);p.el.style.transform=`translate(${Math.min(ctx.W-half,Math.max(half,(v.x+1)/2*ctx.W))}px,${Math.max(64,(1-v.y)/2*ctx.H)}px) translate(-50%,-100%)`;}R.render(S,ctx.cam);};
    const toggle=()=>{last=performance.now();R.setAnimationLoop(visible&&!document.hidden?loop:null);};
    visibleObserver=new IntersectionObserver(es=>{visible=es.some(e=>e.isIntersecting);toggle();});visibleObserver.observe(stage);listen(document,'visibilitychange',toggle);toggle();stage.dataset.sceneReady='true';
  }
function SCENE(c){const{T,S}=c;const cam=c.cam=new T.OrthographicCamera(-5,5,5,-5,.1,200);
S.children.filter(o=>o.isLight).forEach(o=>S.remove(o));S.add(new T.HemisphereLight(0xC9D8FF,0x2A2433,1.55));const sun=new T.DirectionalLight(0xFFE2C4,1.7);sun.position.set(6,12,4);S.add(sun);
const fm=c2=>new T.MeshLambertMaterial({color:c2,flatShading:true});
// blob shadow texture
const cv=document.createElement('canvas');cv.width=cv.height=64;const g2=cv.getContext('2d');const rg=g2.createRadialGradient(32,32,2,32,32,32);rg.addColorStop(0,'rgba(0,0,0,.55)');rg.addColorStop(1,'rgba(0,0,0,0)');g2.fillStyle=rg;g2.fillRect(0,0,64,64);
const shM=new T.MeshBasicMaterial({map:new T.CanvasTexture(cv),transparent:true,depthWrite:false});const shG=new T.PlaneGeometry(1,1).rotateX(-Math.PI/2);
const blob=(s,x,z)=>{const m=new T.Mesh(shG,shM);m.scale.set(s,1,s);m.position.set(x,.015,z);S.add(m);return m};
// water
const wg=new T.PlaneGeometry(60,60,34,34);wg.rotateX(-Math.PI/2);const water=new T.Mesh(wg,new T.MeshLambertMaterial({color:0x163A52,flatShading:true}));water.position.y=-.62;S.add(water);const wp=wg.attributes.position;const wb=Float32Array.from(wp.array);
const foam=new T.Mesh(new T.TorusGeometry(7.25,.07,6,64),new T.MeshBasicMaterial({color:0x9CC3D8,transparent:true,opacity:.35}));foam.rotation.x=Math.PI/2;foam.position.y=-.55;S.add(foam);
// island
const cliff=new T.Mesh(new T.CylinderGeometry(6.95,6.1,1.5,16),fm(0x4A3B2F));cliff.position.y=-.95;S.add(cliff);const sand=new T.Mesh(new T.CylinderGeometry(7.25,7.3,.25,24),fm(0x7A6A52));sand.position.y=-.5;S.add(sand);
const cells=[];for(let x=-6;x<=6;x++)for(let z=-6;z<=6;z++)if(Math.hypot(x,z)<=6.4)cells.push([x,z]);
const tiles=new T.InstancedMesh(new T.BoxGeometry(.97,.5,.97),fm(0xffffff),cells.length);const D=new T.Object3D();
cells.forEach(([x,z],i)=>{D.position.set(x,-.25+((x*7+z*13)%3)*.012,z);D.updateMatrix();tiles.setMatrixAt(i,D.matrix);tiles.setColorAt(i,new T.Color((x+z)&1?0x2F4B3B:0x365644))});S.add(tiles);
const plaza=new T.Mesh(new T.CylinderGeometry(1.4,1.4,.06,24),fm(0x4E485C));plaza.position.y=.03;S.add(plaza);
const KP=(PR.length===4?[[-3.2,-2.6],[3.2,-2.6],[3.2,2.6],[-3.2,2.6]]:[[-3.7,-1.3],[.7,-4.1],[3.9,-.5],[1.4,3.7],[-2.7,3.1],[4.6,3.4]]).slice(0,PR.length);
// paths
const pp=[];KP.forEach(([x,z])=>{const L=Math.hypot(x,z),dx=x/L,dz=z/L;for(let d=1.75;d<L-1.05;d+=.72)pp.push([dx*d,dz*d,Math.atan2(dx,dz)])});
const paths=new T.InstancedMesh(new T.BoxGeometry(.56,.05,.5),fm(0x5A536A),pp.length);pp.forEach(([x,z,r],i)=>{D.position.set(x+(i%2?.05:-.05),.025,z);D.rotation.set(0,r+(i%3-1)*.15,0);D.updateMatrix();paths.setMatrixAt(i,D.matrix)});S.add(paths);D.rotation.set(0,0,0);
// trees (instanced, swaying)
const TP=[[-5.1,-3.3],[-5.4,.8],[-1.7,-5.3],[4.4,-3.6],[5.5,2.3],[3.9,5],[-1.2,5.6],[-5,4.1],[2.9,-1.9],[-1.4,-2.3],[-.6,2.1]];
const trunk=new T.InstancedMesh(new T.CylinderGeometry(.07,.1,.5,6),fm(0x5B4636),TP.length),c1=new T.InstancedMesh(new T.ConeGeometry(.5,.8,7),fm(0x3F7A55),TP.length),c3=new T.InstancedMesh(new T.ConeGeometry(.36,.6,7),fm(0x4E9466),TP.length);[trunk,c1,c3].forEach(m=>S.add(m));
const tsh=new T.InstancedMesh(shG,shM,TP.length);TP.forEach(([x,z],i)=>{D.position.set(x,.016,z);D.scale.set(1.2,1,1.2);D.updateMatrix();tsh.setMatrixAt(i,D.matrix)});D.scale.set(1,1,1);S.add(tsh);
const tsz=TP.map((_,i)=>.85+((i*37)%5)*.08);
function trees(t){TP.forEach(([x,z],i)=>{const s=tsz[i],sw=Math.sin(t*1.3+i*1.7)*.05;D.scale.setScalar(s);D.rotation.set(sw,0,sw*.6);D.position.set(x,.25*s,z);D.updateMatrix();trunk.setMatrixAt(i,D.matrix);D.position.set(x+sw*.5*s,.85*s,z+sw*.3*s);D.updateMatrix();c1.setMatrixAt(i,D.matrix);D.position.set(x+sw*.9*s,1.3*s,z+sw*.55*s);D.updateMatrix();c3.setMatrixAt(i,D.matrix)});[trunk,c1,c3].forEach(m=>m.instanceMatrix.needsUpdate=true);D.rotation.set(0,0,0);D.scale.set(1,1,1)}
// rocks
const RP=[[-3.2,-4.4,.35],[2.4,-5.4,.3],[5.7,.4,.4],[.4,5.2,.3],[-4.3,-1.9-.6,.22],[4.9,4,.25],[-5.8,2.4,.3]];const rocks=new T.InstancedMesh(new T.DodecahedronGeometry(1,0),fm(0x6B6878),RP.length);RP.forEach(([x,z,s],i)=>{D.position.set(x,s*.5,z);D.scale.set(s*1.3,s,s);D.rotation.set(i,i*2,0);D.updateMatrix();rocks.setMatrixAt(i,D.matrix)});S.add(rocks);D.scale.set(1,1,1);D.rotation.set(0,0,0);
// lamps
const LP=[0,1,2,3].map(k=>[Math.cos(k*Math.PI/2+.785)*1.75,Math.sin(k*Math.PI/2+.785)*1.75]);const pole=new T.InstancedMesh(new T.CylinderGeometry(.04,.06,1.3,6),fm(0x2A2A33),4),bulb=new T.InstancedMesh(new T.SphereGeometry(.12,10,8),new T.MeshBasicMaterial({color:0xFFD9A0}),4);LP.forEach(([x,z],i)=>{D.position.set(x,.65,z);D.updateMatrix();pole.setMatrixAt(i,D.matrix);D.position.set(x,1.38,z);D.updateMatrix();bulb.setMatrixAt(i,D.matrix)});S.add(pole,bulb);
// fireflies
const NF=60,fp=new Float32Array(NF*3),fb=[];for(let i=0;i<NF;i++){const a=Math.random()*6.28,r=Math.random()*6;fb.push([Math.cos(a)*r,.4+Math.random()*2.2,Math.sin(a)*r,Math.random()*6.28])}
const fg=new T.BufferGeometry();fg.setAttribute('position',new T.BufferAttribute(fp,3));const ff=new T.Points(fg,new T.PointsMaterial({color:0xFFD08A,size:.09,transparent:true,opacity:.8,blending:T.AdditiveBlending,depthWrite:false}));S.add(ff);
// kiosks
const ks=[];
function kiosk(i,position,build){if(!PR[i])return;const [x,z]=position;const col=new T.Color(PR[i].c);const g=new T.Group();g.position.set(x,0,z);g.rotation.y=Math.atan2(-x,-z);const base=new T.Mesh(new T.CylinderGeometry(1.05,1.15,.18,8),fm(0x3A3A46));base.position.y=.09;g.add(base);
const body=new T.Group();g.add(body);const mats=[];const M2=c2=>{const m=fm(c2);mats.push(m);return m};build(body,col,M2);
const glow=new T.Mesh(new T.RingGeometry(1.2,1.45,40).rotateX(-Math.PI/2),new T.MeshBasicMaterial({color:col,transparent:true,opacity:0,depthWrite:false}));glow.position.y=.02;g.add(glow);
blob(2.6,x,z);g.userData={i,body,mats,glow,col,s:0,v:0};S.add(g);ks.push(g);return g}
const B=(w,h,d,m,x,y,z)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x||0,y||0,z||0);return o};
kiosk(0,KP[0],(b,col,M)=>{const dark=M(0x1D1D25);b.add(B(1.05,1.95,.36,dark,0,1.17,0),B(.88,1.68,.02,M(col),0,1.17,.19),B(.28,.07,.02,dark,0,1.92,.205));const w=M(0xF4F4F5);[1.55,1.3,1.05].forEach(y=>{b.add(B(.16,.16,.02,w,-.22,y,.21),B(.36,.08,.02,M(0x0B0B0F),.1,y,.21))});b.add(B(.5,.3,.02,M(0x0B0B0F),0,.62,.21))});
kiosk(1,KP[1],(b,col,M)=>{const p=new T.Mesh(new T.CylinderGeometry(.07,.09,2.6,8),M(0x71717A));p.position.y=1.3;b.add(p);const top=new T.Mesh(new T.SphereGeometry(.14,10,8),M(col));top.position.y=2.65;b.add(top);
[[1.0,2.2,1,col],[.8,1.75,-1,0xF4F4F5],[.9,1.32,1,0x8FC7FF]].forEach(([w,y,s,c2])=>{const g=new T.Group();g.position.y=y;g.rotation.y=s>0?.3:-.5;const m=M(c2);g.add(B(w,.26,.07,m,s*w/2,0,0));const tip=new T.Mesh(new T.ConeGeometry(.19,.26,3),m);tip.rotation.z=-s*Math.PI/2;tip.position.x=s*(w+.12);g.add(tip);b.add(g)});
const map=B(.8,.55,.04,M(0xE8E3D3),0,.62,.55);map.rotation.x=-.5;b.add(map);const rt=B(.5,.05,.05,M(col),0,.66,.58);rt.rotation.set(-.5,0,.4);b.add(rt)});
kiosk(2,KP[2],(b,col,M)=>{const m=M(col),m2=M(col.clone().multiplyScalar(.6));[[.85,-.42],[1.4,0],[2.05,.42]].forEach(([h,x],k)=>b.add(B(.36,h,.36,k==2?m:m2,x,.18+h/2,0)));const ar=new T.Mesh(new T.ConeGeometry(.2,.32,4),M(0xFF8A3D));ar.position.set(.42,2.45,0);b.add(ar);const ln=B(1.2,.05,.05,M(0xF4F4F5),0,1.55,.24);ln.rotation.z=.55;b.add(ln)});
kiosk(3,KP[3],(b,col,M)=>{b.add(B(1.45,.75,.7,M(0x5B4636),0,.55,.15),B(1.5,.06,.75,M(0x7A5C44),0,.95,.15));[-.65,.65].forEach(x=>{const p=new T.Mesh(new T.CylinderGeometry(.05,.05,1.5,6),M(0x2A2A33));p.position.set(x,1.2,-.2);b.add(p)});
for(let k=0;k<5;k++){const s=B(.32,.08,.95,M(k%2?0xF4F4F5:col),-.64+k*.32,1.98,.12);s.rotation.x=.25;b.add(s)}
const bub=new T.Mesh(new T.SphereGeometry(.42,14,10),M(0xF4F4F5));bub.scale.set(1.35,1,.55);bub.position.y=2.75;b.add(bub);const tl=new T.Mesh(new T.ConeGeometry(.12,.3,4),M(0xF4F4F5));tl.position.set(-.25,2.38,0);tl.rotation.z=.6;b.add(tl);[-.2,0,.2].forEach(x=>{const d=new T.Mesh(new T.SphereGeometry(.06,8,6),M(col));d.position.set(x,2.75,.22);b.add(d)})});
kiosk(4,KP[4],(b,col,M)=>{b.add(B(1.25,1.25,1.25,M(col.clone().multiplyScalar(.55)),0,.82,0));[[-.3,-.3,col],[.3,-.3,0xF4F4F5],[-.3,.3,0xFF8A3D],[.3,.3,0x5EB1FF]].forEach(([x,z,c2])=>b.add(B(.5,.14,.5,M(c2),x,1.52,z)));
const ring=new T.Mesh(new T.TorusGeometry(.5,.09,8,28),M(col));ring.position.y=2.35;ring.name='ring';b.add(ring);const r2=new T.Mesh(new T.TorusGeometry(.33,.08,8,24),M(0xFF8A3D));r2.position.y=2.35;r2.name='ring2';b.add(r2)});
// chibi avatar
kiosk(5,KP[5],(b,col,M)=>{b.add(B(.95,1.6,.35,M(0x1D1D25),0,.95,0),B(.78,1.25,.04,M(col),0,.95,.2));[-.3,0,.3].forEach(x=>b.add(B(.13,.4,.04,M(0xF4F4F5),x,.9,.24)))});
const av=new T.Group(),rig=new T.Group();av.add(rig);const skin=fm(0xF1C7A0),hood=fm(0xFF8A3D),pants=fm(0x3A3A46),hair=fm(0x2A1E1A),blk=new T.MeshBasicMaterial({color:0x111111});
const cap=(r,l,m)=>new T.Mesh(new T.CapsuleGeometry(r,l,3,8),m);
const torso=cap(.21,.26,hood);torso.position.y=.72;rig.add(torso);const head=new T.Group();head.position.y=1.2;rig.add(head);head.add(new T.Mesh(new T.SphereGeometry(.3,16,12),skin));
const hr=new T.Mesh(new T.SphereGeometry(.32,16,10,0,Math.PI*2,0,Math.PI*.5),hair);hr.rotation.x=-.25;hr.position.y=.02;head.add(hr);[-.1,.1].forEach(x=>{const e=new T.Mesh(new T.SphereGeometry(.04,8,6),blk);e.position.set(x,-.02,.27);head.add(e)});
const limb=(x,y,r,l,m)=>{const p=new T.Group();p.position.set(x,y,0);const o=cap(r,l,m);o.position.y=-l/2-r*.6;p.add(o);rig.add(p);return p};
const aL=limb(-.27,.9,.07,.22,hood),aR=limb(.27,.9,.07,.22,hood),lL=limb(-.1,.48,.08,.18,pants),lR=limb(.1,.48,.08,.18,pants);
const ash=blob(1,0,0);S.add(av);
const st0=KP[0];av.position.set(st0[0]*.62,0,st0[1]*.62);
// ripple
const rip=new T.Mesh(new T.RingGeometry(.25,.33,32).rotateX(-Math.PI/2),new T.MeshBasicMaterial({color:0xFF8A3D,transparent:true,opacity:0,depthWrite:false}));rip.position.y=.04;S.add(rip);let ript=9;
// labels
ks.forEach((g,i)=>{const el=c.pin(PR[i].n.replace(' (sample)',''),g,new T.Vector3(0,3.35,0));el.onclick=()=>walkTo(i)});
// input
const keys={};const km={ArrowLeft:'l',a:'l',A:'l',ArrowRight:'r',d:'r',D:'r',ArrowUp:'u',w:'u',W:'u',ArrowDown:'d',s:'d',S:'d'};const dirs={l:[-1,1],r:[1,-1],u:[-1,-1],d:[1,1]};let tgtP=null;
c.listen(c.st,'keydown',e=>{if(km[e.key]){keys[km[e.key]]=1;tgtP=null;e.preventDefault()}if(e.key=='Enter'&&e.target===c.st&&near!=null){e.preventDefault();c.openDet(near)}});c.listen(c.st,'keyup',e=>{if(km[e.key])keys[km[e.key]]=0});
c.st.querySelectorAll('.island-controls button').forEach(b=>{const d=b.dataset.d;c.listen(b,'pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys[d]=1;tgtP=null;});['pointerup','pointercancel','lostpointercapture'].forEach(type=>c.listen(b,type,()=>{keys[d]=0;}));c.listen(b,'keydown',e=>{if(e.key===' '||e.key==='Enter'){keys[d]=1;tgtP=null;e.preventDefault();}});c.listen(b,'keyup',()=>{keys[d]=0;});});c.listen(c.st,'focusout',()=>Object.keys(keys).forEach(k=>keys[k]=0));c.listen(window,'blur',()=>Object.keys(keys).forEach(k=>keys[k]=0));
const gp=new T.Mesh(new T.PlaneGeometry(40,40).rotateX(-Math.PI/2),new T.MeshBasicMaterial({visible:false}));S.add(gp);
function setTgt(p){tgtP=p;rip.position.x=p.x;rip.position.z=p.z;ript=0}
function walkTo(i){const g=ks[i];const L=Math.hypot(g.position.x,g.position.z);setTgt(new T.Vector3(g.position.x*(1-1.6/L),0,g.position.z*(1-1.6/L)))}c.walkTo=walkTo;
const el=c.R.domElement;c.listen(el,'click',e=>{const h=c.pick(e,ks);if(h){let g=h.object;while(g.userData.i==null)g=g.parent;return walkTo(g.userData.i)}const p=c.pick(e,[gp]);if(p){const q=p.point.setY(0);if(q.length()>6)q.setLength(6);setTgt(q)}});
c.listen(el,'pointermove',e=>{if(e.pointerType!='mouse')return;el.style.cursor=c.pick(e,ks)?'pointer':'crosshair'});
// camera framing
const OFF=new T.Vector3(10,11,10),look=new T.Vector3(),mob={v:false};let U=.02,fr={l:0,r:0,t:0,b:0};
const tmp=new T.OrthographicCamera();tmp.position.copy(OFF);tmp.lookAt(0,0,0);tmp.updateMatrixWorld();const rx=new T.Vector3().setFromMatrixColumn(tmp.matrixWorld,0),uy=new T.Vector3().setFromMatrixColumn(tmp.matrixWorld,1);
let hx=0,hy0=0,hy1=0;ks.forEach(g=>{for(const y of[0,3.6]){const p=g.position.clone().setY(y);hx=Math.max(hx,Math.abs(p.dot(rx)));const v=p.dot(uy);hy0=Math.min(hy0,v);hy1=Math.max(hy1,v)}});
c.resize=(W,H)=>{mob.v=W<H;if(mob.v){const SH=200,Hv=Math.max(220,H-SH);U=Math.max((hx+1.5)*2/W,(hy1-hy0+1.6)/Hv);const cy=(hy1+hy0)/2;fr={l:-W/2*U,r:W/2*U,t:Hv/2*U+cy,b:-(H-Hv/2)*U+cy}}else{const Wv=Math.max(250,W-330);U=11.5/H;fr={l:-Wv/2*U,r:(W-Wv/2)*U,t:H/2*U,b:-H/2*U}}Object.assign(cam,{left:fr.l,right:fr.r,top:fr.t,bottom:fr.b});cam.updateProjectionMatrix()};
// loop
let near=null,heading=0,ph=0,frame=0;const vel=new T.Vector3(),want=new T.Vector3();c.av=av;
c.tick=(dt,t)=>{frame++;let mx=0,mz=0;for(const d in keys)if(keys[d]){mx+=dirs[d][0];mz+=dirs[d][1]}
want.set(0,0,0);if(mx||mz)want.set(mx,0,mz).normalize().multiplyScalar(3.4);else if(tgtP){const v=tgtP.clone().sub(av.position).setY(0);const L=v.length();if(L<.06)tgtP=null;else want.copy(v.setLength(Math.min(3.4,L*4)))}
vel.lerp(want,1-Math.exp(-dt*9));const sp=vel.length();if(sp>.02){const np=av.position.clone().addScaledVector(vel,dt);if(np.length()>6.1)np.setLength(6.1);for(const g of ks){const d=np.clone().sub(g.position).setY(0);if(d.length()<1.15)np.copy(g.position).add(d.setLength(1.15)).setY(0)}av.position.copy(np);
const th=Math.atan2(vel.x,vel.z);let dh=th-heading;dh=Math.atan2(Math.sin(dh),Math.cos(dh));heading+=dh*(1-Math.exp(-dt*12));av.rotation.y=heading}
const k=Math.min(1,sp/3.4);ph+=dt*sp*3.3;const sw=Math.sin(ph)*.75*k;aL.rotation.x=sw;aR.rotation.x=-sw;lL.rotation.x=-sw;lR.rotation.x=sw;rig.position.y=Math.abs(Math.sin(ph))*.08*k;rig.rotation.z=Math.sin(ph)*.04*k;
torso.scale.y=1+Math.sin(t*2.2)*.025*(1-k);head.rotation.y=Math.sin(t*.7)*.15*(1-k);ash.position.set(av.position.x,.017,av.position.z);ash.scale.setScalar(1-rig.position.y*1.5);
let n=null,bd=2.15;ks.forEach((g,i)=>{const d=g.position.distanceTo(av.position);if(d<bd){bd=d;n=i}});if(n!==near){near=n;c.showCard(n)}
ks.forEach((g,i)=>{const u=g.userData,tg=i===n?1:0;u.v+=(170*(tg-u.s)-11*u.v)*dt;u.s+=u.v*dt;const s=Math.max(0,u.s);u.body.position.y=u.s*.28;u.body.scale.setScalar(1+u.s*.06);u.glow.material.opacity=Math.min(.9,s*.9);u.glow.scale.setScalar(1+Math.sin(t*3)*.03*s);u.mats.forEach(m=>m.emissive.copy(u.col).multiplyScalar(Math.min(.35,s*.3)));const r=u.body.getObjectByName('ring');if(r){r.rotation.y=t*1.2;r.rotation.x=Math.sin(t)*.3;u.body.getObjectByName('ring2').rotation.x=t*1.5}});
if(ript<1){ript+=dt/.7;rip.scale.setScalar(1+ript*3);rip.material.opacity=.9*(1-ript)}else rip.material.opacity=0;
if(frame%2==0){for(let i=0;i<wp.count;i++){const x=wb[i*3],z=wb[i*3+2];wp.setY(i,Math.sin(x*.55+t*1.1)*.07+Math.cos(z*.6+t*.9)*.07)}wp.needsUpdate=true;wg.computeVertexNormals()}
foam.scale.setScalar(1+Math.sin(t*1.2)*.008);foam.material.opacity=.25+Math.sin(t*1.2)*.1;
for(let i=0;i<NF;i++){const b=fb[i];fp[i*3]=b[0]+Math.sin(t*.4+b[3])*.4;fp[i*3+1]=b[1]+Math.sin(t*.8+b[3]*2)*.25;fp[i*3+2]=b[2]+Math.cos(t*.35+b[3])*.4}fg.attributes.position.needsUpdate=true;ff.material.opacity=.55+Math.sin(t*2)*.2;
trees(t);if(frame%15===0){c.st.dataset.avatarX=av.position.x.toFixed(3);c.st.dataset.avatarZ=av.position.z.toFixed(3);}
const tgtL=mob.v?av.position.clone().multiplyScalar(.06):av.position;look.lerp(tgtL,1-Math.exp(-dt*(mob.v?2:2.6)));cam.position.copy(look).add(OFF);cam.lookAt(look)};
trees(0)}

return dispose;
}
