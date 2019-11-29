import { vec2, vec3, mat4 } from 'gl-matrix';
import ShaderProgram from './shader-program';
import Mesh from '../common/mesh';
import Collider from './colliders';
import ScoreManager from './ScoreManager';

export default class Obstacles extends Collider {

    obstaclesMat : mat4;
    ObstaclesProgram : ShaderProgram;
    ObstaclesTexture : WebGLTexture;
    ObstaclesMesh : Mesh;
    previousHitsLane : number[];
    previousHitsDistance : number[];
    previousHitsTime : number[];
    scoremanager : ScoreManager;
    
    public constructor (GL : WebGL2RenderingContext, obstaclesprogram : ShaderProgram, obstaclesmesh : Mesh, scoresManager : ScoreManager)
    {
        super(GL);
        this.ObstaclesProgram = obstaclesprogram;
        this.ObstaclesMesh = obstaclesmesh;
        this.previousHitsLane = new Array<number>();
        this.previousHitsDistance = new Array<number>();
        this.previousHitsTime = new Array<number>();
        this.scoremanager = scoresManager;
    }

    public Draw (deltaTime: number, VP : mat4, playerPos : number, cameraPos : vec3, time : number)
    {
        this.obstaclesMat = mat4.clone(VP);

        for (var i = 0; i < 500; i += 5)
        {
            // Draw all obstacles here should put (Lane of obstacle, distance of obstacle, leave the rest as is)
            // Lane of obstacle 0=>left lane, 1=>middle lane, 2=>right lane 
            this.drawObstacle(0, i, playerPos, cameraPos, time);
            this.drawObstacle(2, i, playerPos, cameraPos, time);
        }
    }

    public didCollide(obstacleLane : number, obstacleDistance : number, playerPos : number, cameraPos : vec3, time : number) : boolean
    {
        // First check if object collided with player before
        // if collided then don't draw for 5 seconds (5=>respawn time)
        if (this.previousHitsDistance.includes(obstacleDistance))
        {
            var index = this.previousHitsDistance.indexOf(obstacleDistance);
            if (this.previousHitsLane[index] == obstacleLane)
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
        if (obstacleLane == playerPos)
        {
            // in the left bracket value of collision distance to calculate from behind user
            // in the right bracket value of collision distance to calculate from infront of user
            if ((obstacleDistance >= (cameraPos[2])) && (obstacleDistance <= (cameraPos[2] + 2.5)))
            {
                this.previousHitsLane.push(obstacleLane);
                this.previousHitsDistance.push(obstacleDistance);
                this.previousHitsTime.push(time);
                this.scoremanager.LoseGame();
                return true;
            }
        }

        return false;
    }

    private drawObstacle(lane : number, distance : number, playerPos : number, cameraPos : vec3, time : number) : void
    {
        // put obstacle in right place
        var obstacleMat = mat4.clone(this.obstaclesMat);

        mat4.translate(obstacleMat, obstacleMat, [0, 0.5, distance]);

        mat4.scale(obstacleMat, obstacleMat, [0.3, 0.3, 0.3]);

        if (lane == 0)  // left lane
        {
            mat4.translate(obstacleMat, obstacleMat, [6, 0, 0]);
        }
        else if (lane == 2) // right lane
        {
            mat4.translate(obstacleMat, obstacleMat, [-6, 0, 0]);
        }
        // else middle lane

        // if collided then don't draw
        if (!this.didCollide(lane, distance, playerPos, cameraPos, time))
        {
            this.ObstaclesProgram.use();
            this.ObstaclesProgram.setUniformMatrix4fv("MVP", false, obstacleMat);
            this.ObstaclesProgram.setUniform4f("tint", [1, 1, 1, 1]);
            this.ObstaclesMesh.draw(this.gl.TRIANGLES);
        }
    }
}