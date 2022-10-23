import { Inputs, Result, Rows } from "../../store/battery";

export default (data: Rows, inputs: Inputs): Result => {
    const result: Result = {
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

    let battery_soc = 0;
    let efficiency = inputs.battery_efficiency / 100;
    let dates: any = {};

    for (let rowKey in data) {
        let row = data[rowKey];
        let peak = isPeak(rowKey, inputs);

        let date: string = rowKey.substring(0, 10);
        dates[date] = true;

        if (peak) {
            result.total_imported_peak += row.import;
        } else {
            result.total_imported += row.import;
        }

        result.total_exported += row.export;

        if (battery_soc === 0) {
            if (peak) {
                result.battery_imported_peak += row.import;
            } else {
                result.battery_imported += row.import;
            }
        } else if (battery_soc >= row.import / efficiency) {
            //Battery has enough capacity
            let amount_to_discharge = row.import / efficiency;
            battery_soc -= amount_to_discharge;
            result.battery_discharge += amount_to_discharge;
        } else {
            //Flatten battery, and import more
            let amount_to_discharge = battery_soc / efficiency
            result.battery_discharge += amount_to_discharge;
            if (peak) {
                result.battery_imported_peak += row.import - (amount_to_discharge * efficiency);
            } else {
                result.battery_imported += row.import - (amount_to_discharge * efficiency);
            }
            battery_soc = 0;
        }

        if (row.export === 0) {
            //Nothing needs to happen, no charge to put in battery, or to export
        } else if (battery_soc + row.export * efficiency <= inputs.battery_size) {
            //Battery takes all the charge
            let amount_to_charge = row.export * efficiency;
            battery_soc += amount_to_charge;
            result.battery_charge += amount_to_charge;
        } else {
            //Fill battery, export the rest
            let amount_to_charge = (inputs.battery_size - battery_soc) * efficiency
            battery_soc = inputs.battery_size;
            result.battery_charge += amount_to_charge;
            result.battery_exported += row.export - (amount_to_charge / efficiency);
        }


    }
    result.days_of_data = Object.keys(dates).length;
    result.battery_cycles = (result.battery_charge / inputs.battery_size) / result.days_of_data * 365.25;

    return result;
}

const isPeak = (key: string, inputs: Inputs) => {
    let current_time = key.substring(9);
    if (inputs.tarrif === 'tou') {
        if (current_time >= inputs.peak_start && current_time <= inputs.peak_end) {
            return true;
        }
    }
    return false;
}