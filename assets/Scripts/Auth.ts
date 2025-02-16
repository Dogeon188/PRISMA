import { KeyCode, log } from "cc"
import { Settings } from "./Scene/Settings"

export class Auth {
    private static _userDataRef: any = null

    private static _leaderboardDataRef: any = null

    private static get userDataRef(): any {
        if (!this._userDataRef) {
            this._userDataRef = firebase
                .database()
                .ref(`users/${firebase.auth().currentUser.uid}`)
        }
        return this._userDataRef
    }

    private static get leaderboardDataRef(): any {
        if (!this._leaderboardDataRef) {
            this._leaderboardDataRef = firebase
                .database()
                .ref(`leaderboard/${firebase.auth().currentUser.uid}`)
        }
        return this._leaderboardDataRef
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
        haloColor: 0,
        gemNum: {
            red: 0,
            green: 0,
            blue: 0,
        },
        time: 0,
        stoneList: [],
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
        // log("update user data")
        this.userDataRef.update(data)
        this._userData = { ...this._userData, ...data }
    }

    public static async updateLeaderboardData(
        data: leaderboardData,
    ): Promise<void> {
        this.leaderboardDataRef.set(data)
    }
}
