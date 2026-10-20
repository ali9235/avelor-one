import {Suspense,useEffect,useMemo,useRef,useState} from 'react';
import {Canvas,useFrame,type ThreeEvent} from '@react-three/fiber';
import {OrbitControls,Environment,Lightformer,Html,ContactShadows} from '@react-three/drei';
import * as THREE from 'three';
import type {State} from './physics';
import {chargingIndicator} from './charging';
export type SceneProps={state:State;position:[number,number];setPosition:(p:[number,number])=>void;cap:boolean;exploded:boolean;internal:boolean;target:number;setTarget:(n:number)=>void;enabled:boolean;setEnabled:(v:boolean)=>void;reduced:boolean};
function Cylinder({radius,height,y,color,metal=0.8,rough=.28}:{radius:number;height:number;y:number;color:string;metal?:number;rough?:number}){return <mesh position={[0,y,0]} castShadow receiveShadow><cylinderGeometry args={[radius,radius,height,96]}/><meshStandardMaterial color={color} metalness={metal} roughness={rough}/></mesh>}
function TouchDisplay({p,page,setPage}:{p:SceneProps;page:number;setPage:(n:number)=>void}){
 const surface=useRef<THREE.MeshBasicMaterial>(null!);
 useFrame((_,dt)=>{if(surface.current)surface.current.opacity=THREE.MathUtils.lerp(surface.current.opacity,1,p.reduced?1:1-Math.exp(-dt*3));});
 const canvas=useMemo(()=>{const c=document.createElement('canvas');c.width=512;c.height=512;return c;},[]);
 const texture=useMemo(()=>{const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;return t;},[canvas]);
 useEffect(()=>()=>texture.dispose(),[texture]);
 useEffect(()=>{const c=canvas.getContext('2d')!;c.clearRect(0,0,512,512);c.fillStyle='#050b10';c.beginPath();c.arc(256,256,254,0,Math.PI*2);c.fill();c.textAlign='center';c.fillStyle='#a8d5e5';c.font='20px Arial';c.fillText(p.state.efficiency>0?'ϟ CONNECTED':'AVELOR ONE',256,117);c.fillStyle='#f2f1ed';c.font='112px Arial';c.fillText(page===0?`${p.state.temperature.toFixed(0)}°`:page===1?`${Math.round(p.state.batteryWh/18*100)}%`:'✓',256,255);c.font='17px Arial';c.fillStyle='#a7bdc5';c.fillText(page===0?'WATER TEMPERATURE':page===1?`${p.state.receivedPower.toFixed(1)} W · WIRELESS`:p.state.fault||'SYSTEM NORMAL',256,295);c.font='28px Arial';c.fillText(page===0?`−       ${p.target}°       +`:page===1?p.enabled?'STOP HEATING':'START HEATING':'LIMIT 65°C',256,365);[0,1,2].forEach(n=>{c.fillStyle=n===page?'#d5edf4':'#455b66';c.beginPath();c.arc(230+n*26,411,5,0,Math.PI*2);c.fill();});texture.needsUpdate=true;},[p.state,p.target,p.enabled,page,texture,canvas]);
 useEffect(()=>{const c=canvas.getContext('2d')!;if(page===0&&p.enabled){c.font='14px Arial';c.fillStyle='#a8d5e5';c.fillText(`${Math.max(0,p.target-p.state.temperature).toFixed(1)}° TO TARGET`,256,449);texture.needsUpdate=true;}},[p.state,p.enabled,p.target,page,texture,canvas]);
 function touch(e:ThreeEvent<PointerEvent>){e.stopPropagation();if(!e.uv)return;const x=e.uv.x,y=1-e.uv.y;if(y>.75){setPage((page+1)%3);}else if(y>.61&&page===0){p.setTarget(Math.max(25,Math.min(60,p.target+(x<.5?-1:1))));}else if(y>.61&&page===1)p.setEnabled(!p.enabled);else setPage((page+1)%3);}
 return <mesh position={[0,1.9,.405]} onPointerDown={touch}><circleGeometry args={[.232,96]}/><meshBasicMaterial ref={surface} opacity={0} map={texture} transparent toneMapped={false}/></mesh>;
}
function ChargingZone({state,reduced}:{state:State;reduced:boolean}){
 const material=useRef<THREE.MeshStandardMaterial>(null!),halo=useRef<THREE.MeshBasicMaterial>(null!);
 const indicator=chargingIndicator(state);
 const target=useMemo(()=>new THREE.Color(indicator.color),[indicator.color]);
 const base=useMemo(()=>new THREE.Color(indicator.mode==='idle'?'#818681':'#0b100d'),[indicator.mode]);
 useFrame((_,dt)=>{
  const alpha=reduced?1:1-Math.exp(-Math.min(dt,.1)*4);
  material.current.color.lerp(base,alpha);
  material.current.emissive.lerp(target,alpha);
  material.current.emissiveIntensity=THREE.MathUtils.lerp(material.current.emissiveIntensity,indicator.intensity,alpha);
  halo.current.color.lerp(target,alpha);
  halo.current.opacity=THREE.MathUtils.lerp(halo.current.opacity,indicator.mode==='idle'?0:.12,alpha);
 });
 return <group>
  <mesh position={[0,.005,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.438,.452,128]}/><meshStandardMaterial ref={material} color="#818681" emissive="#818681" emissiveIntensity={0} toneMapped={false}/></mesh>
  <mesh position={[0,.004,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.42,.48,128]}/><meshBasicMaterial ref={halo} color="#818681" transparent opacity={0} depthWrite={false} toneMapped={false}/></mesh>
 </group>;
}
function Bottle(p:SceneProps & {dragging:(v:boolean)=>void}){
 const group=useRef<THREE.Group>(null!),cap=useRef<THREE.Group>(null!),core=useRef<THREE.Group>(null!),base=useRef<THREE.Group>(null!);
 const [page,setPage]=useState(0);const drag=useRef(false);const offset=useRef(new THREE.Vector3());
 const plane=useMemo(()=>new THREE.Plane(new THREE.Vector3(0,1,0),0),[]);
 const points=useMemo(()=>[[.333,.05],[.36,.055],[.372,.075],[.375,.12],[.375,2.22],[.37,2.28],[.342,2.34],[.325,2.35]].map(([x,y])=>new THREE.Vector2(x,y)),[]);
 useFrame((_,dt)=>{const a=p.reduced?1:1-Math.exp(-dt*8);group.current.position.y=THREE.MathUtils.lerp(group.current.position.y,p.exploded?.45:0,a);group.current.position.x=THREE.MathUtils.lerp(group.current.position.x,p.position[0]*10,a);group.current.position.z=THREE.MathUtils.lerp(group.current.position.z,p.position[1]*10,a);cap.current.position.y=THREE.MathUtils.lerp(cap.current.position.y,p.exploded?1.05:p.cap?.55:0,a);core.current.position.y=THREE.MathUtils.lerp(core.current.position.y,p.exploded?.3:0,a);base.current.position.y=THREE.MathUtils.lerp(base.current.position.y,p.exploded?-.25:0,a);});
 function down(e:ThreeEvent<PointerEvent>){e.stopPropagation();drag.current=true;p.dragging(true);const hit=e.ray.intersectPlane(plane,new THREE.Vector3());if(hit)offset.current.copy(group.current.position).sub(hit);(e.target as unknown as Element).setPointerCapture(e.pointerId);}
 function move(e:ThreeEvent<PointerEvent>){if(!drag.current)return;e.stopPropagation();const hit=e.ray.intersectPlane(plane,new THREE.Vector3());if(hit){hit.add(offset.current);p.setPosition([THREE.MathUtils.clamp(hit.x/10,-.16,.16),THREE.MathUtils.clamp(hit.z/10,-.1,.1)]);}}
 function up(e:ThreeEvent<PointerEvent>){drag.current=false;p.dragging(false);(e.target as unknown as Element).releasePointerCapture(e.pointerId);}
 return <group ref={group} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
  <group ref={core}>
   <Cylinder radius={.287} height={1.91} y={1.22} color="#8b9698" rough={.32}/>
   <mesh position={[0,1.22,.003]}><cylinderGeometry args={[.292,.292,1.86,96,1,true]}/><meshStandardMaterial color="#a7adb2" metalness={.94} roughness={.26} wireframe={p.internal}/></mesh>
   <Cylinder radius={.3} height={.055} y={.25} color="#555e63"/>
   <Cylinder radius={.28} height={.14} y={.14} color="#202a30"/>
   {p.internal&&<Html position={[.42,1.1,0]} distanceFactor={5}><span className="part-label">01 / TITANIUM VESSEL</span></Html>}
  </group>
  <mesh castShadow><latheGeometry args={[points,128]}/><meshPhysicalMaterial color="#7b8a8d" metalness={.12} roughness={.12} transparent opacity={p.internal?.13:.58} transmission={.35} thickness={.05} ior={1.48} clearcoat={1} side={THREE.DoubleSide} depthWrite={false}/></mesh>
  <group ref={cap}>
   <Cylinder radius={.331} height={.14} y={2.42} color="#171a1e" rough={.42} metal={.4}/>
   <Cylinder radius={.333} height={.015} y={2.343} color="#a7adb2"/>
   <Cylinder radius={.31} height={.012} y={2.497} color="#242a2c" rough={.5}/>
  </group>
  <group ref={base}>
   <Cylinder radius={.365} height={.065} y={.05} color="#171a1e"/>
   <mesh rotation={[Math.PI/2,0,0]} position={[0,.092,0]}><torusGeometry args={[.25,.012,10,80]}/><meshStandardMaterial color="#aa7352" metalness={.9} roughness={.3}/></mesh>
   {p.exploded&&<Html position={[.42,.05,0]} distanceFactor={5}><span className="part-label">02 / RECEIVER + POWER MODULE</span></Html>}
  </group>
  <group position={[0,1.9,.354]} rotation={[Math.PI/2,0,0]}>
   <mesh><cylinderGeometry args={[.249,.249,.035,96]}/><meshStandardMaterial color="#a7adb2" metalness={1} roughness={.24}/></mesh>
   <mesh position={[0,.023,0]}><cylinderGeometry args={[.232,.232,.012,96]}/><meshStandardMaterial color="#050b10" roughness={.2}/></mesh>
  </group>
  <TouchDisplay p={p} page={page} setPage={setPage}/>
  <Html transform position={[0,.49,.379]} distanceFactor={1}><div className="engraving">A V E L O R</div></Html>
 </group>;
}
function Rig({reduced,exploded}:{reduced:boolean;exploded:boolean}){const time=useRef(0);useEffect(()=>{time.current=0;},[exploded]);useFrame(({camera},dt)=>{if(time.current>=1.7)return;time.current+=dt;const target=exploded?new THREE.Vector3(3.4,3.1,6.4):new THREE.Vector3(2.5,2.25,4.5);camera.position.lerp(target,reduced?1:1-Math.exp(-dt*4));});return null;}
export function Scene(p:SceneProps){const [dragging,setDragging]=useState(false);return <Canvas shadows dpr={1} camera={{position:[3.1,2.5,5.3],fov:36}} gl={{antialias:true}}>
 <color attach="background" args={['#111719']}/><fog attach="fog" args={['#111719',9,19]}/>
 <ambientLight intensity={.5}/><spotLight position={[2,6,4]} angle={.5} penumbra={1} intensity={65} castShadow shadow-mapSize={[1024,1024]}/><directionalLight position={[-3,3,-2]} intensity={3} color="#a8d5e5"/>
 <Suspense fallback={null}><Environment resolution={128}><Lightformer form="rect" intensity={4} position={[-3,2,1]} scale={[2,5,1]} rotation={[0,Math.PI/2,0]}/><Lightformer form="rect" intensity={3} position={[2,3,0]} scale={[1,5,1]} rotation={[0,-Math.PI/2,0]}/><Lightformer intensity={1} position={[0,4,2]} scale={[5,1,1]}/></Environment></Suspense>
 <mesh receiveShadow position={[0,-.12,0]}><boxGeometry args={[7,.22,4]}/><meshStandardMaterial color="#454b49" metalness={.15} roughness={.65}/></mesh>
 <ChargingZone state={p.state} reduced={p.reduced}/>
 {p.internal&&[.16,.20,.24,.28,.32,.36].map(r=><mesh key={r} position={[0,.004,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[r,.008,8,80]}/><meshStandardMaterial color="#b07b56" metalness={.85} roughness={.3}/></mesh>)}
 <Bottle {...p} dragging={setDragging}/><ContactShadows frames={1} position={[0,.001,0]} opacity={.25} scale={8} blur={2.4} far={4} resolution={128}/>
 <OrbitControls enabled={!dragging} makeDefault target={[p.position[0]*10,p.exploded?1.8:1.15,p.position[1]*10]} minDistance={2.2} maxDistance={8} minPolarAngle={.35} maxPolarAngle={1.5} enablePan={false}/><Rig reduced={p.reduced} exploded={p.exploded}/>
 </Canvas>}
