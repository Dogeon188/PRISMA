import { _decorator, AudioClip, Component, Label, tween, UITransform, log } from "cc"
const { ccclass, property } = _decorator


@ccclass("InteractPrompt")
export class InteractPrompt extends Component {
    private isPlaying: boolean = false

    @property(Label)
    private keyCode: Label = null

    @property(Label)
    private rightDescription: Label = null

    /**
     * Play a sequence of dialogs
     */
    showPrompt(keyCode: string, text: string, then?: Function): void {
        this.setText([keyCode, text])
        log("showPrompt with keyCode: " + keyCode + " and text: " + text)
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


    private setText([keyCode, text]): void {
        this.keyCode.string = keyCode
        this.rightDescription.string = text
    }

}
