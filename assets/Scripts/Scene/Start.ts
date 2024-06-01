import { _decorator, AudioClip, Button, Component, director, find } from "cc"
import { AudioManager } from "../AudioManager"
import { SceneManager } from "../SceneManager"
import { ToastManager } from "../Interface/ToastManager"
import { Toast } from "../Interface/Toast"
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
        find("ToastManager").getComponent(ToastManager).show("Start Game")
        AudioManager.inst.fadeOutBGM(1)
        //SceneManager.loadScene("LevelTest")
    }

    protected openSettings(): void {
        SceneManager.loadScene("Settings", true)
    }
}
