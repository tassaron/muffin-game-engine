import * as PIXI from "pixi.js";
import { logger } from "./logger";
import IGame from "./interfaces/IGame";
import IGameContainers from "./interfaces/IGameContainers";
import IGameState from "./interfaces/IGameState";
import IKeyboard from "./interfaces/IKeyboard";
import IScene from "./interfaces/IScene";
import MenuScene from "./scenes/MenuScene";
import PauseScene from "./scenes/PauseScene";
//import { newContainer } from "./lib";
//import { GameOverScene } from "./scenes/gameover.js";


export class Game implements IGame {
    _app: PIXI.Application;
    renderer: PIXI.AbstractRenderer;
    width: number;
    height: number;
    sprites: any;
    containers: IGameContainers;
    state: IGameState;
    scene: IScene;
    prevScene: IScene;

    constructor(app: PIXI.Application, sprites: any, keyboard: any) {
        this._app = app;
        this.renderer = app.renderer;
        this.sprites = sprites;
        this.width = app.view.width;
        this.height = app.view.height;

        this.containers = {
            root: app.stage,
        };

        this.state = {
            flags: {
                gameOver: false,
                paused: false,
            },
            functions: {
                tick: this.playTick,
            },
        };

        logger.info(`Game created with dimensions ${this.width}x${this.height}`);
        
        this.scene = new MenuScene(this);
        this.prevScene = this.scene;

        app.ticker.add((delta) => this.state.functions.tick(this, delta, keyboard));
    };

    playTick(self: IGame, delta: number, keyboard: IKeyboard) {
        logger.spam(`Delta: ${delta}`);
        keyboard.tick(delta);
        self.scene.tick(delta, keyboard);
        if (keyboard.p) self.pause();
    }

    pauseTick(self: IGame, delta: number, keyboard: IKeyboard) {
        keyboard.tick(delta);
        if (keyboard.p) {
            keyboard.disable(100.0);
            self.state.flags.paused = false;
            self.state.functions.tick = self.playTick;
            self.changeScene(self.prevScene);
        }
    }

    changeScene(scene: IScene) {
        let prevScene = this.scene;
        this.prevScene = prevScene;
        this.scene = scene;
    }

    gameOver() {
        if (!this.state.flags.gameOver) {
            //this.changeScene(new GameOverScene(this));
        }
    }

    pause() {
        if (!this.state.flags.gameOver) {
            this.state.flags.paused = !this.state.flags.paused;
        }
        if (!this.state.flags.paused) {
            logger.error("Unpaused while not paused.");
            return;
        }
        this.changeScene(new PauseScene(this));
        this.state.functions.tick = this.pauseTick;
    }
}