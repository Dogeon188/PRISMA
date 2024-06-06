import { _decorator, AudioClip, Button, Component } from "cc"
import { AudioManager } from "../AudioManager"
import { Auth } from "../Auth"
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
        this.settingsButton.node.on(
            Button.EventType.CLICK,
            this.openSettings,
            this,
        )
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
