import { _decorator, AudioClip, Button, Component, director } from "cc"
import { AudioManager } from "../AudioManager"
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
        AudioManager.inst.fadeOutBGM(1)
        SceneManager.loadScene("LevelTest")
    }

    protected openSettings(): void {
        SceneManager.loadScene("Settings", true)
    }
}
