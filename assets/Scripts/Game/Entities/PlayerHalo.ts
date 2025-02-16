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
    screen,
    Size,
    Sprite,
    UITransform,
    Vec3,
} from "cc"
import { Auth } from "../../Auth"
import { PlayPauseButton } from "../../PlayPauseButton"
import { GameManager } from "../GameManager"
import { ColliderGroup, ColliderType } from "../Physics/ColliderManager"
import { Player } from "../Player"
import { Lamp } from "./Lamp"
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

    public colorNumDict = {
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
        this.loadColorOnUserData()
        this.loadGemOnUserData()
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

    public changeColor(color: number): void {
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
            if (node.node.getComponent(Lamp)) {
                // GameManager.inst.interactPrompt.hidePrompt()
                // this.scheduleOnce(() => {
                //     node.node
                //         .getComponent(Lamp)
                //         .showPrompt(this.node.getComponent(Player))
                // }, 0.5)
                node.node
                    .getComponent(Lamp)
                    .showPrompt(this.node.getComponent(Player))
            }
        })
        const player = this.node.getComponent(Player)
        if (player.interactingWith) {
            player.interactingWith.onEndInteract(this.node.getComponent(Player))
            player.interactingWith = null
        }
    }

    private onMouseDown(): void {
        if (
            !GameManager.inst.canAct ||
            !this.pausePlayButton.getComponent(PlayPauseButton).isPlay
        ) {
            return
        }
        this.node.getChildByName("Halo").getComponent(Sprite).color = new Color(
            0,
            0,
            0,
            0,
        )
        this.node.getComponent(Player).collidedHaloNodeSet.forEach((node) => {
            const tmp = node.node.getComponent(Sprite)
            if (tmp) tmp.enabled = true
            const tmp2 = node.node.getChildByName("Stick")
            if (tmp2) tmp2.getComponent(Sprite).enabled = true
        })
        for (const sprite of this.palette.getComponentsInChildren(Sprite)) {
            sprite.enabled = true
        }
        for (const label of this.palette.getComponentsInChildren(Label)) {
            label.enabled = true
        }
        this.mouseDown = true
        director.pause()
    }

    private onMouseUp(): void {
        if (!this.pausePlayButton.getComponent(PlayPauseButton).isPlay) {
            return
        }
        this.node.getComponent(Player).collidedHaloNodeSet.forEach((node) => {
            if (
                node.node.getComponent(Collider2D).group ===
                ColliderGroup.INACTIVE
            ) {
                const tmp = node.node.getComponent(Sprite)
                if (tmp) tmp.enabled = false
            }
            const tmp2 = node.node.getChildByName("Stick")
            if (tmp2) tmp2.getComponent(Sprite).enabled = false
        })
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
        if (this.color !== null) {
            const target_color = PlayerHalo.COLOR_MAP[this.color]
            this.node.getChildByName("Halo").getComponent(Sprite).color =
                new Color(target_color.r, target_color.g, target_color.b, 66)
        }
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

    public setGemNum(count: number): void {
        this.colorNumDict[ColliderGroup.RED] = count
        this.colorNumDict[ColliderGroup.GREEN] = count
        this.colorNumDict[ColliderGroup.BLUE] = count
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

    private loadColorOnUserData(): void {
        switch (Auth.data.haloColor) {
            case 0:
                this.changeColor(null)
                break
            case 1:
                this.changeColor(ColliderGroup.RED)
                break
            case 2:
                this.changeColor(ColliderGroup.GREEN)
                break
            case 3:
                this.changeColor(ColliderGroup.BLUE)
                break
            default:
                this.changeColor(null)
                break
        }
    }

    private loadGemOnUserData(): void {
        this.colorNumDict[ColliderGroup.RED] = Auth.data.gemNum.red
        this.colorNumDict[ColliderGroup.GREEN] = Auth.data.gemNum.green
        this.colorNumDict[ColliderGroup.BLUE] = Auth.data.gemNum.blue
    }
}
