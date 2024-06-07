import {
    _decorator,
    AudioClip,
    Camera,
    Component,
    log,
    Node,
    ParticleSystem2D,
    tween,
    UIOpacity,
    UITransform,
} from "cc"
import { AudioManager } from "../AudioManager"
import { Dialog } from "../Game/Entities/Dialog"
import { GameManager } from "../Game/GameManager"
const { ccclass, property } = _decorator

@ccclass("LevelOpening")
export class LevelOpening extends Component {
    @property(Node)
    private objectsNode: Node = null

    @property({ type: AudioClip, group: "Audio" })
    private openingBGM: AudioClip = null

    private dummyDialog: Dialog = null

    protected start(): void {
        this.dummyDialog = this.objectsNode
            .getChildByName("OpeningDialog")
            .getComponent(Dialog)

        this.scheduleOnce(() => {
            log(this.dummyDialog)
            log("Opening dialog")
            GameManager.inst.dialogBox.playDialog(
                this.dummyDialog.entries,
                () => {
                    log("Opening dialog done")
                },
            )
        }, 4)
    }

    

    
}
