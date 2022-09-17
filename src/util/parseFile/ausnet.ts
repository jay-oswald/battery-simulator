import { Row, Rows } from '../classes/Row';

const getKey = (date: string, time : number) => {
    let time_string = '';

    time = (Number(time) - 2) / 2;
    time_string = Math.floor(time) + ":";
    if(time < 10){
      time_string = "0" + time;
    }
    if(time % 2 === 0){
      time_string += "00";
    } else {
      time_string += "30";
    }
    return date + '-' + time_string;
  }

export const parseAusNet = (rows: string[]): Rows => {

    const rawData: Rows = {};
    const goodData: Rows = {};


    for(const r in rows){
      const rowData = rows[r].split(",");
      if(rowData[0] === '200'){
        continue; //Header Line
      }
      let date = '';
      for(const i in rowData){
        if(Number(i) >= 50){
          continue;
        }
      let key = '';
      let value = 0;
        switch(i){
          case '0':
            break;
          case '1':
            date = rowData[i];
            break;
          default:
            key = getKey(date, Number(i));
            value = Number(rowData[i]);
            if(!Object.prototype.hasOwnProperty.call(rawData, key)){
              rawData[key] = new Row;
            }
            if(value > 0){
              rawData[key].import = Number(value);
            } else {
              //Exports are negative, we want positive
              if(value < 0){
                rawData[key].export = Number(value) * -1;
              }
            }
            
        }
      }
    }

    const keys = [];
    for(const k in rawData){
      if(Object.prototype.hasOwnProperty.call(rawData, k)){
        keys.push(k);
      }
    }

    keys.sort();
    const len = keys.length;
    let j, i;
    for( i = 0; i < len; i++){
      j = keys[i];
      goodData[j] = rawData[j];
    }

    return goodData;
}