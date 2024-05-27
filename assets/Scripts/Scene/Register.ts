import { _decorator, AudioClip, Component, director, EditBox } from "cc"
import { AudioManager } from "../AudioManager"

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

    protected register(): void {
        const email = this.email.string
        const password = this.password.string
        const username = this.username.string
        firebase
            .auth()
            .createUserWithEmailAndPassword(email, password)
            .then(() => {
                firebase
                    .auth()
                    .currentUser.updateProfile({
                        displayName: username.toUpperCase(),
                    })
                    .then(() => {
                        alert(
                            `User ${
                                firebase.auth().currentUser.displayName
                            } created successfully`,
                        )
                        director.loadScene("Start")
                    })
            })
            .catch((error) => {
                alert(error.message)
            })
    }
}
