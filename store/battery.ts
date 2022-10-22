import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AppState } from "./store";
import { HYDRATE } from 'next-redux-wrapper';
import parseData from "../src/calculate/parseData";
import calculateCosts from "../src/calculate/calculateCosts";

export interface Battery{
    inputs: Inputs,
    data: Rows,
    result: Result
}

const initialState: Battery = {
    inputs: {
        tarrif: 'tou',
        peak_start: '15:00',
        peak_end: '21:00',
        buy_rate: 0.18975,
        buy_rate_peak: 0.3861,
        sell_rate: 0.052,
        battery_size: 13.5,
        battery_efficiency: 95,
        battery_cost: 14000,
        daily_cost: 1.20846,
    },
    data: {},
    result: {
        days_of_data: 0,

        total_imported: 0,
        total_imported_peak: 0,
        total_exported: 0,
        total_cost: 0,

        battery_imported: 0,
        battery_imported_peak: 0,
        battery_exported: 0,
        battery_charge: 0,
        battery_discharge: 0,
        battery_cost: 0,
        battery_cycles: 0,
    }
}

export const batterySlice = createSlice({
    name: "battery",
    initialState,
    reducers: {
        setInputs(state, action: PayloadAction<Inputs>){
            state.inputs = action.payload;
        },
        setData(state, action: PayloadAction<Rows>){
            state.data = action.payload
            state.result = parseData(state.data, state.inputs);
            state.result = calculateCosts(state.result, state.inputs);
        },
        recalculate(state){
            state.result = parseData(state.data, state.inputs);
            state.result = calculateCosts(state.result, state.inputs);
        },
        recalculateCosts(state){
            state.result = calculateCosts(state.result, state.inputs);
        },
    },
    extraReducers: {
        [HYDRATE]: (state, action) => {
          return {
            ...state,
          };
        },
    }
});

export interface Inputs{
    tarrif: tarrifs,
    peak_start: string,
    peak_end: string,
    buy_rate: number;
    buy_rate_peak: number,
    sell_rate: number,
    battery_size: number,
    battery_efficiency: number,
    battery_cost: number,
    daily_cost: number,
}

export interface Result{
    days_of_data: number,

    total_imported: number,
    total_imported_peak: number,
    total_exported: number,
    total_cost: number,

    battery_imported: number,
    battery_imported_peak: number,
    battery_exported: number,
    battery_charge: number,
    battery_discharge: number,
    battery_cost: number,
    battery_cycles: number,
}

export type tarrifs = 'single' | 'tou';

export class Row{
    import = 0;
    export = 0;
  }

export interface Rows{
    [key: string]: Row;
}

export const { setInputs, setData, recalculate, recalculateCosts } = batterySlice.actions;
export const selectInputState = (state: AppState) => state.battery.inputs;
export const selectResultState = (state: AppState) => state.battery.result;
export const selectBatteryState = (state: AppState) => state.battery;
export default batterySlice.reducer;

