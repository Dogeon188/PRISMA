import { _decorator, Component, JsonAsset, Node } from "cc"
import { AudioManager } from "../../AudioManager"
import { DialogEntry } from "../../Interface/DialogBox"
import { GameManager } from "../GameManager"
import { Entity } from "./Entity"
const { ccclass, property } = _decorator

type DialogData = {
    once?: boolean
    entries: DialogEntry[]
}

type RawDialogEntry = DialogEntry & {
    /** @override The path to the voice audio clip, always prefixed with "Audio/" */
    voice?: string
}

type RawDialogData = DialogData & {
    entries: RawDialogEntry[]
}

@ccclass("Dialog")
export class Dialog extends Entity {
    @property({ type: JsonAsset })
    dialogData: JsonAsset = null
    
    private played: boolean = false
    private once: boolean = false
    private loadedEntries: DialogEntry[] = []

    onLoad() {
        const data: DialogData = this.dialogData.json as DialogData
        Promise.all(
            data.entries.map(async (entry) => {
                const rawEntry = entry as RawDialogEntry
                const audioClip =
                    rawEntry.voice &&
                    (await AudioManager.inst.getAudioClip(rawEntry.voice))
                return {
                    text: rawEntry.text,
                    duration: rawEntry.duration,
                    voice: audioClip,
                    postDelay: rawEntry.postDelay,
                } as DialogEntry
            }),
        ).then((entries) => {
            this.loadedEntries = entries
            this.once = data.once
        }).catch((err) => {
            console.error("Failed to load dialog data", err)
        })
    }

    onCollide(other: Node): void {
        if (this.once && this.played) return
        this.played = true
        GameManager.inst.dialogBox.playDialog(this.loadedEntries)
    }
}
