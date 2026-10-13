import "./style.css";
import { k } from "./kaplayCtx";
import { registerMenuScene } from "./scenes/menu";
import { registerGameScene } from "./scenes/game";
import { registerGameOverScene } from "./scenes/gameover";

registerMenuScene();
registerGameScene();
registerGameOverScene();
k.go("menu");
