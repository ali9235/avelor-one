import {describe,it,expect} from 'vitest';
import {initial,step,type Input} from './physics';
import {chargingIndicator} from './charging';
const dock:Input={x:0,z:0,gap:.003,target:45,enabled:false,capOpen:false,waterMass:.5,exploded:false};
describe('charging indicator follows the energy model',()=>{
 it('becomes green when a docked battery receives energy',()=>{const state=step(initial(),dock,1);expect(state.batteryPower).toBeGreaterThan(0);expect(chargingIndicator(state).mode).toBe('charging');});
 it('disconnects without implying a fault when removed',()=>{expect(chargingIndicator(step(initial(),{...dock,x:.1},1)).mode).toBe('idle');});
 it('prioritises a real interlock over a charging reading',()=>{const state=step(initial(),{...dock,capOpen:true},1);expect(state.receivedPower).toBeGreaterThan(0);expect(chargingIndicator(state)).toMatchObject({mode:'warning',color:'#edc76c'});});
 it('warns about weak coupling rather than inventing a hardware fault',()=>{expect(chargingIndicator(step(initial(),{...dock,x:.03},1)).label).toContain('Weak alignment');});
 it('treats inspection as an intentional disconnect',()=>{expect(chargingIndicator(step(initial(),{...dock,exploded:true},1)).mode).toBe('idle');});
 it('distinguishes a full battery from active battery charging',()=>{const state=step({...initial(),batteryWh:18},dock,1);expect(chargingIndicator(state).mode).toBe('powered');});
});
