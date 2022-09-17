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
  },
  actions: {
  },
  modules: {
  }
})


export interface State{
  daysOfData: number,
  data: Rows
}