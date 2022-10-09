import { createStore, useStore as baseUseStore, Store } from 'vuex'
import { InjectionKey } from 'vue';
import { Rows } from '@/util/classes/Row';
import { inputs, tarrifs } from '@/util/classes/inputs';

export const key: InjectionKey<Store<State>> = Symbol()

export const useStore = () =>  {
  return baseUseStore(key)
}

export const store = createStore<State>({
  state: {
    daysOfData: 0,
    data: {},
    inputs: {
      tarrif: 'tou',
      peak_start: '15:00',
      peak_end: '21:00',
      buy_rate: 0.19,
      buy_rate_peak: 0.4,
      sell_rate: 0.052,
      battery_size: 13.5,
      battery_efficiency: 95,
      battery_cost: 12000,
    }
  },
  getters: {
    getInputs(state){
      return state.inputs;
    }
  },
  mutations: {
    setData(state, data: Rows){
      state.data = data;
    },
    setInputs(state, data: inputs){
      state.inputs = data;
    }
  },
  actions: {
    parseData(context){
      const data = context.state.data;
      const dates:string[] = [];
      Object.keys(data).forEach(key => {
        const date = key.split('-')[0];
        if(dates.includes(date)){
          return;
        }
        dates.push(date);
      });

      context.state.daysOfData = dates.length;
    }
  },
  modules: {
  }
})


export interface State{
  daysOfData: number,
  data: Rows,
  inputs: inputs,
}