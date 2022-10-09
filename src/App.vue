<template>
  <v-app>
    <v-main>
  <h3>Tarrif Type</h3>
  <select v-model=inputs.tarrif_type>
    <option value="tou">Time of use</option>
    <option value="single">Single</option>
  </select>
  <template v-if="tarrif_type=='tou'">
    <h3>Peak time start</h3>
    <input type="time" v-model=inputs.peak_start />
    <h3>Peak time end</h3>
    <input type="time" v-model=inputs.peak_end />
    </template>
  <h3>Buy Rate</h3>
  <input type='numeric' v-model=buy_rate v-on:change=calculateCosts() />
  <h3>Buy Rate (Peak)</h3>
  <input type='numeric' v-model=buy_rate_peak v-on:change=calculateCosts() />
  <h3>Sell Rate</h3>
  <input type='numeric' v-model=sell_rate v-on:change=calculateCosts() />
  <h3>Battery Size (kwh)</h3>
  <input type='numeric' v-model=battery_size v-on:change=calculate() />
  <h3>Battery Efficiency (%) (charge and discharge)</h3>
  <input type='numeric' v-model=battery_efficiency v-on:change=calculate() />
  <h3>Battery Cost</h3>
  <input type='numeric' v-model=battery_price v-on:change=calculateCosts() />
  <h3>Data File</h3>
  <input ref="file" v-on:change=handleFileUpload() type="file" />

  <h3>Uploaded Data</h3>
  <p>
    Total Imported: <span v-html=data_import.toFixed(3) />kwh<br />
    Total Imported (Peak): <span v-html=data_import_peak.toFixed(3) />kwh<br />
    Total Exported: <span v-html=data_export.toFixed(3) />kwh<br />
    Total Bill (without daily supply charge): $<span v-html="data_cost.toFixed(2)" /><br />
    Days of data: <span v-html="data_days.toFixed(0)" /><br />
    Cost per Day: $<span v-html="(data_cost / data_days).toFixed(2)" />
  </p>

  <h3>Simulated Battery Data</h3>
  <p>
    Total Imported: <span v-html=battery_import.toFixed(3) />kwh<br />
    Total Imported (Peak): <span v-html=battery_import_peak.toFixed(3) />kwh<br />
    Total Exported: <span v-html=battery_export.toFixed(3) />kwh<br />
    Battery Charge: <span v-html=battery_charge.toFixed(3) />kwh<br />
    Battery Discharge: <span v-html=battery_discharge.toFixed(3) />kwh<br />
    Battery Cycles per year: <span v-html=battery_cycles.toFixed(0) /><br />
    Total Bill (without daily supply charge): $<span v-html="battery_cost.toFixed(2)" /><br />
    Cost per day: $<span v-html="(battery_cost / data_days).toFixed(2)" /><br />
    Battery Savings per day $<span v-html=battery_savings_per_day.toFixed(2) /><br />
    Battery payback time (years) <span v-html=battery_payback.toFixed(2) /><br />
  </p>
</v-main>
</v-app>
</template>

<script setup lang="ts">
  import { ref, computed, watch, reactive, watchEffect  } from 'vue';
  import { parseFile } from './util/parseFile'
  import { useStore } from '@/store';

  const store = useStore();

  console.log(store);

  let tarrif_type = ref('tou');
  let peak_start = ref("15:00");
  let peak_end = ref("21:00");
let buy_rate = ref(0.19);
let buy_rate_peak = ref(0.40);
let sell_rate = ref(0.052);
let battery_size = ref(13.5);
let battery_efficiency = ref(95);
let battery_price = ref(7000);
const file = ref(null)

let data_import = ref(0);
let data_import_peak = ref(0);
let data_export = ref(0);
let data_cost = ref(0);
let data_days = ref(0);

let battery_import = ref(0);
let battery_import_peak = ref(0);
let battery_export = ref(0);
let battery_discharge = ref(0);
let battery_charge = ref(0);
let battery_cycles = ref(0);
let battery_cost = ref(0);
let battery_savings_per_day = ref(0);
let battery_payback = ref(0);

let goodData = {};
let inputs = reactive(store.getters['getInputs']);

const handleFileUpload = () => {
  if(!file.value || Array.isArray(file.value.files)){
    return false;
  }
  let data = file.value.files[0];
  parseFile(data);
  calculate();
}

watch(inputs, (newInput, oldInput) => {
  store.commit('setInputs', newInput);
});

  const calculate = () => {
    let battery_soc = 0;
    data_import.value = 0;
    data_import_peak.value = 0;
    data_export.value = 0;
    battery_import.value = 0;
    battery_export.value = 0;
    battery_discharge.value = 0;
    battery_charge.value = 0;
    battery_cycles.value = 0;
    let efficiency = battery_efficiency.value / 100;

    for(let rowKey in goodData){
      let row = goodData[rowKey];
      let peak = isPeak(rowKey);
      if(peak){
        data_import_peak.value +=  row.import;
      } else {
        data_import.value +=  row.import;
      }
      
      data_export.value +=  row.export;

      if(battery_soc === 0){
        battery_import.value += row.import;
      } else if(battery_soc >= row.import / efficiency){
        //Battery has enough capacity
        let amount_to_discharge = row.import / efficiency;
        battery_soc -= amount_to_discharge;
        battery_discharge.value += amount_to_discharge;
      } else {
        //Flatten battery, and import more
        let amount_to_discharge = battery_soc / efficiency
        battery_discharge.value += amount_to_discharge;
        if(peak){
          battery_import_peak.value += row.import - (amount_to_discharge * efficiency);
        } else {
          battery_import.value  += row.import - (amount_to_discharge * efficiency);
        }
        battery_soc = 0;
      }

      if(row.export === 0){
        //Nothing needs to happen, no charge to put in battery, or to export
      } else if(battery_soc + row.export * efficiency <= battery_size.value){
        //Battery takes all the charge
        let amount_to_charge = row.export * efficiency;
        battery_soc += amount_to_charge;
        battery_charge.value += amount_to_charge;
      } else {
        let amount_to_charge = (battery_size.value - battery_soc) * efficiency
        battery_soc = battery_size.value;
        battery_charge.value += amount_to_charge;
        battery_export.value += row.export - ( amount_to_charge / efficiency );
      }
    
      
    }
    battery_cycles.value = (battery_charge.value / battery_size.value) / data_days.value * 365.25;
    calculateCosts();
  }

  const calculateCosts = () => {
    let cost = 0;
    cost += data_import.value * buy_rate.value;
    cost += data_import_peak.value * buy_rate_peak.value;
    cost -= data_export.value * sell_rate.value;

    data_cost.value = cost;

    cost = 0;
    cost += battery_import.value * buy_rate.value;
    cost -= battery_export.value * sell_rate.value;
    battery_cost.value = cost;

    battery_savings_per_day.value = (data_cost.value - battery_cost.value) / data_days.value;
    battery_payback.value = (battery_price.value / battery_savings_per_day.value) / 365.25
  }

 

  const isPeak = (key: string) => {
    let current_time = key.substr(9);
    if(tarrif_type.value === 'tou'){
      if(current_time >= peak_start.value && current_time <= peak_end.value){
        return true;
      }
    }
    return false;
  }

</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
