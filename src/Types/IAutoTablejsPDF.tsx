import jsPDF from "jspdf";
import { UserOptions } from "jspdf-autotable";

export type AutoTable = {
    (options: UserOptions): void;
    previous: {
        finalY: number;
    };
};
  
export type AutoTablejsPDF = jsPDF & {
autoTable: AutoTable;
};