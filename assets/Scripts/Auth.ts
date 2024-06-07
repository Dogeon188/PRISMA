import { KeyCode } from "cc"
import { Settings } from "./Scene/Settings"

export class Auth {
    private static _userDataRef: any = null

    private static get userDataRef(): any {
        if (!this._userDataRef) {
            this._userDataRef = firebase
                .database()
                .ref(`users/${firebase.auth().currentUser.uid}`)
        }
        return this._userDataRef
    }

    private static _userData: UserData = {
        keybinds: {
            jump: KeyCode.KEY_W,
            down: KeyCode.KEY_S,
            left: KeyCode.KEY_A,
            right: KeyCode.KEY_D,
            interact: KeyCode.KEY_E,
        },
        volumeSFX: 1,
        volumeBGM: 1,
        stage: 0,
        savepoint: 1,
    }

    public static get data(): UserData {
        return this._userData
    }

    public static set data(value: UserData) {
        this._userData = value
        this.userDataRef.set(value)
    }

    public static async loadUserData(): Promise<void> {
        const snapshot = await this.userDataRef.once("value")
        if (snapshot.exists()) {
            this._userData = snapshot.val()
            Settings.keybinds = this._userData.keybinds
            Settings.volumeSFX = this._userData.volumeSFX
            Settings.volumeBGM = this._userData.volumeBGM
        }
    }

    public static async updateUserData(data: Partial<UserData>): Promise<void> {
        this.userDataRef.update(data)
        this._userData = { ...this._userData, ...data }
    }
}
