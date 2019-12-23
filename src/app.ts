// Here, we import the things we need from other script files 
import Game from './common/game';
import MainGame from './scenes/MainGame';

// First thing we need is to get the canvas on which we draw our scenes


// Then we create an instance of the game class and give it the canvas

/*the game won't start till the window is loaded (the window contains the document which contains both canvas elements) */
window.addEventListener('load', function ()     
{
    const canvas: HTMLCanvasElement = document.querySelector("#app");
    const overCanvas: HTMLCanvasElement = document.querySelector("#overCanvas");
 
    (document as any).fonts.load('55px Star Jedi').then(startGame());   /*wait till the fonts file loads*/

    function startGame()
    {
        const game = new Game(canvas , overCanvas);

        // Here we list all our scenes and our initial scene
        const scenes = {
            "MainGame": MainGame,
        };
        const initialScene = "MainGame";

        // Then we add those scenes to the game object and ask it to start the initial scene
        game.addScenes(scenes);
        game.startScene(initialScene);
        (document.querySelector("#app") as any).focus();    /*Set the focus on the game canvas */
    }
    
});
window.addEventListener("click", function(event) {
    (document.querySelector("#app") as any).focus();        /**if the user clicked any where on the window the game canvas will get the focus */
});

/*// Here we setup a selector element to switch scenes from the webpage
const selector: HTMLSelectElement = document.querySelector("#scenes");
for(let name in scenes){
    let option = document.createElement("option");
    option.text = name;
    option.value = name;
    selector.add(option);
}
selector.value = initialScene;
selector.addEventListener("change", ()=>{
    game.startScene(selector.value);
});*/