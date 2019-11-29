import { vec2, vec3, mat4 } from 'gl-matrix';
import ShaderProgram from './shader-program';
import Mesh from '../common/mesh';
import Collider from './colliders';
import ScoreManager from './ScoreManager';

export default class Coins extends Collider {

    coinsMat : mat4;
    CoinsProgram : ShaderProgram;
    CoinsTexture : WebGLTexture;
    CoinsMesh : Mesh;
    previousHitsLane : number[];
    previousHitsDistance : number[];
    previousHitsTime : number[];
    scoremanager : ScoreManager;
    
    public constructor (GL : WebGL2RenderingContext, coinsprogram : ShaderProgram, coinsmesh : Mesh, scoresManager : ScoreManager)
    {
        super(GL);
        this.CoinsProgram = coinsprogram;
        this.CoinsMesh = coinsmesh;
        this.previousHitsLane = new Array<number>();
        this.previousHitsDistance = new Array<number>();
        this.previousHitsTime = new Array<number>();
        this.scoremanager = scoresManager;
    }

    public Draw (deltaTime: number, VP : mat4, playerPos : number, cameraPos : vec3, time : number)
    {
        this.coinsMat = mat4.clone(VP);

        for (var i = 0; i < 500; i += 5)
        {
            this.drawCoin(1, i, playerPos, cameraPos, time);
        }
    }

    public didCollide(coinLane : number, coinDistance : number, playerPos : number, cameraPos : vec3, time : number) : boolean
    {
        if (this.previousHitsDistance.includes(coinDistance))
        {
            var index = this.previousHitsDistance.indexOf(coinDistance);
            if (this.previousHitsLane[index] == coinLane)
            {
                if ((time - this.previousHitsTime[index]) > 5)
                {
                    this.previousHitsDistance.splice(index, 1);
                    this.previousHitsLane.splice(index, 1);
                    this.previousHitsTime.splice(index, 1);
                }
                return true;
            }
        }
        if (coinLane == playerPos)
        {
            if ((coinDistance >= (cameraPos[2])) && (coinDistance <= (cameraPos[2] + 2.5)))
            {
                this.previousHitsLane.push(coinLane);
                this.previousHitsDistance.push(coinDistance);
                this.previousHitsTime.push(time);
                this.scoremanager.ChangeScore(1);
                return true;
            }
        }

        return false;
    }

    private drawCoin(lane : number, distance : number, playerPos : number, cameraPos : vec3, time : number) : void
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

        if (!this.didCollide(lane, distance, playerPos, cameraPos, time))
        {
            this.CoinsProgram.use();
            this.CoinsProgram.setUniformMatrix4fv("MVP", false, coinMat);
            this.CoinsProgram.setUniform4f("tint", [1, 1, 1, 1]);
            this.CoinsMesh.draw(this.gl.TRIANGLES);
        }
    }
}