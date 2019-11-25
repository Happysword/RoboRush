import { Scene } from '../common/game';
import ShaderProgram from '../common/shader-program';
import Mesh from '../common/mesh';
import * as MeshUtils from '../common/mesh-utils';
import Camera from '../common/camera';
import FlyCameraController from '../common/camera-controllers/fly-camera-controller';
import { vec3, mat4 } from 'gl-matrix';
import { Vector, Selector } from '../common/dom-utils';
import { createElement, StatelessProps, StatelessComponent } from 'tsx-create-element';
import Road from '../common/road';
import Input from '../common/input';

export default class MainGame extends Scene {
    
    roadProgram: ShaderProgram;

    time: number = 0;
    meshes: {[name: string]: Mesh} = {};
    textures: {[name: string]: WebGLTexture} = {};
    camera: Camera;
    controller: FlyCameraController;

    roadMat : mat4;
    road : Road;

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
        this.meshes['player'] = MeshUtils.Sphere(this.gl);

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
        this.camera.position = vec3.fromValues(0,2.5,-2);
        this.camera.direction = vec3.fromValues(0,-0.75,0.63);
        this.camera.aspectRatio = this.gl.drawingBufferWidth/this.gl.drawingBufferHeight;
        
        /*******************************  Initializing camera controller (only for testing will be removed) *******************************/

        this.controller = new FlyCameraController(this.camera, this.game.input);
        this.controller.movementSensitivity = 0.005;

        /*******************************  Clearing Screen With Color *******************************/

        this.gl.clearColor(0.1,0.1,0.1,1);

        /*******************************  Enabling Depth and Back-Face Culling *******************************/

        this.gl.enable(this.gl.CULL_FACE);
        this.gl.cullFace(this.gl.BACK);
        this.gl.frontFace(this.gl.CCW);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);

    }
    
    public draw(deltaTime: number): void {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        let VP = this.camera.ViewProjectionMatrix; // Universal View-Projection Matrix (Constant Through The Whole Game)
        this.time += deltaTime / 1000;             // Time in seconds we use delta time to be consitant on all computers 

        this.controller.update(deltaTime); //Only For testing purposes (will be removed) , it update control camera with mouse
        
        this.road = new Road(VP , this.roadProgram ,  this.textures['road'] ,this.meshes['road'] , this.gl , deltaTime );
        
        this.road.drawRoad(100);      // Draws Infinite Plane With X planes to be repeated
        
        this.camera.Move(600 , 0.3 , this.camera);  // Makes camera Move until distance X (calculated from origin) with speed Y
    }
    
    public end(): void {
        this.roadProgram.dispose();
        this.roadProgram = null;
        this.meshes['road'].dispose();
        this.meshes['road'] = null;
    }
    
}