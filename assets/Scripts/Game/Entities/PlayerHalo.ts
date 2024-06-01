import {
    _decorator,
    CircleCollider2D,
    Collider2D,
    Color,
    Component,
    Contact2DType,
    EventKeyboard,
    Input,
    input,
    IPhysics2DContact,
    KeyCode,
    Node,
    Sprite,
    Vec3,
} from "cc"
import { getCorrectNormal } from "../Physics/PhysicsFixer"
import { ColliderGroup, ColliderType } from "../Physics/ColliderManager"
import { Box } from "./Box"
import { Player } from "../Player"
const { ccclass, property } = _decorator

@ccclass("PlayerHalo")
export class PlayerHalo extends Component {
    public color: number = ColliderGroup.RED

    private static readonly COLOR_MAP = {
        [ColliderGroup.RED]: Color.RED,
        [ColliderGroup.GREEN]: Color.GREEN,
        [ColliderGroup.BLUE]: Color.BLUE,
    }

    protected onLoad(): void {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this)
        const target_color = PlayerHalo.COLOR_MAP[this.color]
        this.node.getChildByName("Halo").getComponent(Sprite).color = new Color(
            target_color.r,
            target_color.g,
            target_color.b,
            66,
        )
    }

    private onKeyDown(event: EventKeyboard): void {
        switch (event.keyCode) {
            case KeyCode.KEY_J:
                this.changeColor(ColliderGroup.RED)
                break
            case KeyCode.KEY_K:
                this.changeColor(ColliderGroup.GREEN)
                break
            case KeyCode.KEY_L:
                this.changeColor(ColliderGroup.BLUE)
                break
        }
    }

    private changeColor(color: number): void {
        this.color = color
        const target_color = PlayerHalo.COLOR_MAP[this.color]
        this.node.getChildByName("Halo").getComponent(Sprite).color = new Color(
            target_color.r,
            target_color.g,
            target_color.b,
            66,
        )
        this.node
            .getComponent(Player)
            .collidedInactiveNodeSet.forEach((node) => {
                node.onLeaveHalo(this, true)
                this.node.getComponent(Player).collidedActiveNodeSet.add(node)
            })
        this.node.getComponent(Player).collidedActiveNodeSet.forEach((node) => {
            node.onEnterHalo(this)
            this.node.getComponent(Player).collidedInactiveNodeSet.add(node)
        })
        // this.node.scale = new Vec3(-1, 1, 1)
        // this.node.scale = new Vec3(1, 1, 1)
        /*this.node.getChildByName("Halo").getComponent(Sprite).color =
            PlayerHalo.COLOR_MAP[this.color]*/
    }
}
