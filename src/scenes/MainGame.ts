import { Scene } from '../common/game';
import ShaderProgram from '../common/shader-program';
import Mesh from '../common/mesh';
import * as MeshUtils from '../common/mesh-utils';
import * as TextureUtils from '../common/texture-utils';
import Camera from '../common/camera';
import { vec2, vec3, mat4, vec4 } from 'gl-matrix';
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
import inputFileManager from '../common/inputFileManager';
import {Howl, Howler} from 'howler';

var sound = new Howl({
    src: ['star-wars-main-theme.mp3'],
    autoplay: true,
    loop: true,
    volume: 0.5,
  });

export default class MainGame extends Scene {
    
    textureProgram : ShaderProgram;
    roadProgram: ShaderProgram;
    playerBodyprogram: ShaderProgram;
    playerHeadprogram: ShaderProgram;
    skyBoxProgram : ShaderProgram;
    samplerCubeMap: WebGLSampler;
    time: number = 0;
    meshes: {[name: string]: Mesh} = {};
    textures: {[name: string]: WebGLTexture} = {};
    camera: Camera;
    player :Player
    playerMat: mat4
    roadMat : mat4;
    road : Road;
    coins : Coins; 
    obstacles : Obstacles;
    spikes : Spikes;  
    scoremanager : ScoreManager;   
    skyBox : SkyBox;
    ifm : inputFileManager;
    obstaclesArray: number[][];
    scoreStaticCounter: number = 0;
    // Variables to decide obstacles in scene
    obstaclesOffset : number = 28; // where obstacles start from
    distanceBetweenObstacles : number = 10; // distance between obstacles rows in scene
    loseCount: number = 0;
    lightDir:vec3;
    static readonly cubemapDirections = ['negx', 'negy', 'negz', 'posx', 'posy', 'posz']

    public load(): void {
        this.game.loader.load({
            ["texture.vert"]:{url:'shaders/texture.vert', type:'text'},
            ["texture.frag"]:{url:'shaders/texture.frag', type:'text'},
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
            ["spikesMesh"]:{url:'models/spikes.obj', type:'text'},
            ["wrenchMesh"]:{url:'models/wrenches.obj', type:'text'},
            ["barrelMesh"]:{url:'models/barrels.obj', type:'text'},
            ["road-texture"]:{url:'images/Three_lane_road.png', type:'image'},
            ["spikes-texture"]:{url:'images/spikes-texture.jpg', type:'image'},
            ["RoboBody-texture"]:{url:'images/BodydiffMAP.jpg', type:'image'},
            ["RoboHead-texture"]:{url:'images/HEADdiffMAP.jpg', type:'image'},
            ["wrench-texture"]:{url:'images/wrenches.jpg', type:'image'},
            ["barrel-texture"]:{url:'images/barrel.png', type:'image'},
            ["inputFile.txt"]:{url:'inputFile.txt', type:'text'},
            ...Object.fromEntries(MainGame.cubemapDirections.map(dir=>[dir, {url:`images/cubemappics/${dir}.jpg`, type:'image'}]))
        });
    } 
    
    public start(): void {

        /*******************************  Load Files *******************************/
        
        this.ifm = new inputFileManager(this.game.loader.resources["inputFile.txt"]);
        this.obstaclesArray = this.ifm.getArray();
        this.distanceBetweenObstacles = this.ifm.getObstaclesDistance();
        this.lightDir = this.ifm.getLightDir();
        console.log(this.lightDir[0]);
        /*******************************  Initializing all the Programs *******************************/
        
        this.textureProgram = new ShaderProgram(this.gl);
        this.textureProgram.attach(this.game.loader.resources["texture.vert"], this.gl.VERTEX_SHADER);
        this.textureProgram.attach(this.game.loader.resources["texture.frag"], this.gl.FRAGMENT_SHADER);
        this.textureProgram.link();

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
        this.meshes['spikes'] = MeshUtils.LoadOBJMesh(this.gl, this.game.loader.resources["spikesMesh"]);
        this.meshes['wrench'] = MeshUtils.LoadOBJMesh(this.gl, this.game.loader.resources["wrenchMesh"]);
        this.meshes['barrel'] = MeshUtils.LoadOBJMesh(this.gl, this.game.loader.resources["barrelMesh"]);
        this.meshes['cubeMapMesh'] = MeshUtils.Cube(this.gl);
        
        /*******************************  Initializing all the textures *******************************/
        this.textures['road'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['road-texture']);
        this.textures['RoboBody'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['RoboBody-texture']);
        this.textures['RoboHead'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['RoboHead-texture']);
        this.textures['spikes'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['spikes-texture']);
        this.textures['wrench'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['wrench-texture']);
        this.textures['barrel'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['barrel-texture']);
        
        this.textures['environment'] = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.textures['environment']);
        this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 4);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, false);
        for(let i = 0; i < 6; i++){
            this.gl.texImage2D(target_directions[i], 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.game.loader.resources[MainGame.cubemapDirections[i]]);
        }
        this.gl.generateMipmap(this.gl.TEXTURE_CUBE_MAP);
        
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
        
        this.spikes = new Spikes(this.gl, this.textureProgram, this.meshes['spikes'], this.scoremanager, this.player , this.textures['spikes'], this.obstaclesArray, this.distanceBetweenObstacles);
        this.coins = new Coins(this.gl, this.textureProgram, this.meshes['wrench'], this.scoremanager, this.player , this.textures['wrench'], this.obstaclesArray, this.distanceBetweenObstacles);
        this.obstacles = new Obstacles(this.gl, this.textureProgram, this.meshes['barrel'], this.scoremanager , this.textures['barrel'], this.obstaclesArray, this.distanceBetweenObstacles);
    

        /*******************************  Clearing Screen With Color *******************************/
        
        this.gl.clearColor(0.1,0.1,0.1,1);
        
        /*******************************  Enabling Depth and Back-Face Culling *******************************/
        
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.cullFace(this.gl.BACK);
        this.gl.frontFace(this.gl.CCW);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
     
    }
    
    public draw(deltaTime: number): void 
    {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        
        
        let VP = this.camera.ViewProjectionMatrix; // Universal View-Projection Matrix (Constant Through The Whole Game)
        
        if(!this.scoremanager.Lose)
        {
            this.time += deltaTime / 1000;             // Time in seconds we use delta time to be consitant on all computers 
        }
        
        
        let lightDir = vec3.fromValues(-0.4,-0.8,0.5);  //Direction of the directional light best values for current scene are vec3(-0.4,-0.8,0.5)
        this.road = new Road(VP , this.roadProgram ,  this.textures['road'] ,this.meshes['road'] , this.gl , deltaTime);
        this.road.drawRoad(500 , this.camera.position , this.lightDir);      // Draws Infinite Plane With X planes to be repeated
        
        if(!this.scoremanager.Lose)
        {
            this.camera.Move(20 + this.obstaclesArray.length * this.distanceBetweenObstacles , 0.05 + (this.time/1000) , this.camera, this.ifm, this.coins, this.obstacles, this.spikes);  // Makes camera Move until distance X (calculated from origin) with speed Y
        }
        else
        {
            this.ctx.font = "70px Star Jedi";
            this.ctx.fillStyle = "yellow";
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            this.ctx.textAlign = "center";
            this.ctx.fillText("GAME ovER!", this.ctx.canvas.width/2, this.ctx.canvas.height/2);
            this.ctx.font = "40px Star Jedi";
            this.ctx.fillStyle = "yellow";
            this.ctx.textAlign = "center";
            this.ctx.fillText("Back to main menu...", this.ctx.canvas.width/2, this.ctx.canvas.height/1.5);
            
            this.scoreStaticCounter = 0;
            this.loseCount++;
            if(this.loseCount >= 200)
            {
                window.location.href = "mainmenu.html";
            }
        }
        
        this.player.Draw(VP,this.camera.getposition(), deltaTime , this.scoremanager.Lose , this.lightDir);
        
        this.coins.Draw(deltaTime, VP, this.player.playerposition, this.camera.getposition(), this.time, this.obstaclesOffset , this.lightDir);
        this.obstacles.Draw(deltaTime, VP, this.player.playerposition, this.camera.getposition(), this.time, this.obstaclesOffset , this.lightDir);
        this.spikes.Draw(deltaTime, VP, this.player.playerposition, this.camera.getposition(), this.time, this.obstaclesOffset , this.lightDir);
        
        this.skyBox = new SkyBox(this.gl , this.skyBoxProgram , this.samplerCubeMap , this.meshes['cubeMapMesh'] , this.textures['environment']);
        this.skyBox.drawSkyBox(this.camera); //Draw The SkyBox

        this.ctx.font = "55px Star Jedi";
        this.ctx.fillStyle = "yellow";
        if(!this.scoremanager.Lose)
        {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        }
        this.ctx.textAlign = "center";
        this.ctx.fillText("SCoRE " + (this.scoremanager.Score + Math.floor( this.time * 2 )), this.ctx.canvas.width/2, 50);
        this.scoreStaticCounter = 0;

    }
    
    public end(): void {
        this.roadProgram.dispose();
        this.roadProgram = null;
        this.meshes['road'].dispose();
        this.meshes['road'] = null;
    }
    
}