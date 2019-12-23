export default  class InputFileManager {
    private fileString:string;
    private collisionObjects: number[][];
    private distanceBetweenObstacles: number;
    public constructor(fs: string)
    {
        this.fileString = fs;
        this.collisionObjects = new Array();
        this.load2DArray();
    }
    private load2DArray()
    {
        let rowsArr  = this.fileString.split("\n");              /*Splits the file string into array of strings. Each string contains a row*/
        let row_counter = 0;
        this.distanceBetweenObstacles = Number(rowsArr[0]);
        if(this.distanceBetweenObstacles < 5 || this.distanceBetweenObstacles > 20)
        {
            this.distanceBetweenObstacles = 10; //default value
        }
        rowsArr.forEach( row =>
        {
            if(row != rowsArr[0])
            {
                this.collisionObjects[row_counter] = new Array();
                let col = row.split(" ");                              /*Splits the row string into array of strings. Each string contains a number*/
                let col_counter = 0;
                col.forEach( col => 
            {
                this.collisionObjects[row_counter][col_counter] = Number(col);
                col_counter++;
            })
            row_counter++;
            }
            
        });
    }

    public getArray():number[][]
    {
        return this.collisionObjects;
    }

    public shuffleArray()
    {
        var array = this.collisionObjects;
        for (var i = array.length - 1; i > 0; i--) 
				{
					var j = Math.floor(Math.random() * (i + 1));
					var temp = array[i];
					array[i] = array[j];
					array[j] = temp;
				}
    }
    public getObstaclesDistance():number
    {
        return this.distanceBetweenObstacles;
    }
    // public getObstaclesType1(): number[]
    // {
    //     let ObstaclesType1 = [];
    //     let mainArr = this.collisionObjects;
    //     let counter = 0;
    //     mainArr.forEach( row =>
    //         {
    //             if(row[0] == 1)                     //searching for obstacle type 1
    //                 ObstaclesType1[counter] = 0;    //if the ostacle is on the left
    //             else if(row[1] == 1)
    //                 ObstaclesType1[counter] = 1;    //if the ostacle is in the middle
    //             else if(row[2] == 1)
    //                 ObstaclesType1[counter] = 2;    //if the ostacle is on the right
    //             else 
    //                ObstaclesType1[counter] = -1;    //if the ostacle is not in this row
            
    //             counter++;
    //         }
    //     )
    //     return ObstaclesType1;
    // }

    // public getObstaclesType2(): number[]
    // {
    //     let ObstaclesType2 = [];
    //     let mainArr = this.collisionObjects;
    //     let counter = 0;
    //     mainArr.forEach( row =>
    //         {
    //             if(row[0] == 2)                     //searching for obstacle type 1
    //                 ObstaclesType2[counter] = 0;    //if the ostacle is on the left
    //             else if(row[1] == 2)
    //                 ObstaclesType2[counter] = 1;    //if the ostacle is in the middle
    //             else if(row[2] == 2)
    //                 ObstaclesType2[counter] = 2;    //if the ostacle is on the right
    //             else 
    //                ObstaclesType2[counter] = -1;    //if the ostacle is not in this row
                
    //             counter++;
    //         }
    //     )
    //     return ObstaclesType2;
    // }

    // public getObstaclesType3(): number[]
    // {
    //     let ObstaclesType3 = [];
    //     let mainArr = this.collisionObjects;
    //     let counter = 0;
    //     mainArr.forEach( row =>
    //         {
    //             if(row[0] == 3)                     //searching for obstacle type 1
    //                 ObstaclesType3[counter] = 0;    //if the ostacle is on the left
    //             else if(row[1] == 3)
    //                 ObstaclesType3[counter] = 1;    //if the ostacle is in the middle
    //             else if(row[2] == 3)
    //                 ObstaclesType3[counter] = 2;    //if the ostacle is on the right
    //             else 
    //                 ObstaclesType3[counter] = -1;    //if the ostacle is not in this row
    //                 counter++;
    //         }
    //     )
    //     return ObstaclesType3;
    // }
}