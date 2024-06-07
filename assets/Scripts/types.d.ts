interface KeyBind {
    jump: import("cc").KeyCode
    down: import("cc").KeyCode
    left: import("cc").KeyCode
    right: import("cc").KeyCode
    interact: import("cc").KeyCode
}

interface GemNum {
    red: number
    green: number
    blue: number
}

interface UserData {
    keybinds: KeyBind
    volumeSFX: number
    volumeBGM: number
    stage: number
    savepoint: number
    haloColor: number
    gemNum: GemNum
    time: number
}

interface leaderboardData {
    username: string
    time: number
    gameProgress: number
}

type Uuid = string

declare const firebase: any
