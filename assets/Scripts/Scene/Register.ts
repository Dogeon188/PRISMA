import { _decorator, AudioClip, Component, director, EditBox } from "cc"
import { AudioManager } from "../AudioManager"
import { Auth } from "../Auth"
import { ToastManager } from "../Interface/ToastManager"
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
        auth.createUserWithEmailAndPassword(email, password)
            .then(async () => {
                Auth.data = Auth.data // create & initialize default user data
                await auth.currentUser.updateProfile({
                    displayName: username.toUpperCase(),
                })
                // console.log(Auth.data)
                Auth.updateUserData({
                    stage: 0,
                    savepoint: 1,
                    haloColor: 0,
                    gemNum: {
                        red: 0,
                        green: 0,
                        blue: 0,
                    },
                    time: 0,
                    stoneList: [],
                })
                // console.log("TTT")

                ToastManager.show("Successfully registered!")
                SceneManager.loadScene("Start", true)
            })
            .catch((error: any) => {
                console.error(error)
                ToastManager.show("Failed to register, please try again.")
            })
    }
}
