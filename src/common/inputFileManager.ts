export default  class InputFileManager {
    private columns_count: 3
    private fileString:string;
    private collisionObjects: number[][];
    public constructor(fileName: string = 'inputFile')
    {
        var fs = require('fs');                                 /*require file system API module */
        if(!fileName.endsWith('.txt'))                          /*check if file name is not terminated by .txt and add it */
        {
            fileName += '.txt';
        }
        this.fileString =  fs.readFileSync(fileName, 'utf8');    /*read the file in a string*/
        this.collisionObjects = [];
    }
    public getInputsIn2DArr():number[][]
    {
        var rowsArr  = this.fileString.split("\n");              /*Splits the file string into array of strings. Each string contains a row*/
        let row_counter = 0;
        rowsArr.forEach( row =>
        {
            this.collisionObjects[row_counter] = [];
            var col = row.split(" ");                             /*Splits the row string into array of strings. Each string contains a number*/
            let col_counter = 0;
            col.forEach( col => 
            {
                this.collisionObjects[row_counter][col_counter] = Number(col);
                col_counter++;
            })
            row_counter++;
        });
        return this.collisionObjects;
    }
}

/*Exampe for how to use the class */
// var x = new InputFileManager('inputFile');
// var y = x.getInputsIn2DArr();
// console.log(y);