import { vec3, mat4 } from 'gl-matrix';
import ShaderProgram from './shader-program';
import Mesh from '../common/mesh';
import Camera from './camera';

export default class SkyBox {

    gl : WebGL2RenderingContext;
    skyBoxProgram : ShaderProgram;
    camera : Camera;
    samplerCubeMap : WebGLSampler;
    cubeMapMesh : Mesh;
    skyBoxTexture : WebGLTexture;
    skyMat : mat4;

    constructor(GL : WebGL2RenderingContext , SKYBOXPROGRAM : ShaderProgram  , SAMPLERCUBEMAP : WebGLSampler , CUBEMAPMESH : Mesh , SKYBOXTEXTURE : WebGLTexture )
    {
        this.gl = GL;
        this.skyBoxProgram = SKYBOXPROGRAM;
        this.samplerCubeMap = SAMPLERCUBEMAP;
        this.cubeMapMesh = CUBEMAPMESH;
        this.skyMat = mat4.create();
    }

    public drawSkyBox(camera : Camera)
    {
        this.gl.cullFace(this.gl.FRONT);
        this.gl.depthMask(false);   //A GLboolean specifying whether or not writing into the depth buffer is enabled

        this.skyBoxProgram.use();

        this.skyBoxProgram.setUniformMatrix4fv("VP", false, camera.ViewProjectionMatrix);
        this.skyBoxProgram.setUniform3f("cam_position", camera.position);

        mat4.translate(this.skyMat, this.skyMat, camera.position);
        
        this.skyBoxProgram.setUniformMatrix4fv("M", false, this.skyMat);

        this.skyBoxProgram.setUniform4f("tint", [1, 1, 1, 1]);

        this.cubeMapMesh.draw(this.gl.TRIANGLES);
        
        this.gl.cullFace(this.gl.BACK);
        this.gl.depthMask(true);
    }

}