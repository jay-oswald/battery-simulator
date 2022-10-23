import { parse } from 'csv-parse/sync';
import { parseAusNet } from "./ausnet";
import { Rows } from '../../store/battery';
import { saPower } from "./sapower";


export const parseFile = async (file: File): Promise<Rows> => {
    if (file.type !== "text/csv") {
        return {}; //Wrong Type
    }

    let data: Rows = {};
    const rawData = await readFileAsync(file);
    if(rawData === null || typeof rawData !== 'string' || rawData === ''){
        return {};
        //TODO errors
    }

    const rows = parse(rawData, {relax_column_count: true});
    if(rows[0].length === 5){
        data = saPower(rows);
    } else if(rows[0].length === 9) {
        data = parseAusNet(rows);
    }


    const keys = [];
    for (const k in data) {
        if (Object.prototype.hasOwnProperty.call(data, k)) {
            keys.push(k);
        }
    }

    let goodData: Rows = {};
    keys.sort();

    let any_export = false;
    let current_date = '';

    const len = keys.length;
    let j, i;
    for (i = 0; i < len; i++) {
        j = keys[i];
        let date = j.substring(0,10);

        if(date !== current_date && !any_export){
            //New Day, and never exported, wipe date before solar
            goodData = {};
        }
        current_date = date;
        if(!any_export){//We haven't had any export, check if we do now
            any_export = data[j].export !== 0;
        }

        //Redux dosen't like us storaging an instance of an Class
        goodData[j] = JSON.parse(JSON.stringify(data[j]));
    }
    return goodData;
}

function readFileAsync(file: File) {
    return new Promise<string>((resolve, reject) => {
      let reader = new FileReader();
  
      reader.onload = () => {
        if(typeof reader.result !== 'string'){
            return '';
        }
        resolve(reader.result);
      };
  
      reader.onerror = reject;
  
      reader.readAsText(file);
    })
  }