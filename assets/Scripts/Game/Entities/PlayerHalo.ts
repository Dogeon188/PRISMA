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
    Label,
    Node,
    screen,
    Size,
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

    @property(Node)
    private palette: Node = null

    private static readonly COLOR_MAP = {
        [ColliderGroup.RED]: Color.RED,
        [ColliderGroup.GREEN]: Color.GREEN,
        [ColliderGroup.BLUE]: Color.BLUE,
    }

    private colorNumDict = {
        [ColliderGroup.RED]: 1,
        [ColliderGroup.GREEN]: 0,
        [ColliderGroup.BLUE]: 1,
    }

    protected onLoad(): void {
        const target_color = PlayerHalo.COLOR_MAP[this.color]
        this.node.getChildByName("Halo").getComponent(Sprite).color = new Color(
            target_color.r,
            target_color.g,
            target_color.b,
            66,
        )
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this)
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this)
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this)
        for (const sprite of this.palette.getComponentsInChildren(Sprite)) {
            sprite.enabled = false
        }
        this.palette.getChildByName("RedNum").getComponent(Label).string =
            this.colorNumDict[ColliderGroup.RED].toString()
        this.palette.getChildByName("GreenNum").getComponent(Label).string =
            this.colorNumDict[ColliderGroup.GREEN].toString()
        this.palette.getChildByName("BlueNum").getComponent(Label).string =
            this.colorNumDict[ColliderGroup.BLUE].toString()
        for (const label of this.palette.getComponentsInChildren(Label)) {
            label.enabled = false
        }
    }

    private changeColor(color: number): void {
        if (this.color === color || this.colorNumDict[color] === 0) {
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
        for (const sprite of this.palette.getComponentsInChildren(Sprite)) {
            sprite.enabled = true
        }
        for (const label of this.palette.getComponentsInChildren(Label)) {
            label.enabled = true
        }
        this.mouseDown = true
    }

    private onMouseUp(): void {
        for (const sprite of this.palette.getComponentsInChildren(Sprite)) {
            sprite.enabled = false
        }
        for (const label of this.palette.getComponentsInChildren(Label)) {
            label.enabled = false
        }
        this.mouseDown = false
        this.changeColor(this.targetColor)
    }

    private onMouseMove(event: EventMouse): void {
        if (this.mouseDown) {
            const cameraSize = screen.resolution.lerp(
                Size.ZERO,
                1 - 1 / screen.devicePixelRatio,
            )
            const mousePosition = new Vec3(
                event.getLocationX() - cameraSize.width / 2,
                event.getLocationY() - cameraSize.height / 2,
                0,
            )

            const angle =
                (Vec3.angle(Vec3.UNIT_Y, mousePosition) * 180) / Math.PI

            if (mousePosition.x >= 0 && angle < 120) {
                this.targetColor = ColliderGroup.RED
            } else if (mousePosition.x < 0 && angle < 120) {
                this.targetColor = ColliderGroup.GREEN
            } else {
                this.targetColor = ColliderGroup.BLUE
            }
        }
    }

    public addGem(color: number): void {
        this.colorNumDict[color]++
        this.palette.getChildByName("RedNum").getComponent(Label).string =
            this.colorNumDict[ColliderGroup.RED].toString()
        this.palette.getChildByName("GreenNum").getComponent(Label).string =
            this.colorNumDict[ColliderGroup.GREEN].toString()
        this.palette.getChildByName("BlueNum").getComponent(Label).string =
            this.colorNumDict[ColliderGroup.BLUE].toString()
    }
}
