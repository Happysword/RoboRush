import { vec3, mat4 } from 'gl-matrix';
import ShaderProgram from './shader-program';
import Mesh from '../common/mesh';
import Input from '../common/input';
import Camera from './camera';
import ScoreManager from './ScoreManager';

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
    timeofjumppress: number = 0; //time the player pressed the jump key
    isjumping : Boolean = false;// is in jump animation or not 
    xposition : number = 0 ;
    jumpposition : number = 0; 
    inputer: Input;
    roboBodyTexture : WebGLTexture;
    roboHeadTexture : WebGLTexture;
    time: number = 0;
    maxlanedisp: number = 1.7;
    speedofsliding: number = 0.07;
    jumpduration:number = 0.4;

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


    public Draw (VP : mat4 ,camerapos : vec3 , DeltaTime : number , isLost : boolean )
    {
        this.time += DeltaTime / 1000; 

        if(this.time < 300) //make player faster to go to lanes with time
        {
            this.speedofsliding = 0.05;
            this.speedofsliding = this.speedofsliding + (this.time / 2000);
        }

        if(this.time < 70) //make player jump faster with time
        {
            this.jumpduration = 0.6;
            this.jumpduration = this.jumpduration - (this.time /200);
            console.log(this.time);
        }

        this.PlayerBodyMat = mat4.clone(VP);
        
        mat4.translate(this.PlayerBodyMat,this.PlayerBodyMat,camerapos);
        
        this.PlayerBodyProgram.use();
        
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.roboBodyTexture);
        this.PlayerBodyProgram.setUniform1i('texture_sampler', 0);
        
        if(!isLost)                     //if lost don't move
        {
            this.setPlayerDirection();
            this.setPlayerJump(this.time);
        }
        this.MovePlayerDirection(isLost);
        this.MovePlayerJump(this.time);
        
        
        mat4.scale(this.PlayerBodyMat,this.PlayerBodyMat,[0.4,0.4,0.4])
        if(!isLost)
        {
            mat4.rotateX(this.PlayerBodyMat , this.PlayerBodyMat , this.time * 9);
        }
        this.PlayerBodyProgram.setUniformMatrix4fv("VP", false, VP);
        this.PlayerBodyProgram.setUniform3f('cam_position' , camerapos);
        this.PlayerBodyProgram.setUniformMatrix4fv("MVP", false, this.PlayerBodyMat);
        if(!isLost)
        {
            this.PlayerBodyProgram.setUniform4f("tint", [1, 1, 1, 1]);
        }
        else
        {
            this.PlayerBodyProgram.setUniform4f("tint", [1, ((Math.abs(Math.sin(this.time*5))+0.5)/2)+0.2, ((Math.abs(Math.sin(this.time*5))+0.2)/2)+0.5, 1]);
        }
        this.PlayerBodyMesh.draw(this.gl.TRIANGLES);
        
        //*************** Head part same as body ******************/
        this.PlayerHeadMat = mat4.clone(VP);

        mat4.translate(this.PlayerHeadMat , this.PlayerHeadMat , camerapos);

        this.PlayerHeadProgram.use();

        this.gl.bindTexture(this.gl.TEXTURE_2D , this.roboHeadTexture);
        this.PlayerHeadProgram.setUniform1i('texture_sampler', 0);

        this.MovePlayerHeadDirection(isLost);
        this.MovePlayerHeadJump(this.time);

        
        mat4.scale(this.PlayerHeadMat,this.PlayerHeadMat,[0.4,0.4,0.4])
        mat4.rotateY(this.PlayerHeadMat , this.PlayerHeadMat , Math.cos( this.time * 0.7  ) * Math.sin( this.time * 2  )* 4);
        mat4.translate(this.PlayerHeadMat,this.PlayerHeadMat,[0.25,-1.3,0]);
        this.PlayerHeadProgram.setUniformMatrix4fv("VP", false, VP);
        this.PlayerHeadProgram.setUniformMatrix4fv("MVP", false, this.PlayerHeadMat);
        this.PlayerHeadProgram.setUniform3f('cam_position' , camerapos);
        if(!isLost)
        {
            this.PlayerHeadProgram.setUniform4f("tint", [1, 1, 1, 1]);
        }
        else
        {
            this.PlayerHeadProgram.setUniform4f("tint", [1, ((Math.abs(Math.sin(this.time*5))+0.2)/2)+0.5, ((Math.abs(Math.sin(this.time*5))+0.2)/2)+0.5, 1]);
        }
        this.PlayerHeadMesh.draw(this.gl.TRIANGLES);

    }

    private setPlayerDirection()
    {

        if(this.playerdirection == 0 && (this.inputer.isKeyJustDown("ArrowLeft")) )
       {   
            this.playerdirection = 1;
       }
       else if(this.playerdirection == 0 && (this.inputer.isKeyJustDown("ArrowRight")) )
       {
            this.playerdirection = 2;
       }
       
    }

    private setPlayerJump( deltatime : number )
    {
        if(this.isjumping == false && this.inputer.isKeyJustDown(" "))
        {
            this.isjumping = true;
            this.timeofjumppress = deltatime;
        }

    }

    private MovePlayerJump(timenow : number)
    {
        mat4.translate(this.PlayerBodyMat,this.PlayerBodyMat,[0,-2.1,0])
        
        if(this.isjumping == true)
        {
            let timepassed = timenow - this.timeofjumppress;
            let jumpdisplacement = Math.PI/2*(timepassed / this.jumpduration);

            if(timepassed < 2*this.jumpduration)
            { mat4.translate(this.PlayerBodyMat,this.PlayerBodyMat,[0,  1.0 * Math.sin(jumpdisplacement) ,0]) }
            
            else 
            { this.isjumping = false }

        }

    }

    private MovePlayerHeadJump(timenow : number)
    {
        mat4.translate(this.PlayerHeadMat,this.PlayerHeadMat,[0,-2.1,0])
        
        if(this.isjumping == true)
        {
            let timepassed = timenow - this.timeofjumppress;
            let jumpdisplacement = Math.PI/2*(timepassed / this.jumpduration);
            this.jumpposition = Math.sin(jumpdisplacement);

            if(timepassed < 2*this.jumpduration)
            { mat4.translate(this.PlayerHeadMat,this.PlayerHeadMat,[0,  1.0 * Math.sin(jumpdisplacement) ,0]) }
            
            else 
            { this.isjumping = false; this.jumpposition = 0; }

        }

    }

    private MovePlayerDirection(isLost:Boolean)
    {
        mat4.translate(this.PlayerBodyMat,this.PlayerBodyMat,[0,0,2])

        if(isLost)
        {
            this.playerdirection = 0;
            mat4.translate(this.PlayerBodyMat,this.PlayerBodyMat,[this.xposition,0,0]);
        }

       else  if(this.playerdirection == 0 && this.playerposition == 1)
        {
            this.xposition = 0;
            mat4.translate(this.PlayerBodyMat,this.PlayerBodyMat,[this.xposition,0,0]);
        }
        else if(this.playerdirection == 1 && this.playerposition == 1)//from middle to left working
        {
            mat4.translate(this.PlayerBodyMat,this.PlayerBodyMat,[this.xposition,0,0])
            if(this.xposition < this.maxlanedisp ) this.xposition += this.speedofsliding;
            else{this.playerdirection = 0 ;this.playerposition = 0;}
        }
        
        else if(this.playerdirection == 2 && this.playerposition == 1)//from middle to right working
        {
            mat4.translate(this.PlayerBodyMat,this.PlayerBodyMat,[this.xposition,0,0])
            if(this.xposition > -this.maxlanedisp) this.xposition -= this.speedofsliding;
            else{this.playerdirection = 0 ;this.playerposition = 2;}
        }

        else if(this.playerdirection == 2 && this.playerposition == 0)//from left to middle working
        {
            if(this.xposition > 0) this.xposition -= this.speedofsliding;
            else{this.playerdirection = 0 ;this.playerposition = 1;}
            mat4.translate(this.PlayerBodyMat,this.PlayerBodyMat,[this.xposition,0,0])
        }
        
        else if(this.playerdirection == 1 && this.playerposition == 2)//from right to middle working
        {
            if(this.xposition < 0) this.xposition += this.speedofsliding;
            else{this.playerdirection = 0 ;this.playerposition = 1;}
            mat4.translate(this.PlayerBodyMat,this.PlayerBodyMat,[this.xposition,0,0])
        }

        else if(this.playerdirection == 0 || (this.playerdirection == 1 && this.playerposition == 0) || (this.playerdirection == 2 && this.playerposition == 2))
        {
            this.playerdirection = 0;
            mat4.translate(this.PlayerBodyMat,this.PlayerBodyMat,[this.xposition,0,0]);
        }    

    }

    private MovePlayerHeadDirection(isLost:Boolean)
    {
        mat4.translate(this.PlayerHeadMat,this.PlayerHeadMat,[0,0,2]) //for the head

        if(isLost)
        {
            this.playerdirection = 0;
            mat4.translate(this.PlayerHeadMat,this.PlayerHeadMat,[this.xposition,0,0]);
        }

        else if(this.playerdirection == 1 && this.playerposition == 1)//from middle to left working
        {
            mat4.translate(this.PlayerHeadMat,this.PlayerHeadMat,[this.xposition,0,0])  //head
            if(this.xposition < this.maxlanedisp ) this.xposition += this.speedofsliding;
            else{this.playerdirection = 0 ;this.playerposition = 0;}
        }
        
        else if(this.playerdirection == 2 && this.playerposition == 1)//from middle to right working
        {
            mat4.translate(this.PlayerHeadMat,this.PlayerHeadMat,[this.xposition,0,0]) //head
            if(this.xposition > -this.maxlanedisp) this.xposition -= this.speedofsliding;
            else{this.playerdirection = 0 ;this.playerposition = 2;}
        }

        else if(this.playerdirection == 2 && this.playerposition == 0)//from left to middle working
        {
            mat4.translate(this.PlayerHeadMat,this.PlayerHeadMat,[this.xposition,0,0])
            if(this.xposition > 0) this.xposition -= this.speedofsliding;
            else{this.playerdirection = 0 ;this.playerposition = 1;}
        }
        
        else if(this.playerdirection == 1 && this.playerposition == 2)//from right to middle working
        {
            mat4.translate(this.PlayerHeadMat,this.PlayerHeadMat,[this.xposition,0,0])
            if(this.xposition < 0) this.xposition += this.speedofsliding;
            else{this.playerdirection = 0 ;this.playerposition = 1;}
        }

        else if(this.playerdirection == 0 || (this.playerdirection == 1 && this.playerposition == 0) || (this.playerdirection == 2 && this.playerposition == 2))
        {
            mat4.translate(this.PlayerHeadMat,this.PlayerHeadMat,[this.xposition,0,0]);
        }    

    }

    //returns a position scaled from 0-10 of the player in the y-axis from the ground:0 to the max height:10
    public getscaledyposition ()
    { 
        return this.jumpposition*10;
    }

}
