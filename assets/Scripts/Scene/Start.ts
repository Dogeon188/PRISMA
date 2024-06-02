import { _decorator, AudioClip, Button, Component, director, find } from "cc"
import { AudioManager } from "../AudioManager"
import { Toast } from "../Interface/Toast"
import { ToastManager } from "../Interface/ToastManager"
import { SceneManager } from "../SceneManager"
const { ccclass, property } = _decorator

@ccclass("Start")
export class Start extends Component {
    @property(AudioClip)
    private bgm: AudioClip = null

    @property(Button)
    private startButton: Button = null

    @property(Button)
    private settingsButton: Button = null

    protected onLoad(): void {
        AudioManager.inst.fadeInBGM(this.bgm, 1)
        this.startButton.node.on(Button.EventType.CLICK, this.startGame, this)
        this.settingsButton.node.on(Button.EventType.CLICK, this.openSettings, this)
    }

    protected startGame(): void {
        // find("Canvas/Toast").getComponent(Toast).setText("Start Game")
        // find("Canvas/Toast").getComponent(Toast).show(Toast.LENGTH_SHORT)
        ToastManager.inst.show("Start Game", Toast.LENGTH_SHORT)
        AudioManager.inst.fadeOutBGM(1)
        //SceneManager.loadScene("LevelTest")
    }

    protected openSettings(): void {
        SceneManager.loadScene("Settings", true)
    }
}
