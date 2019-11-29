import { vec3, mat4 } from 'gl-matrix';
import ShaderProgram from './shader-program';
import Mesh from '../common/mesh';
import Input from '../common/input';

export default class Player {

    PlayerMat : mat4;
    PlayerProgram : ShaderProgram;
    gl : WebGL2RenderingContext;
    pPlayerTexture : WebGLTexture;
    PlayerMesh : Mesh;
    deltaTime : number;
    playerdirection : number = 0 ; //zero moving straight , one moving to the left , two moving to the right
    playerposition: number = 1; //zero for left, one for middle , two for right
    xposition : number = 0 ;
    inputer: Input;

    constructor( Playerprogram : ShaderProgram, playermesh : Mesh, GL : WebGL2RenderingContext, input:Input)
    {
        this.PlayerProgram = Playerprogram;
        this.PlayerMesh = playermesh;
        this.gl = GL;
        this.inputer = input;
    }


    public Draw (VP : mat4 ,camerapos : vec3 , DeltaTime : number )
    {
        this.PlayerMat = mat4.clone(VP);
        this.deltaTime = DeltaTime; 
        mat4.translate(this.PlayerMat,this.PlayerMat,camerapos);
        this.PlayerProgram.use();
        this.setPlayerDirection();
        this.MovePlayerDirection();
        mat4.scale(this.PlayerMat,this.PlayerMat,[0.2,0.2,0.2])
        this.PlayerProgram.setUniformMatrix4fv("MVP", false, this.PlayerMat);
        this.PlayerProgram.setUniform4f("tint", [1, 1, 1, 1]);
        this.PlayerMesh.draw(this.gl.TRIANGLES);

    }

    private setPlayerDirection()
    {
        if(this.inputer.isKeyJustDown("ArrowLeft"))
       {   
            this.playerdirection = 1;
       }
       else if(this.inputer.isKeyJustDown("ArrowRight"))
       {
            this.playerdirection = 2;
       }
       
    }

    private MovePlayerDirection()
    {
        mat4.translate(this.PlayerMat,this.PlayerMat,[0,-1,1])

        if(this.playerdirection == 1 && this.playerposition == 1)//from middle to left working
        {
            mat4.translate(this.PlayerMat,this.PlayerMat,[this.xposition,0,0])
            if(this.xposition < 0.8 ) this.xposition += 0.05;
            else{this.playerdirection = 0 ;this.playerposition = 0;}
        }
        
        else if(this.playerdirection == 2 && this.playerposition == 1)//from middle to right working
        {
            mat4.translate(this.PlayerMat,this.PlayerMat,[this.xposition,0,0])
            if(this.xposition > -0.8) this.xposition -= 0.05;
            else{this.playerdirection = 0 ;this.playerposition = 2;}
        }

        else if(this.playerdirection == 2 && this.playerposition == 0)//from left to middle working
        {
            mat4.translate(this.PlayerMat,this.PlayerMat,[this.xposition,0,0])
            if(this.xposition > 0) this.xposition -= 0.05;
            else{this.playerdirection = 0 ;this.playerposition = 1;}
        }
        
        else if(this.playerdirection == 1 && this.playerposition == 2)//from right to middle working
        {
            mat4.translate(this.PlayerMat,this.PlayerMat,[this.xposition,0,0])
            if(this.xposition < 0) this.xposition += 0.05;
            else{this.playerdirection = 0 ;this.playerposition = 1;}
        }

        else if(this.playerdirection == 0 || (this.playerdirection == 1 && this.playerposition == 0) || (this.playerdirection == 2 && this.playerposition == 2))
        {
            mat4.translate(this.PlayerMat,this.PlayerMat,[this.xposition,0,0]);
        }    

        
    }

}
