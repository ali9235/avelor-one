import type {State} from './physics';

export type ChargingIndicator = {mode:'idle'|'charging'|'powered'|'warning';color:string;label:string;intensity:number};

/** Derived from simulation state only. Inspection is an intentional disconnect. */
export function chargingIndicator(state:State):ChargingIndicator {
 if(state.fault==='Inspection mode')return {mode:'idle',color:'#818681',label:'Inspection · power disconnected',intensity:0};
 if(state.fault)return {mode:'warning',color:'#edc76c',label:`Check system · ${state.fault}`,intensity:1.1};
 if(state.efficiency>0&&state.efficiency<0.30)return {mode:'warning',color:'#edc76c',label:'Weak alignment · centre the bottle',intensity:0.9};
 if(state.receivedPower>0)return state.batteryPower>0
  ?{mode:'charging',color:'#64dc87',label:'Charging · wireless power connected',intensity:0.95}
  :{mode:'powered',color:'#64dc87',label:'Wireless power connected',intensity:0.65};
 return {mode:'idle',color:'#818681',label:'Charging zone · place bottle here',intensity:0};
}
