import { KeyCode } from "cc"

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
        }
    }

    public static async updateUserData(data: Partial<UserData>): Promise<void> {
        this.userDataRef.update(data)
        this._userData = { ...this._userData, ...data }
    }
}
