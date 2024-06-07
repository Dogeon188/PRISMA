import {
    _decorator,
    Collider2D,
    Color,
    Component,
    director,
    EventMouse,
    Input,
    input,
    Label,
    Node,
    RigidBody2D,
    screen,
    Size,
    Sprite,
    UITransform,
    Vec3,
} from "cc"
import {
    ColliderGroup,
    ColliderManager,
    ColliderType,
} from "../Physics/ColliderManager"
import { Player } from "../Player"
import { PlayPauseButton } from "../../PlayPauseButton"
import { Plate } from "./Plate"
const { ccclass, property } = _decorator

@ccclass("PlayerHalo")
export class PlayerHalo extends Component {
    public color: number = null

    private mouseDown: boolean = false

    private targetColor: number = null

    @property(Node)
    private palette: Node = null

    @property(Node)
    private pausePlayButton: Node = null

    private RedSector: Node = null
    private GreenSector: Node = null
    private BlueSector: Node = null
    private RedNum: Node = null
    private GreenNum: Node = null
    private BlueNum: Node = null

    private static readonly COLOR_MAP = {
        [ColliderGroup.RED]: Color.RED,
        [ColliderGroup.GREEN]: Color.GREEN,
        [ColliderGroup.BLUE]: Color.BLUE,
    }

    private colorNumDict = {
        [ColliderGroup.RED]: 1,
        [ColliderGroup.GREEN]: 1,
        [ColliderGroup.BLUE]: 1,
    }

    private SectorDict = {}

    private NumDict = {}

    protected onLoad(): void {
        // const target_color = PlayerHalo.COLOR_MAP[this.color]
        this.node.getChildByName("Halo").getComponent(Sprite).color = new Color(
            0,
            0,
            0,
            0,
        )
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this)
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this)
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this)
    }

    protected start(): void {
        this.RedSector = this.palette.getChildByName("RedSector")
        this.GreenSector = this.palette.getChildByName("GreenSector")
        this.BlueSector = this.palette.getChildByName("BlueSector")
        this.RedNum = this.palette.getChildByName("RedNum")
        this.GreenNum = this.palette.getChildByName("GreenNum")
        this.BlueNum = this.palette.getChildByName("BlueNum")

        this.SectorDict = {
            [ColliderGroup.RED]: this.RedSector,
            [ColliderGroup.GREEN]: this.GreenSector,
            [ColliderGroup.BLUE]: this.BlueSector,
        }

        this.NumDict = {
            [ColliderGroup.RED]: this.RedNum,
            [ColliderGroup.GREEN]: this.GreenNum,
            [ColliderGroup.BLUE]: this.BlueNum,
        }
        this.palette.children.forEach((child) => {
            child.setSiblingIndex(0)
        })
        this.RedNum.getComponent(Label).string =
            this.colorNumDict[ColliderGroup.RED].toString()
        this.RedNum.setSiblingIndex(5)
        this.GreenNum.getComponent(Label).string =
            this.colorNumDict[ColliderGroup.GREEN].toString()
        this.GreenNum.setSiblingIndex(5)
        this.BlueNum.getComponent(Label).string =
            this.colorNumDict[ColliderGroup.BLUE].toString()
        this.BlueNum.setSiblingIndex(5)
        for (const label of this.palette.getComponentsInChildren(Label)) {
            label.enabled = false
        }
        for (const sprite of this.palette.getComponentsInChildren(Sprite)) {
            sprite.enabled = false
        }
    }

    private changeColor(color: number): void {
        if (this.color === color || this.colorNumDict[color] === 0) {
            return
        }
        var flag = false
        this.node.getComponent(Player).collidedHaloNodeSet.forEach((node) => {
            if (
                node.getComponent(Collider2D).tag === ColliderType.BOX ||
                node.getComponent(Collider2D).tag === ColliderType.BRICK ||
                node.getComponent(Collider2D).tag === ColliderType.STONE
            ) {
                const dx = Math.abs(node.node.position.x - this.node.position.x)
                const dy = Math.abs(node.node.position.y - this.node.position.y)
                if (
                    dx < 8 + node.node.getComponent(UITransform).width / 2 &&
                    dy < 12 + node.node.getComponent(UITransform).height / 2
                ) {
                    flag = true
                    return
                }
            }
        })
        if (flag) {
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
        this.node.getComponent(Player).collidedHaloNodeSet.forEach((node) => {
            node.onLeaveHalo(this, true)
            node.onEnterHalo(this)
            if (node.node.getComponent(Plate)) {
                node.node.getComponent(Plate).checkPressedBy(this.color)
            }
        })
        const player = this.node.getComponent(Player)
        if (player.interactingWith) {
            player.interactingWith.onEndInteract(this.node.getComponent(Player))
            player.interactingWith = null
        }
    }

    private onMouseDown(): void {
        if (!this.pausePlayButton.getComponent(PlayPauseButton).isPlay) {
            return
        }
        for (const sprite of this.palette.getComponentsInChildren(Sprite)) {
            sprite.enabled = true
        }
        for (const label of this.palette.getComponentsInChildren(Label)) {
            label.enabled = true
        }
        this.mouseDown = true
        // director.stopAnimation()
        director.pause()
    }

    private onMouseUp(): void {
        if (!this.pausePlayButton.getComponent(PlayPauseButton).isPlay) {
            return
        }
        for (const sprite of this.palette.getComponentsInChildren(Sprite)) {
            sprite.enabled = false
        }
        for (const label of this.palette.getComponentsInChildren(Label)) {
            label.enabled = false
        }
        this.mouseDown = false
        if (this.targetColor !== null) {
            this.deemphasizeSector(this.targetColor)
            this.changeColor(this.targetColor)
            this.targetColor = null
        }
        // director.startAnimation()
        director.resume()
    }

    private onMouseMove(event: EventMouse): void {
        if (!this.pausePlayButton.getComponent(PlayPauseButton).isPlay) {
            return
        }
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
                if (this.targetColor !== ColliderGroup.RED) {
                    if (this.targetColor !== null)
                        this.deemphasizeSector(this.targetColor)
                    this.targetColor = ColliderGroup.RED
                    this.emphasizeSector(ColliderGroup.RED)
                }
            } else if (mousePosition.x < 0 && angle < 120) {
                if (this.targetColor !== ColliderGroup.GREEN) {
                    if (this.targetColor !== null)
                        this.deemphasizeSector(this.targetColor)
                    this.targetColor = ColliderGroup.GREEN
                    this.emphasizeSector(ColliderGroup.GREEN)
                }
            } else {
                if (this.targetColor !== ColliderGroup.BLUE) {
                    if (this.targetColor !== null)
                        this.deemphasizeSector(this.targetColor)
                    this.targetColor = ColliderGroup.BLUE
                    this.emphasizeSector(ColliderGroup.BLUE)
                }
            }
        }
    }

    private emphasizeSector(color: number): void {
        this.SectorDict[color].scale = new Vec3(1.1, 1.1, 0)
        this.SectorDict[color].setSiblingIndex(3)
        this.NumDict[color].setSiblingIndex(5)
    }

    private deemphasizeSector(color: number): void {
        this.SectorDict[color].scale = new Vec3(1, 1, 0)
        this.SectorDict[color].setSiblingIndex(0)
        this.NumDict[color].setSiblingIndex(5)
    }

    public addGem(color: number): void {
        this.colorNumDict[color]++
        this.RedNum.getComponent(Label).string =
            this.colorNumDict[ColliderGroup.RED].toString()
        this.GreenNum.getComponent(Label).string =
            this.colorNumDict[ColliderGroup.GREEN].toString()
        this.BlueNum.getComponent(Label).string =
            this.colorNumDict[ColliderGroup.BLUE].toString()
    }

    public interactWithLamp(color: number): void {
        if (color === null) {
            // minus 1 of the color
            this.colorNumDict[this.color]--
            this.RedNum.getComponent(Label).string =
                this.colorNumDict[ColliderGroup.RED].toString()
            this.GreenNum.getComponent(Label).string =
                this.colorNumDict[ColliderGroup.GREEN].toString()
            this.BlueNum.getComponent(Label).string =
                this.colorNumDict[ColliderGroup.BLUE].toString()
            // change the color of the halo to null
            this.node.getChildByName("Halo").getComponent(Sprite).color =
                new Color(0, 0, 0, 0)
            this.color = null
            this.node
                .getComponent(Player)
                .collidedHaloNodeSet.forEach((node) => {
                    node.onLeaveHalo(this)
                })
        } else {
            this.addGem(color)
        }
    }
}
