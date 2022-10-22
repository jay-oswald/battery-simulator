import { Inputs, Result } from "../../store/battery";

export default (result: Result, inputs: Inputs):Result => {

    result.total_cost = 0;
    result.total_cost += result.total_imported * inputs.buy_rate;
    result.total_cost += result.total_imported_peak * inputs.buy_rate_peak;
    result.total_cost -= result.total_exported * inputs.sell_rate;
    result.total_cost += result.days_of_data * inputs.daily_cost;


    result.battery_cost = 0;
    result.battery_cost += result.battery_imported * inputs.buy_rate;
    result.battery_cost += result.battery_imported_peak * inputs.buy_rate_peak;
    result.battery_cost -= result.battery_exported * inputs.sell_rate;
    result.battery_cost += result.days_of_data * inputs.daily_cost;

    return result;
}