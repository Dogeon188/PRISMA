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
}

declare const firebase: any
