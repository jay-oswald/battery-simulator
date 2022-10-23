import { Row, Rows } from '../../store/battery';

export const saPower = (rows: string[]): Rows => {

    const rawData: Rows = {};
    const validTypes = ["Consumption", "Feed In"];

    for(const i in rows){
      const rowData = rows[i]
      if(rowData.length !== 5){
        continue; //Not valid Line
      }
      if( ! validTypes.includes(rowData[3])){
        continue; //Header Line
      }

      let dateObject = new Date(rowData[1]);
      let key = dateObject.toISOString();

      if(!Object.prototype.hasOwnProperty.call(rawData, key)){
        rawData[key] = new Row;
      }

      switch(rowData[3]){
        case 'Consumption':
          rawData[key].import += parseFloat(rowData[4]);
          break;
        case 'Feed In':
          rawData[key].export += parseFloat(rowData[4]);
          break;
      }
    }

    return rawData;
}