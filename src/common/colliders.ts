import { vec3, mat4 } from 'gl-matrix';

//This is the abstract base of all objects that collide with player
export default abstract class Collider {
    gl: WebGL2RenderingContext;
    public constructor(GL : WebGL2RenderingContext){
        this.gl = GL;
    }

    public abstract didCollide(ColliderLane : number, ColliderDistance : number, playerPos : number, cameraPos : vec3, time : number): boolean; // Here we will check if the player hit this object or not
    public abstract Draw(deltaTime: number, VP : mat4, playerPos : number, cameraPos : vec3, time : number): void; // Here will draw the object
}