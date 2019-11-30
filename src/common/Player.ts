import { vec3, mat4 } from 'gl-matrix';
import ShaderProgram from './shader-program';
import Mesh from '../common/mesh';
import Input from '../common/input';

export default class Player {

    PlayerMat : mat4;
    PlayerBodyProgram : ShaderProgram;
    gl : WebGL2RenderingContext;
    pPlayerTexture : WebGLTexture;
    PlayerMesh : Mesh;
    deltaTime : number;
    playerdirection : number = 0 ; //zero moving straight , one moving to the left , two moving to the right
    playerposition: number = 1; //zero for left, one for middle , two for right
    xposition : number = 0 ;
    inputer: Input;
    roboBodyTexture : WebGLTexture;
    time: number = 0;

    constructor( Playerbodyprogram : ShaderProgram, playermesh : Mesh, GL : WebGL2RenderingContext, input:Input , bodyTexture : WebGLTexture)
    {
        this.PlayerBodyProgram = Playerbodyprogram;
        this.PlayerMesh = playermesh;
        this.gl = GL;
        this.inputer = input;
        this.roboBodyTexture = bodyTexture;
    }


    public Draw (VP : mat4 ,camerapos : vec3 , DeltaTime : number )
    {
        this.time += DeltaTime / 1000; 
        this.PlayerMat = mat4.clone(VP);
        mat4.translate(this.PlayerMat,this.PlayerMat,camerapos);
        this.PlayerBodyProgram.use();
        
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.roboBodyTexture);
        this.PlayerBodyProgram.setUniform1i('texture_sampler', 0);
        
        this.setPlayerDirection();
        this.MovePlayerDirection();
        mat4.scale(this.PlayerMat,this.PlayerMat,[0.2,0.2,0.2])
        mat4.rotateX(this.PlayerMat , this.PlayerMat , this.time * 9);
        this.PlayerBodyProgram.setUniformMatrix4fv("MVP", false, this.PlayerMat);
        this.PlayerBodyProgram.setUniform4f("tint", [1, 1, 1, 1]);
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
