import { vec2, vec3, mat4 } from 'gl-matrix';
import ShaderProgram from './shader-program';
import Mesh from '../common/mesh';
import Collider from './colliders';

export default class Coins extends Collider {

    firstPos : vec3;
    CoinsProgram : ShaderProgram;
    CoinsTexture : WebGLTexture;
    CoinsMesh : Mesh;
    
    public constructor (GL : WebGL2RenderingContext, coinsprogram : ShaderProgram, coinsmesh : Mesh, cameraPos : vec3)
    {
        super(GL);
        this.CoinsProgram = coinsprogram;
        this.CoinsMesh = coinsmesh;
        this.firstPos = cameraPos;
    }

    public Draw (deltaTime: number, VP : mat4)
    {
        for (var i = -100; i < 200; i += 5)
        {
            this.drawCoin(VP, 0, i);
            this.drawCoin(VP, 1, i);
            this.drawCoin(VP, 2, i);
        }
    }

    public didCollide() : boolean
    {


        return true;
    }

    private drawCoin(VP : mat4, lane : Number, distance : Number) : void
    {
        var coinMat = mat4.clone(VP);
        mat4.translate(coinMat, coinMat, this.firstPos);
        mat4.scale(coinMat, coinMat, [0.01,0.01,0.01]);
        mat4.translate(coinMat, coinMat, [0, -7, -distance]);
        if (lane == 0)
        {
            mat4.translate(coinMat, coinMat, [5, 0, 0]);
        }
        else if (lane == 2)
        {
            mat4.translate(coinMat, coinMat, [-5, 0, 0]);
        }

        this.CoinsProgram.use();
        this.CoinsProgram.setUniformMatrix4fv("MVP", false, coinMat);
        this.CoinsProgram.setUniform4f("tint", [1, 1, 1, 1]);
        this.CoinsMesh.draw(this.gl.TRIANGLES);
    }
}