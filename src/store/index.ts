import { createStore, useStore as baseUseStore, Store } from 'vuex'
import { InjectionKey } from 'vue';
import { Rows } from '@/util/classes/Row';

export const key: InjectionKey<Store<State>> = Symbol()

export const useStore = () =>  {
  return baseUseStore(key)
}

export const store = createStore<State>({
  state: {
    daysOfData: 0,
    data: {},
    
  },
  getters: {
  },
  mutations: {
    setData(state, data: Rows){
      state.data = data;
    },
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
  data: Rows
}