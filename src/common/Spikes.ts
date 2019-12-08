import { vec2, vec3, mat4 } from 'gl-matrix';
import ShaderProgram from './shader-program';
import Mesh from '../common/mesh';
import Collider from './colliders';
import ScoreManager from './ScoreManager';
import Player from './Player';

export default class Spikes extends Collider {

    player : Player
    SpikesMat : mat4;
    SpikesProgram : ShaderProgram;
    SpikesTexture : WebGLTexture;
    SpikesMesh : Mesh;
    previousHitsLane : number[];
    previousHitsDistance : number[];
    previousHitsTime : number[];
    scoremanager : ScoreManager;
    
    public constructor (GL : WebGL2RenderingContext, spikeprogram : ShaderProgram, spikemesh : Mesh, scoresManager : ScoreManager, playerinst : Player)
    {
        super(GL);
        this.SpikesProgram = spikeprogram;
        this.SpikesMesh = spikemesh;
        this.previousHitsLane = new Array<number>();
        this.previousHitsDistance = new Array<number>();
        this.previousHitsTime = new Array<number>();
        this.scoremanager = scoresManager;
        this.player = playerinst;
    }

    public Draw (deltaTime: number, VP : mat4, playerPos : number, cameraPos : vec3, time : number)
    {
        this.SpikesMat = mat4.clone(VP);

        for (var i = 0; i < 500; i += 5)
        {
            // Draw all obstacles here should put (Lane of obstacle, distance of obstacle, leave the rest as is)
            // Lane of obstacle 0=>left lane, 1=>middle lane, 2=>right lane 
            this.drawSpike(0, i, playerPos, cameraPos, time);
        }
    }

    public didCollide(spikeLane : number, spikeDistance : number, playerPos : number, cameraPos : vec3, time : number) : boolean
    {
        // First check if object collided with player before
        // if collided then don't draw for 5 seconds (5=>respawn time)
        if (this.previousHitsDistance.includes(spikeDistance))
        {
            var index = this.previousHitsDistance.indexOf(spikeDistance);
            if (this.previousHitsLane[index] == spikeLane)
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
        // if obstacle not collided before and collided with user then don't draw it
        if (!((this.player.getscaledyposition() > 3) && (this.player.isjumping)))
        {
            if (spikeLane == playerPos)
            {
                // in the left bracket value of collision distance to calculate from behind user
                // in the right bracket value of collision distance to calculate from infront of user
                if ((spikeDistance >= (cameraPos[2])) && (spikeDistance <= (cameraPos[2] + 2.5)))
                {
                    this.previousHitsLane.push(spikeLane);
                    this.previousHitsDistance.push(spikeDistance);
                    this.previousHitsTime.push(time);
                    this.scoremanager.LoseGame();
                    return true;
                }
            }
        }

        return false;
    }

    private drawSpike(lane : number, distance : number, playerPos : number, cameraPos : vec3, time : number) : void
    {
        // put obstacle in right place
        var spikeMat = mat4.clone(this.SpikesMat);

        mat4.translate(spikeMat, spikeMat, [0, 0.5, distance]);

        mat4.scale(spikeMat, spikeMat, [0.3, 0.3, 0.3]);

        if (lane == 0)  // left lane
        {
            mat4.translate(spikeMat, spikeMat, [6, 0, 0]);
        }
        else if (lane == 2) // right lane
        {
            mat4.translate(spikeMat, spikeMat, [-6, 0, 0]);
        }
        // else middle lane

        // if collided then don't draw
        if (!this.didCollide(lane, distance, playerPos, cameraPos, time))
        {
            this.SpikesProgram.use();
            this.SpikesProgram.setUniformMatrix4fv("MVP", false, spikeMat);
            this.SpikesProgram.setUniform4f("tint", [1, 1, 1, 1]);
            this.SpikesMesh.draw(this.gl.TRIANGLES);
        }
    }
}