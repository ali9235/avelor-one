import {describe,it,expect} from 'vitest';
import {defaults,efficiency,initial,step, type Input} from './physics';
const input:Input={x:0,z:0,gap:0.003,target:45,enabled:true,capOpen:false,waterMass:0.5,exploded:false};
describe('energy and safety',()=>{
 it('alignment and distance reduce transfer; off zone disconnects',()=>{expect(efficiency(0,0,0)).toBe(0.82);expect(efficiency(.02,0,.003)).toBeLessThan(efficiency(0,0,.003));expect(efficiency(.05,0,0)).toBe(0);expect(efficiency(0,0,.02)).toBe(0);});
 it('obeys mc delta T = heater energy without losses',()=>{const s=step(initial(),input,1,{...defaults,lossCoefficient:0});expect(s.temperature-24).toBeCloseTo(35*.9/(.5*4186),10);});
 it('cooling approaches ambient',()=>{const s=step({...initial(),temperature:40},{...input,enabled:false},3600);expect(s.temperature).toBeLessThan(40);expect(s.temperature).toBeGreaterThan(22);});
 it('charges without exceeding capacity',()=>{const s=step(initial(),{...input,enabled:false},10000);expect(s.batteryWh).toBe(18);});
 it('battery powers off-pad heating without negative energy',()=>{const s=step({...initial(),batteryWh:.001},{...input,x:.1},10);expect(s.batteryWh).toBe(0);expect(s.receivedPower).toBe(0);expect(s.heaterPower).toBe(0);});
 it.each([{capOpen:true},{waterMass:0.01},{exploded:true}])('interlock stops heater %o',override=>{const s=step(initial(),{...input,...override},1);expect(s.heaterPower).toBe(0);expect(s.fault).not.toBe('');});
 it('overheat and invalid sensor shut down',()=>{for(const temperature of [70,NaN])expect(step({...initial(),temperature},input,1).heaterPower).toBe(0);});
 it('regulates temperature near target',()=>{const s=step(initial(),input,5000);expect(s.temperature).toBeGreaterThan(44);expect(s.temperature).toBeLessThan(45.1);});
 it('partitioning time preserves integration',()=>{let s=initial();for(let n=0;n<60;n++)s=step(s,input,1);expect(step(initial(),input,60)).toEqual(s);});
});
