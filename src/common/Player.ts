import { vec3, mat4 } from 'gl-matrix';
import ShaderProgram from './shader-program';
import Mesh from '../common/mesh';

export default class Player {

    PlayerMat : mat4;
    PlayerProgram : ShaderProgram;
    gl : WebGL2RenderingContext;
    pPlayerTexture : WebGLTexture;
    PlayerMesh : Mesh;
    deltaTime : number;
    playerdirection : number = 0 ; //zero moving straight , one moving to the left , two moving to the right

    constructor(VP : mat4 ,camerapos : vec3 , Playerprogram : ShaderProgram, playermesh : Mesh, GL : WebGL2RenderingContext, DeltaTime : number)
    {
        this.PlayerMat = mat4.clone(VP);
        mat4.translate(this.PlayerMat,this.PlayerMat,camerapos);
        this.PlayerProgram = Playerprogram;
        this.PlayerMesh = playermesh;
        this.gl = GL;
        this.deltaTime = DeltaTime; 

    }


    public Draw ()
    {
        this.PlayerProgram.use();
        mat4.translate(this.PlayerMat,this.PlayerMat,[0,-1,1])
        mat4.scale(this.PlayerMat,this.PlayerMat,[0.2,0.2,0.2])
        this.PlayerProgram.setUniformMatrix4fv("MVP", false, this.PlayerMat);
        this.PlayerProgram.setUniform4f("tint", [1, 1, 1, 1]);
        this.PlayerMesh.draw(this.gl.TRIANGLES);

    }


}
