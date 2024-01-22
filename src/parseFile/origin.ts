import { Row, Rows } from '../../store/battery';

const getKey = (dateString: string, time : number) => {
  let date = new Date();
  date.setUTCFullYear(
    parseInt(dateString.substring(0,4)),
    parseInt(dateString.substring(4,6)) - 1,
    parseInt(dateString.substring(6,8))
    )
  
    time = (Number(time) - 2) / 4;
    date.setUTCHours(Math.floor(time), (time - Math.floor(time)) *  60, 0, 0);
    return date.toISOString();
  }

export const parseOrigin = (rows: string[][]): Rows => {

    const rawData: Rows = {};


    for(const r in rows){
      const rowData = rows[r];
      if(rowData[0] !== '300'){
        continue; //Non-Data Line
      }
      let date = '';
      for(const i in rowData){
        if(Number(i) >= 98){
          continue;
        }
      let value = 0;

      let key = '';
      let isImport = Number(rowData[2]) > 0;
        switch(i){
          case '0':
            break;
          case '1':
            date = rowData[i];
            break;
          default:
            key = getKey(date, Number(i));
            value = Number(rowData[i]);
            if(isNaN(value)) break;
            if(!Object.prototype.hasOwnProperty.call(rawData, key)){
              rawData[key] = new Row;
            }
            if(isImport){
              rawData[key].import += Number(value);
            } else {
              rawData[key].export += Number(value);
            }
            
        }
      }
    }

    return rawData;
}