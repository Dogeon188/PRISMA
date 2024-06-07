import { AudioClip, Component, EditBox, _decorator, director } from "cc"
import { AudioManager } from "../AudioManager"
import { Auth } from "../Auth"
import { ToastManager } from "../Interface/ToastManager"
import { SceneManager } from "../SceneManager"

const { ccclass, property } = _decorator

declare const firebase: any

@ccclass("Login")
export class Login extends Component {
    @property(AudioClip)
    private bgm: AudioClip = null

    @property({ type: EditBox })
    private email: EditBox = null

    @property({ type: EditBox })
    private password: EditBox = null

    protected onLoad(): void {
        AudioManager.inst.fadeInBGM(this.bgm, 0.5)
    }

    protected navigateToRegister(): void {
        AudioManager.inst.doNotReplayNextTime()
        director.loadScene("Register")
    }

    protected async login(): Promise<void> {
        const email = this.email.string
        const password = this.password.string

        const auth = firebase.auth()
        auth.signInWithEmailAndPassword(email, password)
            .then(async () => {
                await Auth.loadUserData() // load user data from realtime database after successful login
                ToastManager.show(
                    `Welcome back, ${auth.currentUser.displayName}!`,
                )
                AudioManager.inst.doNotReplayNextTime()
                this.scheduleOnce(
                    () => SceneManager.loadScene("Start", true),
                    2,
                )
            })
            .catch((error: any) => {
                console.error(error)
                ToastManager.show(
                    "Failed to login, please check your email and password.",
                )
            })
    }
}
