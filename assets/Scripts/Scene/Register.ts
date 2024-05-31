import { _decorator, AudioClip, Component, director, EditBox } from "cc"
import { AudioManager } from "../AudioManager"
import { Auth } from "../Auth"
import { SceneManager } from "../SceneManager"

const { ccclass, property } = _decorator

declare const firebase: any

@ccclass("Register")
export class Register extends Component {
    @property(AudioClip)
    private bgm: AudioClip = null

    @property({ type: EditBox })
    private email: EditBox = null

    @property({ type: EditBox })
    private username: EditBox = null

    @property({ type: EditBox })
    private password: EditBox = null

    protected onLoad(): void {
        AudioManager.inst.fadeInBGM(this.bgm, 0.5)
    }

    protected navigateToLogin(): void {
        AudioManager.inst.doNotReplayNextTime()
        director.loadScene("Login")
    }

    protected async register(): Promise<void> {
        const email = this.email.string
        const password = this.password.string
        const username = this.username.string
        const auth = firebase.auth()
        try {
            await auth.createUserWithEmailAndPassword(email, password)
            Auth.data = Auth.data // create & initialize default user data
            await auth.currentUser.updateProfile({
                displayName: username.toUpperCase(),
            })

            alert(`User ${auth.currentUser.displayName} created successfully`)
            SceneManager.loadScene("Start", true)
        } catch (error) {
            alert(error.message)
        }
    }
}
