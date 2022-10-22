import { parseAusNet } from "./ausnet";
import { Rows } from '../../store/battery';
import { setData } from "../../store/battery";
import { useDispatch } from "react-redux";

export const parseFile = async (file: File): Promise<Rows> => {
    if (file.type !== "text/csv") {
        return {}; //Wrong Type
    }

    let data: Rows = {};
    const rawData = await readFileAsync(file);
    if(rawData === null || typeof rawData !== 'string'){
        return {};
        //TODO errors
    }
    let rows = rawData.split('\n');
    data = parseAusNet(rows);

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

        let date = j.substring(0, 8);
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
    return new Promise<string | ArrayBuffer | null>((resolve, reject) => {
      let reader = new FileReader();
  
      reader.onload = () => {
        resolve(reader.result);
      };
  
      reader.onerror = reject;
  
      reader.readAsText(file);
    })
  }