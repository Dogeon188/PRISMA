import {
    _decorator,
    Button,
    Color,
    Component,
    EventKeyboard,
    Input,
    input,
    KeyCode,
    Label,
    Node,
} from "cc"
import { SceneManager } from "../SceneManager"
const { ccclass, property } = _decorator

interface KeyBind {
    jump: import("cc").KeyCode
    down: import("cc").KeyCode
    left: import("cc").KeyCode
    right: import("cc").KeyCode
    interact: import("cc").KeyCode
}

function getKeyCodeName(keyCode: KeyCode): string | null {
    if (
        (keyCode >= KeyCode.DIGIT_0 && keyCode <= KeyCode.DIGIT_9) ||
        (keyCode >= KeyCode.KEY_A && keyCode <= KeyCode.KEY_Z)
    )
        return String.fromCharCode(keyCode)
    if (keyCode in keyCodes) return keyCodes[keyCode]
    return null
}

const keyCodes = {
    [KeyCode.ALT_LEFT]: "⌥",
    [KeyCode.ALT_RIGHT]: "⌥",
    [KeyCode.CAPS_LOCK]: "⇪",
    [KeyCode.CTRL_LEFT]: "^",
    [KeyCode.CTRL_RIGHT]: "^",
    [KeyCode.SHIFT_LEFT]: "⇧",
    [KeyCode.SHIFT_RIGHT]: "⇧",
    [KeyCode.ARROW_DOWN]: "↓",
    [KeyCode.ARROW_LEFT]: "←",
    [KeyCode.ARROW_RIGHT]: "→",
    [KeyCode.ARROW_UP]: "↑",
    [KeyCode.BACKSPACE]: "⌫",
    // [KeyCode.DELETE]: "DEL",
    // [KeyCode.END]: "END",
    [KeyCode.ENTER]: "↵",
    // [KeyCode.HOME]: "HOME",
    // [KeyCode.INSERT]: "INS",
    [KeyCode.EQUAL]: "=",
    [KeyCode.DASH]: "-",
    [KeyCode.TAB]: "⇥",
    [KeyCode.SPACE]: "␣",
    [KeyCode.COMMA]: ",",
    [KeyCode.PERIOD]: ".",
    [KeyCode.SLASH]: "/",
    [KeyCode.SEMICOLON]: ";",
    [KeyCode.QUOTE]: "'",
    [KeyCode.BRACKET_LEFT]: "[",
    [KeyCode.BRACKET_RIGHT]: "]",
    [KeyCode.BACKSLASH]: "\\",
}

@ccclass("Settings")
export class Settings extends Component {
    static keybinds: KeyBind = {
        jump: KeyCode.KEY_W,
        down: KeyCode.KEY_S,
        left: KeyCode.KEY_A,
        right: KeyCode.KEY_D,
        interact: KeyCode.KEY_E,
    }

    @property(Button)
    private backButton: Button = null

    @property({ type: Button, group: "Keybinds" })
    private jumpButton: Button = null

    @property({ type: Button, group: "Keybinds" })
    private downButton: Button = null

    @property({ type: Button, group: "Keybinds" })
    private leftButton: Button = null

    @property({ type: Button, group: "Keybinds" })
    private rightButton: Button = null

    @property({ type: Button, group: "Keybinds" })
    private interactButton: Button = null

    private buttons: { [key in keyof KeyBind]: Button } = {
        jump: null,
        down: null,
        left: null,
        right: null,
        interact: null,
    }

    private isChangingKeybind: string = ""

    protected onLoad() {
        // back button
        this.backButton.node.on(Button.EventType.CLICK, () => {
            SceneManager.loadScene("Start", true)
        })
        // keybinds
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this)

        this.buttons.jump = this.jumpButton
        this.buttons.down = this.downButton
        this.buttons.left = this.leftButton
        this.buttons.right = this.rightButton
        this.buttons.interact = this.interactButton

        for (const key in Settings.keybinds) {
            const button = this.buttons[key]?.node as Node
            if (!button) continue
            const label = button.getChildByName("Label").getComponent(Label)
            label.string = getKeyCodeName(Settings.keybinds[key])
            button.on(
                Button.EventType.CLICK,
                () => {
                    this.isChangingKeybind = key
                    label.string = "..."
                    label.color = Color.RED
                },
                this,
            )
        }
    }

    private onKeyUp(event: EventKeyboard): void {
        if (this.isChangingKeybind) {
            this.changeKeybind(this.isChangingKeybind, event.keyCode)
        }
    }

    private changeKeybind(key: string, keyCode: KeyCode): void {
        const keyCodeName = getKeyCodeName(keyCode)
        if (!keyCodeName) return
        const label = this.buttons[key].node
        .getChildByName("Label")
        .getComponent(Label)
        
        Settings.keybinds[key] = keyCode
        label.string = keyCodeName
        label.color = Color.BLACK

        // TODO keybind collision check
        this.isChangingKeybind = ""
    }
}
