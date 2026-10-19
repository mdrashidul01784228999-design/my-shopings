"use client";
/* eslint-disable */
import { useEffect } from "react";
import * as THREE from "three";

export default function CrocGame() {
  useEffect(() => {
    let raf;
    const L = [];
    const on = (t, f) => { window.addEventListener(t, f); L.push([t, f]); };
const $=i=>document.getElementById(i), bn=n=>Number(n).toLocaleString('bn-BD');
const R=new THREE.WebGLRenderer({antialias:true});R.setPixelRatio(Math.min(devicePixelRatio,2));R.setSize(innerWidth,innerHeight);R.shadowMap.enabled=true;document.body.prepend(R.domElement);
const S=new THREE.Scene();S.fog=new THREE.Fog(0xffb27a,40,160);
const cam=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.1,400);
S.add(new THREE.HemisphereLight(0xffe0c0,0x1a4a5a,.8));
const sun=new THREE.DirectionalLight(0xfff0d0,1);sun.position.set(-30,40,-40);sun.castShadow=true;sun.shadow.camera.left=-20;sun.shadow.camera.right=20;sun.shadow.camera.top=20;sun.shadow.camera.bottom=-20;S.add(sun);
const sunBall=new THREE.Mesh(new THREE.SphereGeometry(8,24,24),new THREE.MeshBasicMaterial({color:0xfff2b0,fog:false}));sunBall.position.set(-60,25,-150);S.add(sunBall);
// water
const wg=new THREE.PlaneGeometry(400,400,70,70);wg.rotateX(-Math.PI/2);
const wp=wg.attributes.position,wx=[],wz=[];for(let i=0;i<wp.count;i++){wx.push(wp.getX(i));wz.push(wp.getZ(i));}
const wmat=new THREE.ShaderMaterial({uniforms:{t:{value:0},fN:{value:40},fF:{value:160},sunDir:{value:new THREE.Vector3(-30,40,-40).normalize()},fogC:{value:new THREE.Color(0xffb27a)}},vertexShader:`varying vec3 vN,vW;void main(){vN=normal;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,fragmentShader:`uniform float t,fN,fF;uniform vec3 sunDir,fogC;varying vec3 vN,vW;void main(){vec3 n=normalize(vN+vec3(sin(vW.x*1.7+t*1.3)*.08+sin(vW.z*3.1+t*2.)*.05,0.,cos(vW.z*1.9+t*1.1)*.08+cos(vW.x*2.7-t*1.6)*.05));vec3 v=normalize(cameraPosition-vW);float f=pow(1.-max(dot(n,v),0.),3.);vec3 deep=vec3(.02,.2,.22),shal=vec3(.1,.38,.35),sky=vec3(1.,.72,.5);vec3 c=mix(mix(deep,shal,.35+.25*sin(vW.x*.2+vW.z*.15)),sky,f*.85);vec3 h=normalize(sunDir+v);c+=vec3(1.,.9,.6)*pow(max(dot(n,h),0.),180.)*2.;float d=length(vW-cameraPosition);c=mix(c,fogC,smoothstep(fN,fF,d));gl_FragColor=vec4(c,1.);}`});
const water=new THREE.Mesh(wg,wmat);S.add(water);
// sky dome + clouds
S.add(new THREE.Mesh(new THREE.SphereGeometry(300,24,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,vertexShader:`varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec3 p;void main(){float h=normalize(p).y;vec3 c=mix(vec3(1.,.7,.48),vec3(.25,.45,.75),smoothstep(0.,.55,h));gl_FragColor=vec4(c,1.);}`})));
const cmat=new THREE.MeshBasicMaterial({color:0xffe6d0,transparent:true,opacity:.7,fog:false,depthWrite:false});
const rnd=(a,b)=>a+Math.random()*(b-a);
for(let i=0;i<12;i++){const c=new THREE.Group();for(let k=0;k<5;k++){const s=new THREE.Mesh(new THREE.SphereGeometry(rnd(6,11),10,8),cmat);s.position.set(k*8-16,rnd(-1,2),rnd(-3,3));s.scale.y=.4;c.add(s)}const a=rnd(0,6.28);c.position.set(Math.sin(a)*rnd(120,220),rnd(45,90),Math.cos(a)*rnd(120,220));S.add(c)}
// river banks, trees, reeds
const grass=new THREE.MeshStandardMaterial({color:0x3f6b2a,roughness:1}),mud=new THREE.MeshStandardMaterial({color:0x6b5535,roughness:1}),trunkM=new THREE.MeshStandardMaterial({color:0x4a3320,roughness:1}),leafM=[0x2d5a27,0x3b7a30,0x24491f].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:1,flatShading:true})),reedM=new THREE.MeshStandardMaterial({color:0x8a9a3a,roughness:1});
const trG=new THREE.CylinderGeometry(.3,.45,4,6),lfG=new THREE.IcosahedronGeometry(2.8,0),rdG=new THREE.ConeGeometry(.08,1.6,4);
[-1,1].forEach(sd=>{const b=new THREE.Mesh(new THREE.BoxGeometry(120,3,420),grass);b.position.set(sd*122,.2,0);b.receiveShadow=true;S.add(b);const m=new THREE.Mesh(new THREE.BoxGeometry(6,.8,420),mud);m.position.set(sd*59.5,-.1,0);S.add(m);
 for(let i=0;i<55;i++){const s=rnd(.8,1.8),tr=new THREE.Group(),t1=new THREE.Mesh(trG,trunkM);t1.position.y=2;t1.castShadow=true;tr.add(t1);const l=new THREE.Mesh(lfG,leafM[i%3]);l.position.y=5.2;l.scale.set(1,1.2,1);l.castShadow=true;tr.add(l);tr.scale.setScalar(s);tr.position.set(sd*rnd(66,125),1.7,rnd(-200,200));S.add(tr)}
 for(let i=0;i<90;i++){const r=new THREE.Mesh(rdG,reedM);r.position.set(sd*rnd(57,62),.7,rnd(-200,200));r.rotation.z=rnd(-.2,.2);S.add(r)}});
// boat
const boat=new THREE.Group();S.add(boat);
const wood=new THREE.MeshPhongMaterial({color:0x8a5a2b}),wood2=new THREE.MeshPhongMaterial({color:0x5e3b19});
const bx=(w,h,d,x,y,z,m,p)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;(p||boat).add(o);return o};
const cv=document.createElement('canvas');cv.width=cv.height=256;const cx=cv.getContext('2d');cx.fillStyle='#8a5a2b';cx.fillRect(0,0,256,256);
for(let i=0;i<16;i++){cx.fillStyle=`hsl(28,${40+Math.random()*15}%,${28+Math.random()*12}%)`;cx.fillRect(0,i*16,256,15);for(let k=0;k<30;k++){cx.fillStyle='rgba(40,20,5,.15)';cx.fillRect(Math.random()*256,i*16+Math.random()*15,Math.random()*60,1)}cx.fillStyle='#2a1708';cx.fillRect(0,i*16+15,256,1.5)}
const wt=new THREE.CanvasTexture(cv);wt.wrapS=wt.wrapT=THREE.RepeatWrapping;
(function(){const N=28,M=14,pos=[],uv=[],idx=[],W=u=>1.25*(1-Math.pow(1-u,2.2)),Y=u=>.85+.55*Math.pow(1-u,3);
for(let i=0;i<=N;i++){const u=i/N,z=-3.4+u*6,w=W(u),yt=Y(u);for(let j=0;j<=M;j++){const s=j/M,p=Math.PI*s;pos.push(-w*Math.cos(p),yt-(yt+.15)*Math.pow(Math.sin(p),.8),z);uv.push(u*2,s)}}
for(let i=0;i<N;i++)for(let j=0;j<M;j++){const a=i*(M+1)+j,b=a+M+1;idx.push(a,b,a+1,b,b+1,a+1)}
const c=pos.length/3;pos.push(0,Y(1),2.6);uv.push(2,.5);for(let j=0;j<M;j++)idx.push(N*(M+1)+j,c,N*(M+1)+j+1);
const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
const h=new THREE.Mesh(g,new THREE.MeshStandardMaterial({map:wt,roughness:.7,side:THREE.DoubleSide}));h.castShadow=h.receiveShadow=true;boat.add(h);
[-1,1].forEach(sd=>{const pts=[];for(let i=1;i<=N;i++){const u=i/N;pts.push(new THREE.Vector3(sd*W(u),Y(u)+.02,-3.4+u*6))}boat.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),48,.05,8),wood2));
 const o=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,3.2,8),wood2);o.position.set(sd*1.5,.4,.6);o.rotation.z=sd*.7;const bl=new THREE.Mesh(new THREE.BoxGeometry(.28,.7,.04),wood);bl.position.y=-1.5;o.add(bl);o.castShadow=true;boat.add(o)});})();
bx(1.3,.06,3,0,.08,.9,wood);bx(1.7,.1,.4,0,.72,-.8,wood2);
bx(.5,.3,.4,-.6,.25,1.9,wood);const rope=new THREE.Mesh(new THREE.TorusGeometry(.2,.05,8,16),new THREE.MeshStandardMaterial({color:0xcfb98a}));rope.rotation.x=Math.PI/2;rope.position.set(.55,.16,1.9);boat.add(rope);
const lan=new THREE.Mesh(new THREE.SphereGeometry(.12,12,12),new THREE.MeshBasicMaterial({color:0xffcc77}));lan.position.set(0,1.65,-3.2);boat.add(lan);bx(.04,.3,.04,0,1.45,-3.2,wood2);const ll=new THREE.PointLight(0xffaa55,.9,12);ll.position.set(0,1.7,-3.1);boat.add(ll);
const bow=new THREE.Mesh(new THREE.ConeGeometry(1.25,2.2,4),wood);bow.rotation.set(-Math.PI/2,0,Math.PI/4);bow.scale.set(.92,1,.55);bow.position.set(0,.45,-3.5);bow.castShadow=true;
bx(2,.12,.5,0,.75,.6,wood2);
// rod
const rod=bx(.06,.06,3,.9,1.6,-1.4,wood2);rod.rotation.x=.55;
const line=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,3,4),new THREE.MeshBasicMaterial({color:0xffffff}));line.position.set(.9,.2,-3);boat.add(line);
// fisherman
const man=new THREE.Group();man.position.set(0,.9,.6);boat.add(man);
const skin=new THREE.MeshPhongMaterial({color:0xe0a070});
const body=new THREE.Mesh(new THREE.CylinderGeometry(.34,.4,.95,16),new THREE.MeshPhongMaterial({color:0xd84343}));body.position.y=.5;body.castShadow=true;man.add(body);
const head=new THREE.Mesh(new THREE.SphereGeometry(.28,20,20),skin);head.position.y=1.2;head.castShadow=true;man.add(head);
const cap=new THREE.Mesh(new THREE.SphereGeometry(.3,20,12,0,Math.PI*2,0,Math.PI/2),new THREE.MeshPhongMaterial({color:0x1d3557}));cap.position.y=1.26;man.add(cap);
const brim=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.04,16),new THREE.MeshPhongMaterial({color:0x1d3557}));brim.position.set(0,1.27,-.18);brim.scale.set(1,1,.6);man.add(brim);
[-.1,.1].forEach(x=>{const e=new THREE.Mesh(new THREE.SphereGeometry(.035,8,8),new THREE.MeshBasicMaterial({color:0x111111}));e.position.set(x,1.22,-.26);man.add(e)});
const armL=bx(.14,.14,.6,-.3,.8,-.1,skin,man);
const arm=bx(.14,.14,.75,.28,.95,-.4,skin,man);
const gun=new THREE.Group();gun.position.set(.28,1.0,-.85);man.add(gun);
bx(.08,.12,.4,0,0,0,new THREE.MeshPhongMaterial({color:0x222222,shininess:80}),gun);bx(.08,.22,.1,0,-.14,.12,new THREE.MeshPhongMaterial({color:0x111111}),gun);
const muzzle=new THREE.Object3D();muzzle.position.set(0,0,-.25);gun.add(muzzle);
const flash=new THREE.PointLight(0xffaa44,0,12);muzzle.add(flash);
// crocodile
const crocs=[];
const skinTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle='#2f5a26';x.fillRect(0,0,128,128);for(let r=0;r<12;r++)for(let q=0;q<12;q++){x.fillStyle=`hsl(${95+Math.random()*25},${35+Math.random()*15}%,${20+Math.random()*12}%)`;x.beginPath();x.ellipse(q*11+(r%2?5:0),r*11,6,6,0,0,7);x.fill();x.strokeStyle='rgba(0,0,0,.35)';x.stroke()}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,2);return t})();
const sp=[],spG=new THREE.SphereGeometry(.07,6,6);
function splash(p,n,col){for(let i=0;i<n;i++){const m=new THREE.Mesh(spG,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.9}));m.position.copy(p);m.userData.v=new THREE.Vector3(rnd(-1.5,1.5),rnd(2,5),rnd(-1.5,1.5));S.add(m);sp.push(m)}
 const r=new THREE.Mesh(new THREE.RingGeometry(.1,.25,24),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.7,side:THREE.DoubleSide,depthWrite:false}));r.rotation.x=-Math.PI/2;r.position.set(p.x,.1,p.z);r.userData.ring=1;S.add(r);sp.push(r)}
const foamC=document.createElement('canvas');foamC.width=128;foamC.height=192;const fx=foamC.getContext('2d');fx.shadowColor='#fff';fx.shadowBlur=14;fx.strokeStyle='rgba(255,255,255,.85)';fx.lineWidth=7;fx.beginPath();fx.ellipse(64,96,34,70,0,0,7);fx.stroke();
for(let i=0;i<120;i++){const a=Math.random()*6.28,r=1+Math.random()*.25;fx.fillStyle='rgba(255,255,255,'+Math.random()*.6+')';fx.beginPath();fx.arc(64+Math.cos(a)*34*r,96+Math.sin(a)*70*r,Math.random()*3+1,0,7);fx.fill()}
const foam=new THREE.Mesh(new THREE.PlaneGeometry(5.6,9),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(foamC),transparent:true,depthWrite:false}));foam.rotation.x=-Math.PI/2;foam.position.z=-.4;foam.renderOrder=2;S.add(foam);
const birds=[],bm=new THREE.MeshBasicMaterial({color:0x2a2a2a,side:THREE.DoubleSide}),bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.Float32BufferAttribute([0,0,.15,1.3,0,.1,0,0,-.25],3));
for(let i=0;i<7;i++){const b=new THREE.Group(),wr=new THREE.Mesh(bg,bm),wl=new THREE.Mesh(bg,bm);wl.scale.x=-1;b.add(wr,wl);b.userData={wr,wl,a:rnd(0,6.28),r:rnd(30,90),h:rnd(14,32),s:rnd(.08,.18),ph:rnd(0,6)};S.add(b);birds.push(b)}
function mkCroc(){
 const g=new THREE.Group(),mat=new THREE.MeshPhongMaterial({color:0xffffff,map:skinTex,bumpMap:skinTex,bumpScale:1.5,shininess:25}),dark=new THREE.MeshPhongMaterial({color:0x24451d});
 const add=(w,h,d,x,y,z,hd,m,p)=>{const o=bx(w,h,d,x,y,z,m||mat,p||g);o.userData.head=!!hd;return o};
 add(1.6,.65,3.6,0,0,0);add(1.1,.45,2,0,-.05,-2.6);add(.7,.35,2,0,-.1,-4.4);add(.35,.25,1.6,0,-.12,-5.9);
 for(let i=0;i<7;i++){const s=new THREE.Mesh(new THREE.ConeGeometry(.12,.28,5),dark);s.position.set(0,.4,1.4-i*.9);g.add(s)}
 add(1.05,.38,2,0,.05,2.8,true);
 const jaw=new THREE.Group();jaw.position.set(0,-.12,1.85);g.add(jaw);add(.95,.2,1.9,0,0,.95,true,mat,jaw);
 [-.4,.4].forEach(x=>{const e=new THREE.Mesh(new THREE.SphereGeometry(.12,10,10),new THREE.MeshPhongMaterial({color:0xffe14d,emissive:0x665500}));e.position.set(x,.33,2.1);e.userData.head=true;g.add(e)});
 for(let i=0;i<5;i++)[-1,1].forEach(s=>{const t=new THREE.Mesh(new THREE.ConeGeometry(.04,.14,4),new THREE.MeshBasicMaterial({color:0xffffff}));t.rotation.x=Math.PI;t.position.set(s*.42,-.05,2.2+i*.35);g.add(t)});
 const a=Math.random()*Math.PI*2,r=48;g.position.set(Math.sin(a)*r,0,Math.cos(a)*r);
 const c={g,jaw,mat,hp:6,dead:false,cd:0,seed:Math.random()*9,sp:3.2+Math.random()*1.5+lvl*.35};g.userData.croc=c;S.add(g);crocs.push(c);
}
// state
let score=0,lvl=1,hp=100,playing=false,yaw=0,pitch=.25,t=0,lastShot=0,fishT=0,tracer=null,shake=0;
const ray=new THREE.Raycaster(),mid=new THREE.Vector2(0,0);
function toast(s){const e=$('toast');e.textContent=s;e.style.opacity=1;clearTimeout(toast.h);toast.h=setTimeout(()=>e.style.opacity=0,1100)}
let ac;function snd(f,d,type){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),g=ac.createGain();o.type=type||'square';o.frequency.setValueAtTime(f,ac.currentTime);o.frequency.exponentialRampToValueAtTime(40,ac.currentTime+d);g.gain.setValueAtTime(.2,ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+d);o.connect(g).connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch(e){}}
function shoot(){
 if(!playing||t-lastShot<.35)return;lastShot=t;snd(300,.18,'sawtooth');flash.intensity=6;shake=.25;
 ray.setFromCamera(mid,cam);const hits=ray.intersectObjects(crocs.filter(c=>!c.dead).map(c=>c.g),true);
 let p=new THREE.Vector3();if(hits.length){p.copy(hits[0].point);let o=hits[0].object;while(o&&!o.userData.croc)o=o.parent;const c=o&&o.userData.croc;
  if(c){const hs=hits[0].object.userData.head,dmg=hs?2:1;c.hp-=dmg;splash(hits[0].point,12,0xcfeff5);c.mat.emissive.setHex(0xaa0000);setTimeout(()=>c.mat.emissive.setHex(0),120);score+=hs?20:10;toast(hs?'🎯 হেডশট! +২০':'💥 লেগেছে! +১০');snd(120,.2,'triangle');
   if(c.hp<=0){c.dead=true;score+=100*lvl;toast('🐊 কুমির শেষ! +'+bn(100*lvl))}}
 }else{const q=ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),0),new THREE.Vector3());if(q&&q.distanceTo(cam.position)<90){p.copy(q);splash(p,14,0xdff6ff)}else ray.ray.at(80,p)}
 const mp=new THREE.Vector3();muzzle.getWorldPosition(mp);
 if(tracer)S.remove(tracer);tracer=new THREE.Line(new THREE.BufferGeometry().setFromPoints([mp,p]),new THREE.LineBasicMaterial({color:0xffe08a}));S.add(tracer);setTimeout(()=>{if(tracer){S.remove(tracer);tracer=null}},70);
 lvl=1+Math.floor(score/400);$('sc').textContent=bn(score);$('lv').textContent=bn(lvl);
}
function reset(){crocs.forEach(c=>S.remove(c.g));crocs.length=0;score=0;lvl=1;hp=100;$('sc').textContent=bn(0);$('lv').textContent=bn(1);$('hp').style.width='100%';playing=true;$('msg').style.display='none';t=0;lastShot=-1;fishT=0}
$('go').onclick=()=>{reset();snd(400,.1)};
// input
let drag=null;
R.domElement.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,t:performance.now()}});
on('pointermove',e=>{if(!drag)return;yaw-=(e.clientX-drag.x)*.006;pitch=Math.max(-.05,Math.min(.7,pitch+(e.clientY-drag.y)*.004));drag.x=e.clientX;drag.y=e.clientY});
on('pointerup',e=>{if(drag&&Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)<8&&performance.now()-drag.t<300)shoot();drag=null});
$('fire').addEventListener('pointerdown',e=>{e.stopPropagation();shoot()});
on('keydown',e=>{if(e.code==='Space'){e.preventDefault();shoot()}if(e.code==='ArrowLeft')yaw+=.1;if(e.code==='ArrowRight')yaw-=.1});
on('resize',()=>{R.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()});
// loop
// fish, rain, music
const fishes=[],fG=new THREE.SphereGeometry(.3,10,8),fM=new THREE.MeshStandardMaterial({color:0xc9d6df,metalness:.6,roughness:.3}),tG=new THREE.ConeGeometry(.15,.3,4);let fishSp=2,lt=0,rain=false,mus=null,rainSrc=null;
const RN=1400,rp=new Float32Array(RN*6);for(let i=0;i<RN;i++){const x=rnd(-35,35),y=rnd(0,30),z=rnd(-35,35);rp.set([x,y,z,x-.15,y-1.2,z],i*6)}
const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.BufferAttribute(rp,3));
const rainL=new THREE.LineSegments(rg,new THREE.LineBasicMaterial({color:0xcfe3ee,transparent:true,opacity:.45}));rainL.visible=false;rainL.frustumCulled=false;S.add(rainL);
const skyD=S.children.find(o=>o.geometry&&o.geometry.type==='SphereGeometry'&&o.geometry.parameters.radius===300),skyO=skyD.material,rainSky=new THREE.MeshBasicMaterial({color:0x8d99a1,side:THREE.BackSide,fog:false,depthWrite:false});
function setRain(on){rain=on;const c=on?0x8d99a1:0xffb27a;S.fog.color.setHex(c);S.fog.near=on?8:40;S.fog.far=on?95:160;wmat.uniforms.fogC.value.setHex(c);wmat.uniforms.fN.value=on?8:40;wmat.uniforms.fF.value=on?95:160;skyD.material=on?rainSky:skyO;cmat.color.setHex(on?0x8f9aa0:0xffe6d0);sun.intensity=on?.35:1;sunBall.visible=!on;rainL.visible=on;$('bR').style.opacity=on?1:.6}
function rainSnd(on){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(on&&!rainSrc){const b=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const s=ac.createBufferSource();s.buffer=b;s.loop=true;const f=ac.createBiquadFilter();f.type='highpass';f.frequency.value=1500;const g=ac.createGain();g.gain.value=.05;s.connect(f).connect(g).connect(ac.destination);s.start();rainSrc=s}else if(!on&&rainSrc){rainSrc.stop();rainSrc=null}}catch(e){}}
function toggleMusic(){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(mus){clearInterval(mus);mus=null;$('bM').style.opacity=.6;return}$('bM').style.opacity=1;const sc=[261.6,293.7,329.6,392,440,523.3];const note=()=>{try{const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.value=sc[Math.floor(Math.random()*sc.length)]/(Math.random()<.4?2:1);g.gain.setValueAtTime(0,ac.currentTime);g.gain.linearRampToValueAtTime(.06,ac.currentTime+.4);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+3);o.connect(g).connect(ac.destination);o.start();o.stop(ac.currentTime+3.1)}catch(e){}};note();mus=setInterval(note,900)}catch(e){}}
$('bR').onclick=()=>{setRain(!rain);rainSnd(rain)};$('bM').onclick=toggleMusic;
const clock=new THREE.Clock();
function loop(){raf=requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.05);
 const T=performance.now()/1000;
 for(let i=0;i<wp.count;i++)wp.setY(i,Math.sin(wx[i]*.12+T*1.2)*.28+Math.cos(wz[i]*.16+T*1.5)*.22);wp.needsUpdate=true;wg.computeVertexNormals();
 wmat.uniforms.t.value=T;const wv=Math.sin(T*1.2)*.28+Math.cos(T*1.5)*.22;boat.position.y=wv*.8-.2;foam.position.y=wv+.14;foam.material.opacity=.6+.2*Math.sin(T*3);boat.rotation.z=Math.sin(T*1.1)*.03;boat.rotation.x=Math.cos(T*1.3)*.02;
 man.rotation.y=yaw;flash.intensity*=.7;
 if(playing){t+=dt;
  const want=Math.min(1+Math.floor(score/500),3);if(crocs.filter(c=>!c.dead).length<want&&Math.random()<dt*.8)mkCroc();
  fishT+=dt;if(fishT>8){fishT=0;score+=5;$('sc').textContent=bn(score);toast('🐟 মাছ ধরা পড়েছে! +৫')}
  for(let i=crocs.length-1;i>=0;i--){const c=crocs[i],g=c.g;
   if(c.dead){g.position.y-=dt*1.2;g.rotation.z+=dt*.8;if(g.position.y<-3){S.remove(g);crocs.splice(i,1)}continue}
   const dx=-g.position.x,dz=-g.position.z,d=Math.hypot(dx,dz);
   g.position.y=-.12+Math.sin(T*2+c.seed)*.07;g.lookAt(0,g.position.y,0);
   if(d>3.4){g.position.x+=dx/d*c.sp*dt;g.position.z+=dz/d*c.sp*dt}
   c.cd-=dt;let open=d<10?.35+.3*Math.sin(T*8):0;
   if(d<=3.6){open=.7*Math.abs(Math.sin(T*6));if(c.cd<=0){c.cd=1.4;hp-=18;shake=.6;snd(90,.3,'sawtooth');splash(new THREE.Vector3(g.position.x*.35,.3,g.position.z*.35),34,0xdff6ff);toast('😱 কুমির কামড় দিল!');$('hp').style.width=Math.max(0,hp)+'%';
     if(hp<=0){playing=false;$('msg').innerHTML='<h1>🌊 নৌকা ডুবে গেছে!</h1><p>আপনার স্কোর: <b>'+bn(score)+'</b> (লেভেল '+bn(lvl)+')</p><button class="p" id="go2">আবার খেলুন</button>';$('msg').style.display='flex';$('go2').onclick=reset}}}
   c.jaw.rotation.x=open}
 }
 for(let i=sp.length-1;i>=0;i--){const o=sp[i],m=o.material;if(o.userData.ring){o.scale.addScalar(dt*5);m.opacity-=dt*1.4}else{o.userData.v.y-=9.8*dt;o.position.addScaledVector(o.userData.v,dt);m.opacity-=dt*1.1}if(m.opacity<=0){S.remove(o);m.dispose();sp.splice(i,1)}}
 birds.forEach(b=>{const u=b.userData;u.a+=u.s*dt*.5;b.position.set(Math.sin(u.a)*u.r,u.h+Math.sin(T+u.ph),Math.cos(u.a)*u.r);b.rotation.y=u.a-Math.PI/2;const f=Math.sin(T*9+u.ph)*.6;u.wr.rotation.z=f;u.wl.rotation.z=-f});
 fishSp-=dt;if(fishSp<=0){fishSp=rnd(2.5,6);const a=rnd(0,6.28),r=rnd(9,26),f=new THREE.Group(),b=new THREE.Mesh(fG,fM);b.scale.set(.6,.6,1.6);const tl=new THREE.Mesh(tG,fM);tl.rotation.x=Math.PI/2;tl.position.z=-.55;f.add(b,tl);f.userData={t0:T,s:new THREE.Vector3(Math.sin(a)*r,0,Math.cos(a)*r),d:rnd(0,6.28)};S.add(f);fishes.push(f);splash(f.userData.s,8,0xffffff)}
 for(let i=fishes.length-1;i>=0;i--){const f=fishes[i],u=(T-f.userData.t0)/1.1,d=f.userData.d;if(u>=1){splash(f.position,10,0xffffff);S.remove(f);fishes.splice(i,1);continue}f.position.set(f.userData.s.x+Math.sin(d)*u*4,Math.sin(Math.PI*u)*2.2-.1,f.userData.s.z+Math.cos(d)*u*4);f.rotation.set(-Math.cos(Math.PI*u)*.9,d,0,'YXZ')}
 if(rain){for(let i=0;i<RN;i++){const k=i*6;rp[k+1]-=35*dt;rp[k+4]-=35*dt;if(rp[k+4]<0){rp[k+1]=30;rp[k+4]=28.8}}rg.attributes.position.needsUpdate=true;if(Math.random()<dt*.12){lt=.18;setTimeout(()=>snd(55,1.6,'sawtooth'),400)}lt-=dt;sun.intensity=lt>0?3:.35}
 shake*=.88;
 const dist=8,cy=2.2+pitch*9;
 cam.position.set(Math.sin(yaw)*dist+(Math.random()-.5)*shake*.3,cy+boat.position.y+(Math.random()-.5)*shake*.3,Math.cos(yaw)*dist);
 cam.lookAt(-Math.sin(yaw)*3,1.4,-Math.cos(yaw)*3);
 sun.target.position.copy(boat.position);sun.target.updateMatrixWorld();
 R.render(S,cam)}
loop();

    return () => {
      cancelAnimationFrame(raf);
      L.forEach(([t, f]) => window.removeEventListener(t, f));
      if (mus) clearInterval(mus);
      try { rainSrc && rainSrc.stop(); } catch (e) {}
      R.dispose();
      R.domElement.remove();
    };
  }, []);

  return (
    <>
      <div id="hud">
        <div>
          <div>⭐ পয়েন্ট: <span id="sc">০</span></div>
          <div style={{ fontSize: 13, opacity: 0.85 }}>লেভেল <span id="lv">১</span></div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div>🛶 নৌকা</div>
          <div className="bar"><div id="hp"></div></div>
        </div>
      </div>
      <div id="cross"></div>
      <div id="toast"></div>
      <button id="fire">🔫 গুলি</button>
      <div style={{ position: "fixed", left: 16, bottom: "calc(env(safe-area-inset-bottom,0px) + 26px)", display: "flex", gap: 10 }}>
        <button className="ic" id="bR">🌧️</button>
        <button className="ic" id="bM">🎵</button>
      </div>
      <div id="msg">
        <h1>🐊 কুমির শিকার</h1>
        <p>
          নৌকায় বসে মাছ ধরছেন, হঠাৎ কুমির আসছে! পিস্তল দিয়ে গুলি করে নৌকা বাঁচান।<br />
          মাথায় গুলি = ডাবল ক্ষতি।<br />
          <b>মোবাইল:</b> স্ক্রিন টেনে ঘুরুন, 🔫 বা ট্যাপ করে গুলি।<br />
          <b>পিসি:</b> মাউস টেনে ঘুরুন, ক্লিক/স্পেস চেপে গুলি।
        </p>
        <button className="p" id="go">খেলা শুরু</button>
      </div>
    </>
  );
}
