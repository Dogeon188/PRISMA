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
import { Auth } from "../Auth"
import { SceneManager } from "../SceneManager"
const { ccclass, property } = _decorator

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
    static keybinds: KeyBind = null

    //#region Properties

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

    private keybindCollided: { [key in keyof KeyBind]: boolean } = {
        jump: false,
        down: false,
        left: false,
        right: false,
        interact: false,
    }

    //#endregion

    //#region Lifecycle

    protected onLoad() {
        // back button
        this.backButton.node.on(Button.EventType.CLICK, this.saveAndLeave, this)
        // keybinds
        Settings.keybinds = Auth.data.keybinds

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

    private saveAndLeave(): void {
        Auth.updateUserData({ keybinds: Settings.keybinds })
        SceneManager.loadScene("Start", true)
    }

    //#endregion

    //#region Keybinds

    private onKeyUp(event: EventKeyboard): void {
        if (this.isChangingKeybind) {
            this.changeKeybind(this.isChangingKeybind, event.keyCode)
        }
    }

    private checkCollision(): void {
        for (const keyA in this.keybindCollided) {
            let collided = false
            for (const keyB in this.keybindCollided) {
                if (keyA === keyB) continue
                if (Settings.keybinds[keyA] === Settings.keybinds[keyB]) {
                    this.keybindCollided[keyA] = true
                    this.keybindCollided[keyB] = true
                    collided = true
                }
            }
            if (!collided) this.keybindCollided[keyA] = false
        }

        for (const key in this.keybindCollided) {
            const label = this.buttons[key].node
                .getChildByName("Label")
                .getComponent(Label)
            label.color = this.keybindCollided[key] ? Color.RED : Color.BLACK
        }

        this.backButton.interactable = !Object.values(
            this.keybindCollided,
        ).some((v) => v)
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
        this.checkCollision()

        this.isChangingKeybind = ""
    }
}
