import { _decorator, Component, Node } from "cc"
import { Dialog } from "../Game/Entities/Dialog"
import { GameManager } from "../Game/GameManager"
const { ccclass, property } = _decorator

@ccclass("LevelOpening")
export class LevelOpening extends Component {
    @property(Node)
    private objectsNode: Node = null

    private dummyDialog: Dialog = null

    private openingFinished: boolean = false

    protected warpBack() {
        if (!this.openingFinished) {
            const playerNode = GameManager.inst.player.node
            const cameraNode = GameManager.inst.camera.node
            this.scheduleOnce(() => {
                playerNode.setPosition(
                    playerNode.position.x - 256 * 2,
                    playerNode.position.y + 256,
                )
                cameraNode.setPosition(
                    cameraNode.position.x - 256 * 2 * 2.5,
                    cameraNode.position.y + 256 * 2.5,
                )
            }, 0)
        }
    }

    protected start(): void {
        this.dummyDialog = this.objectsNode
            .getChildByName("OpeningDialog")
            .getComponent(Dialog)

        this.scheduleOnce(() => {
            GameManager.inst.dialogBox.playDialog(
                this.dummyDialog.entries,
                () => (this.openingFinished = true),
            )
        }, 4)
    }
}
