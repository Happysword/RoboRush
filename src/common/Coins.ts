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
    previousHits: vec3[];
    scoremanager : ScoreManager;
    obstaclesLocations: number[][];
    distanceBetweenObstacles : number;

    public constructor (GL : WebGL2RenderingContext, coinsprogram : ShaderProgram, coinsmesh : Mesh, scoresManager : ScoreManager, playerinst : Player , wrenchTexture : WebGLTexture, locations : number[][], distanceBetweenObstacles : number)
    {
        super(GL);
        this.CoinsProgram = coinsprogram;
        this.CoinsMesh = coinsmesh;
        this.previousHits = new Array<vec3>();
        this.scoremanager = scoresManager;
        this.player = playerinst;
        this.CoinsTexture = wrenchTexture;
        this.obstaclesLocations = locations;
        this.distanceBetweenObstacles = distanceBetweenObstacles;
    }
    
    public Draw (deltaTime: number, VP : mat4, playerPos : number, cameraPos : vec3, time : number, offset : number , lightDir : vec3)
    {
        this.coinsMat = mat4.clone(VP);
        
        this.CoinsProgram.use();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.CoinsTexture);
        this.CoinsProgram.setUniform1i('texture_sampler', 0);
        this.CoinsProgram.setUniform3f('lightDirection' , [lightDir[0],lightDir[1],lightDir[2]]);
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
                    this.drawCoin(j, offset + (i * this.distanceBetweenObstacles), playerPos, cameraPos, time);     // distance between each obstacles is this.distanceBetweenObstacles
                }
            }
        }
    }
    
    public didCollide(coinLane : number, coinDistance : number, playerPos : number, cameraPos : vec3, time : number) : boolean
    {
        let thisTime = vec3.create();
        thisTime[0] = coinLane;
        thisTime[1] = coinDistance;
        thisTime[2] = time;
        // First check if object collided with player before
        // if collided then don't draw for 2 seconds (2=>respawn time)
        for (var i = 0; i < this.previousHits.length; ++i)
        {
            if ((this.previousHits[i][0] == thisTime[0]) && (this.previousHits[i][1] == thisTime[1]))
            {
                if (((thisTime[2] - this.previousHits[i][2]) > 2))
                {
                    this.previousHits.splice(i, 1);
                    return false;
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
                    this.previousHits.push(thisTime);
                    this.scoremanager.ChangeScore(50);
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

    public clean()
    {
        this.previousHits.splice(0, this.previousHits.length);
    }
}