import { AudioClip, Component, EditBox, _decorator, director } from "cc"
import { AudioManager } from "../AudioManager"

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

    protected login(): void {
        const email = this.email.string
        const password = this.password.string
        firebase
            .auth()
            .signInWithEmailAndPassword(email, password)
            .then((user) => {
                alert(
                    `User ${
                        firebase.auth().currentUser.displayName
                    } logged in successfully`,
                )
                director.loadScene("Start")
            })
            .catch((error) => {
                alert(error.message)
            })
    }
}
