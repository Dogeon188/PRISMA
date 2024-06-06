import {
    _decorator,
    Component,
    KeyCode,
    Label,
    log,
    tween,
    UIOpacity,
} from "cc"
import { getKeyCodeName } from "../Scene/Settings"
const { ccclass, property } = _decorator

@ccclass("InteractPrompt")
export class InteractPrompt extends Component {
    private isPlaying: boolean = false

    @property(Label)
    private keyCode: Label = null

    @property(Label)
    private rightDescription: Label = null

    /**
     * Will show a prompt with the given keyCode and text \
     * like "Press [E] to interact"
     */
    showPrompt(keyCode: KeyCode, text: string, then?: Function): void {
        this.setText(keyCode, text)
        if (!this.isPlaying) {
            this.node.active = true
            this.isPlaying = true
        } else {
            log("is already playing")
        }
    }
    /**
     * Will hide the prompt with easing effect
     */
    hidePrompt(): void {
        if (this.isPlaying) {
            const uiOpacity = this.node.getComponent(UIOpacity)
            tween(uiOpacity)
                .to(0.2, { opacity: 0 })
                .call(() => {
                    this.node.active = false
                    this.isPlaying = false
                    uiOpacity.opacity = 255
                })
                .start()
        }
    }

    //#region Private Methods

    protected onLoad(): void {
        this.node.active = false
        this.scheduleOnce(() => {
            this.keyCode.string = ""
            this.rightDescription.string = ""
        })
    }

    private setText(keyCode: KeyCode, text: string): void {
        this.keyCode.string = getKeyCodeName(keyCode)
        this.rightDescription.string = text
    }
}
