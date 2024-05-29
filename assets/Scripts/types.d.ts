interface KeyBind {
    jump: import("cc").KeyCode
    down: import("cc").KeyCode
    left: import("cc").KeyCode
    right: import("cc").KeyCode
    interact: import("cc").KeyCode
}

interface UserData {
    keybinds: KeyBind
}

declare const firebase: any
