import { vec2, vec3, mat4 } from 'gl-matrix';
import ShaderProgram from './shader-program';
import Mesh from '../common/mesh';
import Collider from './colliders';
import ScoreManager from './ScoreManager';
import Player from './Player';

export default class Coins extends Collider {

    player : Player
    coinsMat : mat4;
    CoinsProgram : ShaderProgram;
    CoinsTexture : WebGLTexture;
    CoinsMesh : Mesh;
    previousHitsLane : number[];
    previousHitsDistance : number[];
    previousHitsTime : number[];
    scoremanager : ScoreManager;
    obstaclesLocations: number[][];

    public constructor (GL : WebGL2RenderingContext, coinsprogram : ShaderProgram, coinsmesh : Mesh, scoresManager : ScoreManager, playerinst : Player , wrenchTexture : WebGLTexture, locations : number[][])
    {
        super(GL);
        this.CoinsProgram = coinsprogram;
        this.CoinsMesh = coinsmesh;
        this.previousHitsLane = new Array<number>();
        this.previousHitsDistance = new Array<number>();
        this.previousHitsTime = new Array<number>();
        this.scoremanager = scoresManager;
        this.player = playerinst;
        this.CoinsTexture = wrenchTexture;
        this.obstaclesLocations = locations;
    }
    
    public Draw (deltaTime: number, VP : mat4, playerPos : number, cameraPos : vec3, time : number)
    {
        this.coinsMat = mat4.clone(VP);
        
        this.CoinsProgram.use();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.CoinsTexture);
        this.CoinsProgram.setUniform1i('texture_sampler', 0);
        this.CoinsProgram.setUniform3f('cam_position' , cameraPos);
        this.CoinsProgram.setUniformMatrix4fv("VP", false, VP);

        // Draw all coins here should put (Lane of Coin, distance of coin, leave the rest as is)
        // Lane of Coin 0=>left lane, 1=>middle lane, 2=>right lane 
        for (var i = 0; i < this.obstaclesLocations.length; i++)
        {
            for (var j = 0; j < this.obstaclesLocations[i].length; j++)
            {
                if (this.obstaclesLocations[i][j] == 1)  // coins code is 1
                {
                    this.drawCoin(j, (i * 10), playerPos, cameraPos, time);     // distance between each obstacles is 10
                }
            }
        }
    }
    
    public didCollide(coinLane : number, coinDistance : number, playerPos : number, cameraPos : vec3, time : number) : boolean
    {
        // First check if object collided with player before
        // if collided then don't draw for 5 seconds (5=>respawn time)
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
        // if coin not collided before and collided with user then don't draw it
        if (!((this.player.getscaledyposition() > 8) && (this.player.isjumping)))
        {
            if (coinLane == playerPos)
            {
                // in the left bracket value of collision distance to calculate from behind user
                // in the right bracket value of collision distance to calculate from infront of user
                if ((coinDistance >= (cameraPos[2] + 1.5)) && (coinDistance <= (cameraPos[2] + 2.3)))
                {
                    this.previousHitsLane.push(coinLane);
                    this.previousHitsDistance.push(coinDistance);
                    this.previousHitsTime.push(time);
                    this.scoremanager.ChangeScore(10);
                    return true;
                }
            }
        }

        return false;
    }

    private drawCoin(lane : number, distance : number, playerPos : number, cameraPos : vec3, time : number) : void
    {
        // put coin in right place
        var coinMat = mat4.clone(this.coinsMat);

        mat4.translate(coinMat, coinMat, [0, 0.5, distance]);

        mat4.scale(coinMat, coinMat, [0.3, 0.3, 0.3]);

        // left lane
        if (lane == 0)
        {
            mat4.translate(coinMat, coinMat, [6, 0, 0]);
        }
        else if (lane == 2) // right lane
        {
            mat4.translate(coinMat, coinMat, [-6, 0, 0]);
        }
        // else middle

        // if collided then don't draw
        if (!this.didCollide(lane, distance, playerPos, cameraPos, time))
        {
            mat4.rotateY(coinMat , coinMat , time * 2.5);
            mat4.scale(coinMat , coinMat , [0.8,0.8,0.8])
            this.CoinsProgram.setUniformMatrix4fv("MVP", false, coinMat);
            this.CoinsProgram.setUniform4f("tint", [((Math.abs(Math.cos(time*2)*Math.sin(time*2))+0.5)/2)+0.5, 1, ((Math.abs(Math.cos(time*2)*Math.sin(time*2))+0.5)/2)+0.5, 1]);
            this.CoinsMesh.draw(this.gl.TRIANGLES);
        }
    }
}