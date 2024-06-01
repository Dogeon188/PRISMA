import { _decorator, Component, KeyCode, Label, log } from "cc"
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
        }
    }

    hidePrompt(): void {
        if (this.isPlaying) {
            this.node.active = false
            this.isPlaying = false
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
