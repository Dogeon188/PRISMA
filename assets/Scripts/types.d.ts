interface KeyBind {
    jump: import("cc").KeyCode
    down: import("cc").KeyCode
    left: import("cc").KeyCode
    right: import("cc").KeyCode
    interact: import("cc").KeyCode
}

interface UserData {
    keybinds: KeyBind
    volumeSFX: number
    volumeBGM: number
    stage: number
    savepoint: number
    haloColor: number
}

type Uuid = string

declare const firebase: any
