import { Row, Rows } from '../../store/battery';

const getKey = (dateString: string, time : number) => {
  let date = new Date();
  date.setUTCFullYear(
    parseInt(dateString.substring(0,4)),
    parseInt(dateString.substring(4,6)) - 1,
    parseInt(dateString.substring(6,8))
    )
  
    time = (Number(time) - 2) / 2;
    date.setUTCHours(Math.floor(time), (time - Math.floor(time)) *  60, 0, 0);
    return date.toISOString();
  }

const isExportRow = (row: string[]) =>{
    const indexStart = 2;
    const indexEnd = 10;
    let i = indexStart;
    while(i <= indexEnd){ i++;
        if(row[i] !== '0'){
            return false;
        }
    }

    return true;
}

export const parsePowercor = (rows: string[][]): Rows => {

    const rawData: Rows = {};

    for(const r in rows){
      const rowData = rows[r];
      if(rowData[0] !== '300'){
        continue; //Header Line
      }
      let date = '';
      const isExport = isExportRow(rowData);

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

            if(isExport){
                rawData[key].export += Number(value);
            } else {
                rawData[key].import += Number(value);
            }
        }
      }
    }

    return rawData;
}