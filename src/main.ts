import "./style.css";
import { k } from "./kaplayCtx";
import { registerGameScene } from "./scenes/game";

registerGameScene();
k.go("game");
