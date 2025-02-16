import { _decorator, AudioClip, Component, Label, tween, UIOpacity, UITransform } from "cc"
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
    private uiOpacity: UIOpacity = null
    private queue: (DialogEntry & { _postCallback?: Function })[] = []
    private isPlaying: boolean = false

    @property(Label)
    private label: Label = null

    /**
     * Play a sequence of dialogs
     */
    playDialog(data: DialogEntry[], then?: Function): void {
        this.queue.push(...data)
        if (!this.isPlaying) {
            this.startDialog()
        }
        if (then) {
            this.queue.push({ text: "", duration: 0, _postCallback: then })
        }
    }

    /**
     * Skip the current dialog
     */
    skipDialog(): void {
        console.error("Not implemented")
        // TODO: stop current dialog and play next
    }

    //#region Private Methods

    protected onLoad(): void {
        this.uiOpacity = this.node.getComponent(UIOpacity)
        this.node.active = false
        this.scheduleOnce(() => {
            this.uiOpacity.opacity = 0
            this.label.string = ""
        })
    }

    private startDialog(): void {
        this.node.active = true
        tween(this.uiOpacity)
            .set({ opacity: 0 })
            .to(1, { opacity: 255 }, { easing: "cubicInOut" })
            .call(() => {
                this.playNext()
                this.isPlaying = true
            })
            .start()
    }

    private endDialog(): void {
        if (this.queue.length > 0 && this.queue[0]._postCallback) {
            this.queue.shift()._postCallback()
        }
        tween(this.uiOpacity)
            .call(() => (this.label.string = ""))
            .to(1, { opacity: 0 }, { easing: "cubicInOut" })
            .call(() => {
                if (this.queue.length > 0) {
                    this.startDialog()
                } else {
                    this.isPlaying = false
                    this.node.active = false
                }
            })
            .start()
    }

    private playNext(): void {
        if (this.queue.length === 0) {
            this.endDialog()
            return
        }

        if (this.queue[0]._postCallback !== undefined) {
            this.queue[0]._postCallback()
            if (this.queue.length === 1) this.endDialog()
            else {
                this.queue.shift()
                this.playNext()
            }
            return
        }

        this.isPlaying = true
        const data = this.queue.shift()
        const secondPerChar = data.duration / data.text.length
        if (data.voice) AudioManager.inst.playOneShot(data.voice)

        let i = 0
        tween(this.label)
            .set({ string: "" })
            .repeat(
                data.text.length,
                tween(this.label)
                    .call(() => (this.label.string += data.text[i++]))
                    .delay(secondPerChar),
            )
            .call(() => {
                this.scheduleOnce(() => this.playNext(), data.postDelay || 0)
            })
            .start()
    }
}
