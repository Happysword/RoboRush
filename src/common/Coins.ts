import { vec2, vec3, mat4 } from 'gl-matrix';
import ShaderProgram from './shader-program';
import Mesh from '../common/mesh';
import Collider from './colliders';

export default class Coins extends Collider {

    coinsMat : mat4;
    CoinsProgram : ShaderProgram;
    CoinsTexture : WebGLTexture;
    CoinsMesh : Mesh;
    
    public constructor (GL : WebGL2RenderingContext, coinsprogram : ShaderProgram, coinsmesh : Mesh)
    {
        super(GL);
        this.CoinsProgram = coinsprogram;
        this.CoinsMesh = coinsmesh;
    }

    public Draw (deltaTime: number, VP : mat4, playerPos : number, cameraPos : vec3)
    {
        this.coinsMat = mat4.clone(VP);

        for (var i = 0; i < 500; i += 5)
        {
            this.drawCoin(0, i, playerPos, cameraPos);
            this.drawCoin(1, i, playerPos, cameraPos);
            this.drawCoin(2, i, playerPos, cameraPos);
        }
    }

    public didCollide(coinLane : number, coinDistance : number, playerPos : number, cameraPos : vec3) : boolean
    {
        if (coinLane == playerPos)
        {
            if ((coinDistance >= (cameraPos[2] - 10)) && (coinDistance <= (cameraPos[2] + 10)))
            {
                return true;
            }
        }
        return false;
    }

    private drawCoin(lane : number, distance : number, playerPos : number, cameraPos : vec3) : void
    {
        var coinMat = mat4.clone(this.coinsMat);

        mat4.translate(coinMat, coinMat, [0, 0.5, distance]);

        mat4.scale(coinMat, coinMat, [0.3, 0.3, 0.3]);

        if (lane == 0)
        {
            mat4.translate(coinMat, coinMat, [6, 0, 0]);
        }
        else if (lane == 2)
        {
            mat4.translate(coinMat, coinMat, [-6, 0, 0]);
        }

        if (!this.didCollide(lane, distance, playerPos, cameraPos))
        {
            this.CoinsProgram.use();
            this.CoinsProgram.setUniformMatrix4fv("MVP", false, coinMat);
            this.CoinsProgram.setUniform4f("tint", [1, 1, 1, 1]);
            this.CoinsMesh.draw(this.gl.TRIANGLES);
        }
    }
}