import {
    _decorator,
    JsonAsset,
    Node,
    ParticleSystem2D,
    tween,
    UIOpacity,
} from "cc"
import { DialogEntry } from "../../Interface/DialogBox"
import { ResourceManager } from "../../ResourceManager"
import { GameManager } from "../GameManager"
import { Entity } from "./Entity"
const { ccclass, property } = _decorator

type DialogData = {
    once?: boolean
    entries: RawDialogEntry[]
}

type RawDialogEntry = Omit<DialogEntry, "voice"> & {
    /** The path to the voice audio clip, always prefixed with "Audio/" */
    voice?: string
}

@ccclass("Dialog")
export class Dialog extends Entity {
    @property({ type: JsonAsset, visible: true, displayName: "Dialog Data" })
    private _dialogData: JsonAsset = null

    get dialogData(): JsonAsset {
        return this._dialogData
    }

    set dialogData(value: JsonAsset) {
        this._dialogData = value
        this.resolveDialogData(value.json as DialogData)
    }

    private active: boolean = false
    private once: boolean = false
    private loadedEntries: DialogEntry[] = []

    protected onLoad() {
        const data: DialogData = this.dialogData.json as DialogData
        this.resolveDialogData(data)
    }

    private resolveDialogData(data: DialogData): void {
        Promise.all(
            data.entries.map(async (entry) => {
                const rawEntry = entry as RawDialogEntry
                const audioClip =
                    rawEntry.voice &&
                    (await ResourceManager.getAudioClip(rawEntry.voice))
                return {
                    text: rawEntry.text,
                    duration: rawEntry.duration,
                    voice: audioClip,
                    postDelay: rawEntry.postDelay,
                } as DialogEntry
            }),
        )
            .then((entries) => {
                this.loadedEntries = entries
                this.once = data.once
            })
            .catch((err) => {
                console.error("Failed to load dialog data", err)
            })
    }

    public onCollide(other: Node): void {
        if (this.active) return
        this.active = true
        GameManager.inst.dialogBox.playDialog(this.loadedEntries, () => {
            if (this.once) {
                this.node.getComponent(ParticleSystem2D).stopSystem()
                this.scheduleOnce(() => this.node.destroy(), 2)
            } else this.active = false
        })
    }
}
