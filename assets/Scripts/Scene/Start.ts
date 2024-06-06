import { _decorator, AudioClip, Component } from "cc"
import { AudioManager } from "../AudioManager"
import { Auth } from "../Auth"
import { ToastManager } from "../Interface/ToastManager"
import { SceneManager } from "../SceneManager"
const { ccclass, property } = _decorator

@ccclass("Start")
export class Start extends Component {
    @property(AudioClip)
    private bgm: AudioClip = null

    protected onLoad(): void {
        AudioManager.inst.fadeInBGM(this.bgm, 1)
    }

    protected startGame(): void {
        AudioManager.inst.fadeOutBGM(1)
        this.loadStageOnUserData()
    }

    protected openSettings(): void {
        SceneManager.loadScene("Settings", true)
    }

    protected logOut(): void {
        firebase
            .auth()
            .signOut()
            .then(() => SceneManager.loadScene("Splash", true))
            .catch((error) => {
                ToastManager.show("Sign-out failed.")
                console.error(error)
            })
    }

    /**
     * Load the stage based on the stored user data.
     */
    private loadStageOnUserData(): void {
        switch (Auth.data.stage) {
            case -1: // debug
                SceneManager.loadScene("LevelTest")
            default: // normal
                SceneManager.loadScene("LevelLobby")
                break
        }
    }
}
