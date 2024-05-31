import { AudioClip, Component, EditBox, _decorator, director } from "cc"
import { AudioManager } from "../AudioManager"
import { Auth } from "../Auth"
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

        try {
            const auth = firebase.auth()
            await auth.signInWithEmailAndPassword(email, password)

            await Auth.loadUserData() // load user data from realtime database after successful login
            alert(`User ${auth.currentUser.displayName} logged in successfully`)
            SceneManager.loadScene("Start", true)
        } catch (error) {
            alert(error.message)
        }
    }
}
