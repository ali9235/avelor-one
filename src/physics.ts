/** SI units: W, J, kg, seconds, metres; temperatures in Celsius. Concept parameters, not measurements. */
export const defaults={mass:0.5, specificHeat:4186, ambient:22, lossCoefficient:0.35, heaterPower:35, heaterEfficiency:0.9, transmitterPower:60, peakEfficiency:0.82, batteryWh:18, chargeEfficiency:0.92, maxChargePower:12, idlePower:0.15, maxTemperature:65};
export type Parameters=typeof defaults;
export type State={temperature:number; batteryWh:number; elapsed:number; inputWh:number; heatWh:number; heating:boolean; fault:string; receivedPower:number; heaterPower:number; efficiency:number; batteryPower:number};
export type Input={x:number; z:number; gap:number; target:number; enabled:boolean; capOpen:boolean; waterMass:number; exploded:boolean};
export const initial=():State=>({temperature:24,batteryWh:11.16,elapsed:0,inputWh:0,heatWh:0,heating:false,fault:'',receivedPower:0,heaterPower:0,efficiency:0,batteryPower:0});
export function efficiency(x:number,z:number,gap:number,p=defaults){const r=Math.hypot(x,z);return r>=0.045||gap>0.012||gap<0?0:p.peakEfficiency*Math.exp(-Math.pow(r/0.025,2))*Math.exp(-gap/0.012);}
export function step(s:State,i:Input,dt:number,p:Parameters=defaults):State{
 if(!Number.isFinite(dt)||dt<=0)return s;
 if(dt>1){let result=s;for(let t=0;t<dt;t+=1)result=step(result,i,Math.min(1,dt-t),p);return result;}
 const fault=!Number.isFinite(s.temperature)?'Sensor fault':s.temperature>=p.maxTemperature?'Over-temperature':i.waterMass<0.05?'Low water':i.capOpen?'Cap open':i.exploded?'Inspection mode':'';
 const eta=i.exploded?0:efficiency(i.x,i.z,i.gap,p), received=p.transmitterPower*eta;
 const target=Math.min(60,Math.max(25,i.target));
 const heating=i.enabled&&!fault&&(s.heating?s.temperature<target:s.temperature<target-0.4);
 const available=received+Math.max(0,s.batteryWh)*3600/dt;
 const heater=heating?Math.min(p.heaterPower,Math.max(0,available-p.idlePower)):0;
 const net=received-heater-p.idlePower;
 const batteryPower=net>=0?Math.min(net,p.maxChargePower,(p.batteryWh-s.batteryWh)*3600/(dt*p.chargeEfficiency)):Math.max(net,-s.batteryWh*3600/dt);
 const batteryWh=Math.min(p.batteryWh,Math.max(0,s.batteryWh+batteryPower*dt/3600*(batteryPower>0?p.chargeEfficiency:1)));
 const heat=heater*p.heaterEfficiency;
 const temperature=Number.isFinite(s.temperature)?s.temperature+(heat-p.lossCoefficient*(s.temperature-p.ambient))*dt/(Math.max(0.05,i.waterMass)*p.specificHeat):p.ambient;
 return {temperature,batteryWh,elapsed:s.elapsed+dt,inputWh:s.inputWh+(eta>0?p.transmitterPower:0)*dt/3600,heatWh:s.heatWh+heat*dt/3600,heating:heater>0,fault,receivedPower:received,heaterPower:heater,efficiency:eta,batteryPower};
}
