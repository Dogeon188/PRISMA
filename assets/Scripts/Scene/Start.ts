import { _decorator, AudioClip, Button, Component, director, find } from "cc"
import { AudioManager } from "../AudioManager"
import { SceneManager } from "../SceneManager"
import { Auth } from "../Auth"
import { ToastManager } from "../Interface/ToastManager"
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
        this.loadStageOnUserData()
    }

    protected openSettings(): void {
        SceneManager.loadScene("Settings", true)
    }
    /**
     * Load the stage based on the stored user data.
     */
    private loadStageOnUserData(): void {
        switch (Auth.data.stage) {
            case 0:
                SceneManager.loadScene("LevelTest")
                break
            case 1:
                SceneManager.loadScene("LevelLobby")
                break
            case 2:
                SceneManager.loadScene("LevelLobby")
                break
            case 3:
                SceneManager.loadScene("LevelLobby")
                break
            default:
                SceneManager.loadScene("LevelTest")
                break
        }
    }
}
