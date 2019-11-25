import { vec3, mat4 } from 'gl-matrix';
import ShaderProgram from './shader-program';
import Mesh from '../common/mesh';

export default class Road {

    roadMat : mat4;
    roadProgram : ShaderProgram;
    gl : WebGL2RenderingContext;
    roadTexture : WebGLTexture;
    roadMesh : Mesh;
    roadTimer : number = 0;
    deltaTime : number;

    constructor(VP : mat4 , RoadProgram : ShaderProgram , RoadTexutre : WebGLTexture , RoadMesh : Mesh , GL : WebGL2RenderingContext , DeltaTime : number)
    {
        this.roadMat = mat4.clone(VP);
        mat4.rotateY(this.roadMat,this.roadMat, -90 * Math.PI / 180)
        mat4.scale(this.roadMat, this.roadMat, [3, 1, 3]);
        this.roadProgram = RoadProgram ;
        this.roadTexture = RoadTexutre;
        this.roadMesh = RoadMesh;
        this.gl = GL;
        this.deltaTime = DeltaTime;
    }


    public drawRoad(numOfPlanes : number)
    {
        //************  Here we draw 5 planes as a start  ************//

        this.roadProgram.use();

        // Start of first plane //
        this.roadProgram.setUniformMatrix4fv("MVP", false, this.roadMat);
        this.roadProgram.setUniform4f("tint", [1, 1, 1, 1]);

        //this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.roadTexture);
        this.roadProgram.setUniform1i('texture_sampler', 0);

        this.roadMesh.draw(this.gl.TRIANGLES);

        // Start of second plane //
        mat4.translate(this.roadMat , this.roadMat , [2,0,0]);                     // increment x by 2 (distance between 2 planes)

        this.roadProgram.setUniformMatrix4fv("MVP", false, this.roadMat);
        this.roadProgram.setUniform4f("tint", [1, 1, 1, 1]);

        //this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.roadTexture);
        this.roadProgram.setUniform1i('texture_sampler', 0);

        this.roadMesh.draw(this.gl.TRIANGLES);

        // Start of third plane //
        mat4.translate(this.roadMat , this.roadMat , [2,0,0]);                     // increment x by 2 (distance between 2 planes)

        this.roadProgram.setUniformMatrix4fv("MVP", false, this.roadMat);
        this.roadProgram.setUniform4f("tint", [1, 1, 1, 1]);

        //this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.roadTexture);
        this.roadProgram.setUniform1i('texture_sampler', 0);

        this.roadMesh.draw(this.gl.TRIANGLES);

        // Start of forth plane //
        mat4.translate(this.roadMat , this.roadMat , [2,0,0]);                     // increment x by 2 (distance between 2 planes)

        this.roadProgram.setUniformMatrix4fv("MVP", false, this.roadMat);
        this.roadProgram.setUniform4f("tint", [1, 1, 1, 1]);

        //this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.roadTexture);
        this.roadProgram.setUniform1i('texture_sampler', 0);

        this.roadMesh.draw(this.gl.TRIANGLES);

        // Start of fifth plane //
        mat4.translate(this.roadMat , this.roadMat , [2,0,0]);                     // increment x by 2 (distance between 2 planes)

        this.roadProgram.setUniformMatrix4fv("MVP", false, this.roadMat);
        this.roadProgram.setUniform4f("tint", [1, 1, 1, 1]);

        //this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.roadTexture);
        this.roadProgram.setUniform1i('texture_sampler', 0);

        this.roadMesh.draw(this.gl.TRIANGLES);

        this.DrawRoadAfterTime(this.roadMat , numOfPlanes);

    }

    public DrawRoadAfterTime(roadMat :mat4 , numOfPlanes : number)
    {

        for(let i = 0 ; i < numOfPlanes ; i++)
        {
            mat4.translate(roadMat , roadMat , [2,0,0]);                     // increment x by 2 (distance between 2 planes)
                
            this.roadProgram.setUniformMatrix4fv("MVP", false, roadMat);
            this.roadProgram.setUniform4f("tint", [1, 1, 1, 1]);
                
            //this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.roadTexture);
            this.roadProgram.setUniform1i('texture_sampler', 0);
                
            this.roadMesh.draw(this.gl.TRIANGLES); 
        }

        

    }

    public CheckRoadTimePassed(passedTime: number)
    {
        if(this.roadTimer > passedTime)
        {
            this.roadTimer = 0;
            return true;
        }
        else
        {
            return false;
        }
    }
}