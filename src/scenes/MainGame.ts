import { Scene } from '../common/game';
import ShaderProgram from '../common/shader-program';
import Mesh from '../common/mesh';
import * as MeshUtils from '../common/mesh-utils';
import Camera from '../common/camera';
import FlyCameraController from '../common/camera-controllers/fly-camera-controller';
import { vec3, mat4 } from 'gl-matrix';
import { Vector, Selector } from '../common/dom-utils';
import { createElement, StatelessProps, StatelessComponent } from 'tsx-create-element';

export default class MainGame extends Scene {
    
    time: number = 0;
    roadTimer : number = 0;
    roadProgram: ShaderProgram;
    meshes: {[name: string]: Mesh} = {};
    textures: {[name: string]: WebGLTexture} = {};
    camera: Camera;
    controller: FlyCameraController;

    roadMat : mat4;

    public load(): void {
        this.game.loader.load({
            ["RedColor.vert"]:{url:'shaders/RedColor.vert', type:'text'},
            ["RedColor.frag"]:{url:'shaders/RedColor.frag', type:'text'},
            ["Road.vert"]:{url:'shaders/Road.vert', type:'text'},
            ["Road.frag"]:{url:'shaders/Road.frag', type:'text'},
            ["RoadPlane"]:{url:'models/RoadPlane.obj', type:'text'},
            ["road-texture"]:{url:'images/Three_lane_road.png', type:'image'}
        });
    } 
    
    public start(): void {
        /*******************************  Initializing all the Programs *******************************/

        this.roadProgram = new ShaderProgram(this.gl);
        this.roadProgram.attach(this.game.loader.resources["Road.vert"], this.gl.VERTEX_SHADER);
        this.roadProgram.attach(this.game.loader.resources["Road.frag"], this.gl.FRAGMENT_SHADER);
        this.roadProgram.link();

        /*******************************  Initializing all the models *******************************/

        this.meshes['road'] = MeshUtils.LoadOBJMesh(this.gl, this.game.loader.resources["RoadPlane"]);

        /*******************************  Initializing all the textures *******************************/

        this.textures['road'] = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures['road']);
        this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 4);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.game.loader.resources['road-texture']);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);

        /*******************************  Initializing the Camera *******************************/

        this.camera = new Camera();
        this.camera.type = 'perspective';
        this.camera.position = vec3.fromValues(0,2,-2);
        this.camera.direction = vec3.fromValues(0,-0.5,1);
        this.camera.aspectRatio = this.gl.drawingBufferWidth/this.gl.drawingBufferHeight;
        
        /*******************************  Initializing camera controller (only for testing will be removed) *******************************/

        this.controller = new FlyCameraController(this.camera, this.game.input);
        this.controller.movementSensitivity = 0.005;

        /*******************************  Clearing Screen With Color *******************************/

        this.gl.clearColor(0.1,0.1,0.1,1);

    }
    
    public draw(deltaTime: number): void {
        let VP = this.camera.ViewProjectionMatrix; // Universal View-Projection Matrix (Constant Through The Whole Game)
        this.time += deltaTime / 1000;             // Time in seconds we use delta time to be consitant on all computers 

        this.controller.update(deltaTime); //Only For testing purposes (will be removed)

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        
        this.roadProgram.use();

        let M = mat4.identity(mat4.create());
        
        //To Do draw infinite plane with time
        this.DrawRoad(VP); 

    }
    
    public end(): void {
        this.roadProgram.dispose();
        this.roadProgram = null;
        this.meshes['road'].dispose();
        this.meshes['road'] = null;
    }

    public DrawRoad(VP : mat4) : mat4
    {
        // Here we draw 2 planes as a start

        // Start of first plane
        let roadMat = mat4.clone(VP);
        mat4.rotateY(roadMat,roadMat, -90 * Math.PI / 180)
        mat4.scale(roadMat, roadMat, [3, 1, 3]);

        this.roadProgram.setUniformMatrix4fv("MVP", false, roadMat);
        this.roadProgram.setUniform4f("tint", [1, 1, 1, 1]);

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures['road']);
        this.roadProgram.setUniform1i('texture_sampler', 0);

        this.meshes['road'].draw(this.gl.TRIANGLES);

        // Start of second plane
        mat4.translate(roadMat , roadMat , [2,0,0]);                     // increment x by 2 (distance between 2 planes)

        this.roadProgram.setUniformMatrix4fv("MVP", false, roadMat);
        this.roadProgram.setUniform4f("tint", [1, 1, 1, 1]);

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures['road']);
        this.roadProgram.setUniform1i('texture_sampler', 0);

        this.meshes['road'].draw(this.gl.TRIANGLES);

        //ToDo draw after n time

        return roadMat;
    }

}