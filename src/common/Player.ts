import { vec3, mat4 } from 'gl-matrix';
import ShaderProgram from './shader-program';
import Mesh from '../common/mesh';
import Input from '../common/input';

export default class Player {

    PlayerBodyMat : mat4;
    PlayerHeadMat : mat4;
    PlayerBodyProgram : ShaderProgram;
    PlayerHeadProgram : ShaderProgram;
    gl : WebGL2RenderingContext;
    pPlayerTexture : WebGLTexture;
    PlayerBodyMesh : Mesh;
    PlayerHeadMesh : Mesh;
    deltaTime : number;
    playerdirection : number = 0 ; //zero moving straight , one moving to the left , two moving to the right
    playerposition: number = 1; //zero for left, one for middle , two for right
    xposition : number = 0 ;
    inputer: Input;
    roboBodyTexture : WebGLTexture;
    roboHeadTexture : WebGLTexture;
    time: number = 0;

    constructor( Playerbodyprogram : ShaderProgram, playerheadprogram : ShaderProgram , playerbodymesh : Mesh, playerheadmesh : Mesh ,GL : WebGL2RenderingContext, input:Input , bodyTexture : WebGLTexture , headtexture : WebGLTexture)
    {
        this.PlayerBodyProgram = Playerbodyprogram;
        this.PlayerHeadProgram = playerheadprogram;
        this.PlayerBodyMesh = playerbodymesh;
        this.PlayerHeadMesh = playerheadmesh;
        this.gl = GL;
        this.inputer = input;
        this.roboBodyTexture = bodyTexture;
        this.roboHeadTexture = headtexture;
    }


    public Draw (VP : mat4 ,camerapos : vec3 , DeltaTime : number )
    {
        this.time += DeltaTime / 1000; 

        this.PlayerBodyMat = mat4.clone(VP);
        
        mat4.translate(this.PlayerBodyMat,this.PlayerBodyMat,camerapos);
        
        this.PlayerBodyProgram.use();
        
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.roboBodyTexture);
        this.PlayerBodyProgram.setUniform1i('texture_sampler', 0);
        
        this.setPlayerDirection();
        this.MovePlayerDirection();
        mat4.scale(this.PlayerBodyMat,this.PlayerBodyMat,[0.2,0.2,0.2])
        mat4.rotateX(this.PlayerBodyMat , this.PlayerBodyMat , this.time * 9);
        this.PlayerBodyProgram.setUniformMatrix4fv("MVP", false, this.PlayerBodyMat);
        this.PlayerBodyProgram.setUniform4f("tint", [1, 1, 1, 1]);
        this.PlayerBodyMesh.draw(this.gl.TRIANGLES);
        
        //*************** Head part same as body ******************/
        this.PlayerHeadMat = mat4.clone(VP);

        mat4.translate(this.PlayerHeadMat , this.PlayerHeadMat , camerapos);

        this.PlayerHeadProgram.use();

        this.gl.bindTexture(this.gl.TEXTURE_2D , this.roboHeadTexture);
        this.PlayerHeadProgram.setUniform1i('texture_sampler', 0);

        this.MovePlayerHeadDirection();

        mat4.scale(this.PlayerHeadMat,this.PlayerHeadMat,[0.2,0.2,0.2])
        mat4.rotateY(this.PlayerHeadMat , this.PlayerHeadMat , Math.cos( this.time * 0.7  ) * Math.sin( this.time * 2  )* 4);
        mat4.translate(this.PlayerHeadMat,this.PlayerHeadMat,[0.25,-1.3,0]);
        this.PlayerHeadProgram.setUniformMatrix4fv("MVP", false, this.PlayerHeadMat);
        this.PlayerHeadProgram.setUniform4f("tint", [1, 1, 1, 1]);
        this.PlayerHeadMesh.draw(this.gl.TRIANGLES);

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
        mat4.translate(this.PlayerBodyMat,this.PlayerBodyMat,[0,-1,1])

        if(this.playerdirection == 1 && this.playerposition == 1)//from middle to left working
        {
            mat4.translate(this.PlayerBodyMat,this.PlayerBodyMat,[this.xposition,0,0])
            if(this.xposition < 0.8 ) this.xposition += 0.05;
            else{this.playerdirection = 0 ;this.playerposition = 0;}
        }
        
        else if(this.playerdirection == 2 && this.playerposition == 1)//from middle to right working
        {
            mat4.translate(this.PlayerBodyMat,this.PlayerBodyMat,[this.xposition,0,0])
            if(this.xposition > -0.8) this.xposition -= 0.05;
            else{this.playerdirection = 0 ;this.playerposition = 2;}
        }

        else if(this.playerdirection == 2 && this.playerposition == 0)//from left to middle working
        {
            mat4.translate(this.PlayerBodyMat,this.PlayerBodyMat,[this.xposition,0,0])
            if(this.xposition > 0) this.xposition -= 0.05;
            else{this.playerdirection = 0 ;this.playerposition = 1;}
        }
        
        else if(this.playerdirection == 1 && this.playerposition == 2)//from right to middle working
        {
            mat4.translate(this.PlayerBodyMat,this.PlayerBodyMat,[this.xposition,0,0])
            if(this.xposition < 0) this.xposition += 0.05;
            else{this.playerdirection = 0 ;this.playerposition = 1;}
        }

        else if(this.playerdirection == 0 || (this.playerdirection == 1 && this.playerposition == 0) || (this.playerdirection == 2 && this.playerposition == 2))
        {
            mat4.translate(this.PlayerBodyMat,this.PlayerBodyMat,[this.xposition,0,0]);
        }    

    }

    private MovePlayerHeadDirection()
    {
        mat4.translate(this.PlayerHeadMat,this.PlayerHeadMat,[0,-1,1]) //for the head

        if(this.playerdirection == 1 && this.playerposition == 1)//from middle to left working
        {
            mat4.translate(this.PlayerHeadMat,this.PlayerHeadMat,[this.xposition,0,0])  //head
            if(this.xposition < 0.8 ) this.xposition += 0.05;
            else{this.playerdirection = 0 ;this.playerposition = 0;}
        }
        
        else if(this.playerdirection == 2 && this.playerposition == 1)//from middle to right working
        {
            mat4.translate(this.PlayerHeadMat,this.PlayerHeadMat,[this.xposition,0,0]) //head
            if(this.xposition > -0.8) this.xposition -= 0.05;
            else{this.playerdirection = 0 ;this.playerposition = 2;}
        }

        else if(this.playerdirection == 2 && this.playerposition == 0)//from left to middle working
        {
            mat4.translate(this.PlayerHeadMat,this.PlayerHeadMat,[this.xposition,0,0])
            if(this.xposition > 0) this.xposition -= 0.05;
            else{this.playerdirection = 0 ;this.playerposition = 1;}
        }
        
        else if(this.playerdirection == 1 && this.playerposition == 2)//from right to middle working
        {
            mat4.translate(this.PlayerHeadMat,this.PlayerHeadMat,[this.xposition,0,0])
            if(this.xposition < 0) this.xposition += 0.05;
            else{this.playerdirection = 0 ;this.playerposition = 1;}
        }

        else if(this.playerdirection == 0 || (this.playerdirection == 1 && this.playerposition == 0) || (this.playerdirection == 2 && this.playerposition == 2))
        {
            mat4.translate(this.PlayerHeadMat,this.PlayerHeadMat,[this.xposition,0,0]);
        }    

    }

}
