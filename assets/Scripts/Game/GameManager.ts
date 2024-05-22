import { _decorator, AudioClip, Component } from "cc"
import { AudioManager } from "../AudioManager"
import { SceneManager } from "../SceneManager"
const { ccclass, property } = _decorator

@ccclass("GameManager")
export class GameManager extends Component {
    @property(AudioClip)
    bgm: AudioClip = null

    protected onLoad(): void {
        AudioManager.inst.fadeInBGM(this.bgm, 1)
    }

    backToStart(): void {
        AudioManager.inst.fadeOutBGM(1)
        SceneManager.loadScene("Start")
    }
}
