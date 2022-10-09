import { parseAusNet } from "./ausnet";

export const parseFile = (file: File) => {
    if(file.type !== "text/csv"){
        return; //Wrong Type
      }
      const reader = new FileReader();
      reader.readAsText(file);
      reader.addEventListener("load", () => {
        if(!reader || !reader.result || typeof reader.result !== "string"){
            return false;
        }
        const rows = reader.result.split("\n");
        parseAusNet(rows);

        //TODO Update in store
      })
}