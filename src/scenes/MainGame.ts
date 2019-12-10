import { Scene } from '../common/game';
import ShaderProgram from '../common/shader-program';
import Mesh from '../common/mesh';
import * as MeshUtils from '../common/mesh-utils';
import Camera from '../common/camera';
import FlyCameraController from '../common/camera-controllers/fly-camera-controller';
import { vec2, vec3, mat4 } from 'gl-matrix';
import { Vector, Selector } from '../common/dom-utils';
import { createElement, StatelessProps, StatelessComponent } from 'tsx-create-element';
import Road from '../common/road';
import Input from '../common/input';
import Player from '../common/Player';
import Coins from '../common/Coins';
import Obstacles from '../common/Obstacles';
import Spikes from '../common/Spikes';
import ScoreManager from '../common/ScoreManager';
import SkyBox from '../common/SkyBox';

export default class MainGame extends Scene {
    
    roadProgram: ShaderProgram;
    playerBodyprogram: ShaderProgram;
    playerHeadprogram: ShaderProgram;
    coinsprogram: ShaderProgram;
    obstaclesprogram : ShaderProgram;
    spikesprogram : ShaderProgram;
    skyBoxProgram : ShaderProgram;
    samplerCubeMap: WebGLSampler;
    time: number = 0;
    meshes: {[name: string]: Mesh} = {};
    textures: {[name: string]: WebGLTexture} = {};
    camera: Camera;
    controller: FlyCameraController;
    player :Player
    playerMat: mat4
    roadMat : mat4;
    road : Road;
    coins : Coins; 
    obstacles : Obstacles;
    spikes : Spikes;  
    scoremanager : ScoreManager;   
    skyBox : SkyBox;
    
    static readonly cubemapDirections = ['negx', 'negy', 'negz', 'posx', 'posy', 'posz']

    public load(): void {
        this.game.loader.load({
            ["RedColor.vert"]:{url:'shaders/RedColor.vert', type:'text'},
            ["RedColor.frag"]:{url:'shaders/RedColor.frag', type:'text'},
            ["BlueColor.vert"]:{url:'shaders/BlueColor.vert', type:'text'},
            ["BlueColor.frag"]:{url:'shaders/BlueColor.frag', type:'text'},
            ["GreenColor.vert"]:{url:'shaders/GreenColor.vert', type:'text'},
            ["GreenColor.frag"]:{url:'shaders/GreenColor.frag', type:'text'},
            ["RoboBody.vert"]:{url:'shaders/RoboBody.vert', type:'text'},
            ["RoboBody.frag"]:{url:'shaders/RoboBody.frag', type:'text'},
            ["RoboHead.vert"]:{url:'shaders/RoboHead.vert', type:'text'},
            ["RoboHead.frag"]:{url:'shaders/RoboHead.frag', type:'text'},
            ["skybox.vert"]:{url:'shaders/skybox.vert', type:'text'},
            ["skybox.frag"]:{url:'shaders/skybox.frag', type:'text'},
            ["Road.vert"]:{url:'shaders/Road.vert', type:'text'},
            ["Road.frag"]:{url:'shaders/Road.frag', type:'text'},
            ["RoadPlane"]:{url:'models/RoadPlane.obj', type:'text'},
            ["RoboBodyMesh"]:{url:'models/RoboBody.obj', type:'text'},
            ["RoboHeadMesh"]:{url:'models/RoboHead.obj', type:'text'},
            ["road-texture"]:{url:'images/Three_lane_road.png', type:'image'},
            ["RoboBody-texture"]:{url:'images/BodydiffMAP.jpg', type:'image'},
            ["RoboHead-texture"]:{url:'images/HEADdiffMAP.jpg', type:'image'},
            ...Object.fromEntries(MainGame.cubemapDirections.map(dir=>[dir, {url:`images/cubemappics/${dir}.jpg`, type:'image'}]))
        });
    } 
    
    public start(): void {
        /*******************************  Initializing all the Programs *******************************/

        this.roadProgram = new ShaderProgram(this.gl);
        this.roadProgram.attach(this.game.loader.resources["Road.vert"], this.gl.VERTEX_SHADER);
        this.roadProgram.attach(this.game.loader.resources["Road.frag"], this.gl.FRAGMENT_SHADER);
        this.roadProgram.link();

        this.playerBodyprogram = new ShaderProgram(this.gl);
        this.playerBodyprogram.attach(this.game.loader.resources["RoboBody.vert"], this.gl.VERTEX_SHADER);
        this.playerBodyprogram.attach(this.game.loader.resources["RoboBody.frag"], this.gl.FRAGMENT_SHADER);
        this.playerBodyprogram.link();

        this.playerHeadprogram = new ShaderProgram(this.gl);
        this.playerHeadprogram.attach(this.game.loader.resources["RoboHead.vert"], this.gl.VERTEX_SHADER);
        this.playerHeadprogram.attach(this.game.loader.resources["RoboHead.frag"], this.gl.FRAGMENT_SHADER);
        this.playerHeadprogram.link();

        this.coinsprogram = new ShaderProgram(this.gl);
        this.coinsprogram.attach(this.game.loader.resources["BlueColor.vert"], this.gl.VERTEX_SHADER);
        this.coinsprogram.attach(this.game.loader.resources["BlueColor.frag"], this.gl.FRAGMENT_SHADER);
        this.coinsprogram.link();

        this.obstaclesprogram = new ShaderProgram(this.gl);
        this.obstaclesprogram.attach(this.game.loader.resources["GreenColor.vert"], this.gl.VERTEX_SHADER);
        this.obstaclesprogram.attach(this.game.loader.resources["GreenColor.frag"], this.gl.FRAGMENT_SHADER);
        this.obstaclesprogram.link();

        this.spikesprogram = new ShaderProgram(this.gl);
        this.spikesprogram.attach(this.game.loader.resources["RedColor.vert"], this.gl.VERTEX_SHADER);
        this.spikesprogram.attach(this.game.loader.resources["RedColor.frag"], this.gl.FRAGMENT_SHADER);
        this.spikesprogram.link();

        this.skyBoxProgram = new ShaderProgram(this.gl);
        this.skyBoxProgram.attach(this.game.loader.resources["skybox.vert"], this.gl.VERTEX_SHADER);
        this.skyBoxProgram.attach(this.game.loader.resources["skybox.frag"], this.gl.FRAGMENT_SHADER);
        this.skyBoxProgram.link();

        /*******************************  Initializing the skybox *******************************/

        const target_directions = [
            this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
            this.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z
        ]

        
        /*******************************  Initializing all the models *******************************/
        
        this.meshes['road'] = MeshUtils.LoadOBJMesh(this.gl, this.game.loader.resources["RoadPlane"]);
        this.meshes['RoboBody'] = MeshUtils.LoadOBJMesh(this.gl, this.game.loader.resources["RoboBodyMesh"]);
        this.meshes['RoboHead'] = MeshUtils.LoadOBJMesh(this.gl, this.game.loader.resources["RoboHeadMesh"]);
        this.meshes['coin'] = MeshUtils.Sphere(this.gl);
        this.meshes['obstacle'] = MeshUtils.Sphere(this.gl);
        this.meshes['spike'] = MeshUtils.Sphere(this.gl);
        this.meshes['cubeMapMesh'] = MeshUtils.Cube(this.gl);
        
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
        
        this.textures['RoboBody'] = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures['RoboBody']);
        this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 4);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.game.loader.resources['RoboBody-texture']);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
        
        this.textures['RoboHead'] = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures['RoboHead']);
        this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 4);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.game.loader.resources['RoboHead-texture']);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
        
        this.textures['environment'] = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.textures['environment']);
        this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 4);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, false);
        for(let i = 0; i < 6; i++){
            this.gl.texImage2D(target_directions[i], 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.game.loader.resources[MainGame.cubemapDirections[i]]);
        }
        this.gl.generateMipmap(this.gl.TEXTURE_CUBE_MAP);
        
        this.samplerCubeMap = this.gl.createSampler();
        this.gl.samplerParameteri(this.samplerCubeMap, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.samplerParameteri(this.samplerCubeMap, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
        
        /*******************************  Initializing the Camera *******************************/
        
        this.camera = new Camera();
        this.camera.type = 'perspective';
        this.camera.position = vec3.fromValues(0,2.5,-2);
        this.camera.direction = vec3.fromValues(0,-0.75,0.63);
        this.camera.aspectRatio = this.gl.drawingBufferWidth/this.gl.drawingBufferHeight;
        
        /*******************************Initializing the player & score**********************************/
        this.player = new Player( this.playerBodyprogram, this.playerHeadprogram ,this.meshes['RoboBody'], this.meshes['RoboHead'] ,this.gl,this.game.input , this.textures['RoboBody'] ,this.textures['RoboHead']); 
        this.scoremanager = new ScoreManager();
        
        /*******************************Initializing the Coins & obstacles**********************************/
        // Just loading any positions for coins now but later should be loaded from file ?
        // for now just put coins everywhere
        
        this.coins = new Coins(this.gl, this.coinsprogram, this.meshes['coin'], this.scoremanager, this.player);
        this.obstacles = new Obstacles(this.gl, this.obstaclesprogram, this.meshes['obstacle'], this.scoremanager);
        this.spikes = new Spikes(this.gl, this.spikesprogram, this.meshes['spike'], this.scoremanager, this.player);
        
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
        
        this.skyBox = new SkyBox(this.gl , this.skyBoxProgram , this.samplerCubeMap , this.meshes['cubeMapMesh'] , this.textures['environment']);
        this.skyBox.drawSkyBox(this.camera); //Draw The SkyBox
        
        this.road = new Road(VP , this.roadProgram ,  this.textures['road'] ,this.meshes['road'] , this.gl , deltaTime );
        
        this.road.drawRoad(500 , this.camera.position);      // Draws Infinite Plane With X planes to be repeated
        
        this.camera.Move(600 , 0.3 , this.camera);  // Makes camera Move until distance X (calculated from origin) with speed Y
        
        this.player.Draw(VP,this.camera.getposition(), deltaTime);
        
        this.coins.Draw(deltaTime, VP, this.player.playerposition, this.camera.getposition(), this.time);
        this.obstacles.Draw(deltaTime, VP, this.player.playerposition, this.camera.getposition(), this.time);
        this.spikes.Draw(deltaTime, VP, this.player.playerposition, this.camera.getposition(), this.time);

        // Here should draw score ? NO not here but DOLA will do it by html and css

        }
    
    public end(): void {
        this.roadProgram.dispose();
        this.roadProgram = null;
        this.meshes['road'].dispose();
        this.meshes['road'] = null;
    }
    
}