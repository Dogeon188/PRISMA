import { _decorator, AudioClip, Component, Label, tween, UITransform } from "cc"
import { AudioManager } from "../AudioManager"
const { ccclass, property } = _decorator

/**
 * A dialog entry
 */
export type DialogEntry = {
    /** The text to display. Please keep it within 2 lines. */
    text: string
    /** The duration to display the text. */
    duration: number
    /** The voice to play at the beginning of the dialog. */
    voice?: AudioClip
    /** The delay after the dialog is finished till next dialog. */
    postDelay?: number
}

@ccclass("DialogBox")
export class DialogBox extends Component {
    private uiTransform: UITransform = null
    private queue: DialogEntry[] = []
    private width: number = 0
    private isPlaying: boolean = false

    @property(Label)
    private label: Label = null

    /**
     * Play a sequence of dialogs
     */
    playDialog(data: DialogEntry[]) {
        this.queue.push(...data)
        if (!this.isPlaying) {
            this.startDialog()
        }
    }

    /**
     * Skip the current dialog
     */
    skipDialog() {
        // TODO: stop current dialog and play next
    }

    //#region Private Methods

    protected onLoad(): void {
        this.uiTransform = this.node.getComponent(UITransform)
        this.width = this.uiTransform.width
        this.scheduleOnce(() => {
            this.uiTransform.width = 0
            this.label.string = ""
        })
    }

    private startDialog() {
        tween(this.uiTransform)
            .set({ width: 0 })
            .to(1, { width: this.width }, { easing: "cubicInOut" })
            .call(() => {
                this.playNext()
                this.isPlaying = true
            })
            .start()
    }

    private endDialog() {
        tween(this.uiTransform)
            .to(1, { width: 0 }, { easing: "cubicInOut" })
            .call(() => {
                if (this.queue.length > 0) {
                    this.startDialog()
                } else this.isPlaying = false
            })
            .start()
    }

    private playNext() {
        if (this.queue.length === 0) {
            this.endDialog()
            return
        }

        this.isPlaying = true
        const data = this.queue.shift()
        const secondPerChar = data.duration / data.text.length
        if (data.voice) AudioManager.inst.playOneShot(data.voice)

        tween(this.label)
            .set({ string: data.text })
            .delay(data.duration)
            .set({ string: "" })
            .call(() => {
                if (data.postDelay) {
                    this.scheduleOnce(() => this.playNext(), data.postDelay)
                } else {
                    this.playNext()
                }
            })
            .start()
    }
}
