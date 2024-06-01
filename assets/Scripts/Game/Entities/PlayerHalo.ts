import {
    _decorator,
    Camera,
    CircleCollider2D,
    Collider2D,
    Color,
    Component,
    Contact2DType,
    EventKeyboard,
    EventMouse,
    find,
    Input,
    input,
    IPhysics2DContact,
    KeyCode,
    Node,
    Sprite,
    UITransform,
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

    private mouseDown: boolean = false

    private targetColor: number = ColliderGroup.RED

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
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this)
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this)
        input.on(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this)
        this.node.getChildByName("Palette").getComponent(Sprite).enabled = false
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
        if (this.color === color) {
            return
        }
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

    private onMouseDown(): void {
        this.node.getChildByName("Palette").getComponent(Sprite).enabled = true
        this.mouseDown = true
    }

    private onMouseUp(): void {
        this.node.getChildByName("Palette").getComponent(Sprite).enabled = false
        this.mouseDown = false
        this.changeColor(this.targetColor)
    }

    private onMouseWheel(event: EventMouse): void {
        if (event.getScrollY() > 0) {
            // this.changeColor((this.color + 1) % 3)
            switch (this.color) {
                case ColliderGroup.RED:
                    this.targetColor = ColliderGroup.BLUE
                    break
                case ColliderGroup.GREEN:
                    this.targetColor = ColliderGroup.RED
                    break
                case ColliderGroup.BLUE:
                    this.targetColor = ColliderGroup.GREEN
                    break
            }
        } else {
            // this.changeColor((this.color - 1) % 3)
            switch (this.color) {
                case ColliderGroup.RED:
                    this.targetColor = ColliderGroup.GREEN
                    break
                case ColliderGroup.GREEN:
                    this.targetColor = ColliderGroup.BLUE
                    break
                case ColliderGroup.BLUE:
                    this.targetColor = ColliderGroup.RED
                    break
            }
        }
    }

    /*private onMouseMove(event: EventMouse): void {
        if (this.mouseDown) {
            const ScrrenPositionOfPlayer = new Vec3()
            this.camera.camera.worldToScreen(
                ScrrenPositionOfPlayer,
                this.node.position,
            )
            console.log(ScrrenPositionOfPlayer)

            const worldPositionOfMouse = new Vec3()
            this.camera.camera.screenToWorld(
                worldPositionOfMouse,
                new Vec3(event.getLocationX(), event.getLocationY()),
            )

            // get World Position of the player
            const playerWorldPosition = this.node.position

            // get the direction vector
            const mouseRelativePosition =
                worldPositionOfMouse.subtract(playerWorldPosition)

            const uiTransform = this.node.getComponent(UITransform)
            const mouseRelativePosition = uiTransform.convertToNodeSpaceAR(
                new Vec3(event.getUILocationX(), event.getUILocationY()),
            )
            const angle =
                (Vec3.angle(Vec3.UNIT_Y, mouseRelativePosition) * 180) / Math.PI
            // console.log(angle)
            if (mouseRelativePosition.x >= 0 && angle < 120) {
                this.targetColor = ColliderGroup.RED
            } else if (mouseRelativePosition.x < 0 && angle < 120) {
                this.targetColor = ColliderGroup.BLUE
            } else {
                this.targetColor = ColliderGroup.GREEN
            }
        }
    }*/
}
