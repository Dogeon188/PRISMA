import {
    AudioClip,
    CircleCollider2D,
    Collider2D,
    Color,
    Contact2DType,
    IPhysics2DContact,
    Intersection2D,
    Node,
    Quat,
    Size,
    Sprite,
    UITransform,
    Vec2,
    _decorator,
    math,
    tween,
} from "cc"
import { AudioManager } from "../../AudioManager"
import { Settings } from "../../Scene/Settings"
import { GameManager } from "../GameManager"
import { ColliderGroup, ColorMap } from "../Physics/ColliderManager"
import { Player } from "../Player"
import { Entity } from "./Entity"
import { PlayerHalo } from "./PlayerHalo"
const { ccclass, property } = _decorator

@ccclass("Lamp")
export class Lamp extends Entity {
    public color: number = null

    private collidedSet: Set<Entity> = new Set()

    private haloNode: Node = null
    private gemNode: Node = null

    @property
    private haloRadius: number = 200

    public get radius(): number {
        if (this.color === null) return 0
        return this.haloRadius
    }

    @property(AudioClip)
    private gemSound: AudioClip = null

    private static readonly COLOR_MAP = {
        [ColliderGroup.RED]: Color.RED,
        [ColliderGroup.GREEN]: Color.GREEN,
        [ColliderGroup.BLUE]: Color.BLUE,
    }

    protected onLoad(): void {
        this.initialize(
            new Vec2(this.node.position.x, this.node.position.y),
            this.haloRadius,
            null,
        )

        const haloCollider = this.haloNode.getComponent(CircleCollider2D)
        haloCollider.on(
            Contact2DType.BEGIN_CONTACT,
            this.onBeginContactHalo,
            this,
        )
        haloCollider.on(Contact2DType.END_CONTACT, this.onEndContactHalo, this)
        this.scheduleOnce(() => {
            this.haloNode.getComponent(UITransform).contentSize = new Size(0, 0)
        }, 0)
        this.drawColor()
    }

    public initialize(position: Vec2, radius: number, angle: number): void {
        this.haloNode = this.node.getChildByName("Halo")
        this.gemNode = this.node.getChildByName("Gem")
        this.gemNode.getComponent(Sprite).enabled = false
        this.node.setPosition(position.x, position.y)
        this.haloRadius = radius
        this.haloNode.getComponent(CircleCollider2D).radius = radius
        this.haloNode
            .getChildByName("glow_circle")
            .getComponent(UITransform).width = 0
        this.haloNode
            .getChildByName("glow_circle")
            .getComponent(UITransform).height = 0
        if (angle !== null)
            this.node.setRotation(Quat.fromAngleZ(new Quat(), angle))
    }

    public showPrompt(player: Player): void {
        GameManager.inst.interactPrompt.showPrompt(
            this.color === null &&
                player.node.getComponent(PlayerHalo).color === null
                ? null
                : Settings.keybinds.interact,
            this.color === null
                ? player.node.getComponent(PlayerHalo).color === null
                    ? "Make sure you have light to give."
                    : "Light Up"
                : "Pick Up",
        )
    }

    private drawColor(): void {
        if (this.color === null) {
            this.haloNode.getComponent(Sprite).color = new Color(0, 0, 0, 0)
            return
        }
        const color = Lamp.COLOR_MAP[this.color]
        this.haloNode.getComponent(Sprite).color = new Color(
            color.r,
            color.g,
            color.b,
            66,
        )
    }

    private changeColor(player: Player): boolean {
        AudioManager.inst.playOneShot(this.gemSound)
        if (this.color === null) {
            if (player.node.getComponent(PlayerHalo).color === null) {
                return false
            }
            this.color = player.node.getComponent(PlayerHalo).color
            // Set the gem color
            this.gemNode.getComponent(Sprite).enabled = true
            this.gemNode.getComponent(Sprite).color = ColorMap[this.color]

            this.drawColor()
            tween(this.haloNode.getComponent(UITransform))
                .to(
                    0.5,
                    { width: this.haloRadius * 2, height: this.haloRadius * 2 },
                    { easing: "sineOut" },
                )
                .start()
            tween(
                this.haloNode
                    .getChildByName("glow_circle")
                    .getComponent(UITransform),
            )
                .to(
                    0.5,
                    {
                        width: this.haloRadius * 3,
                        height: this.haloRadius * 3,
                    },
                    { easing: "sineOut" },
                )
                .start()
        } else {
            this.color = null
            this.gemNode.getComponent(Sprite).enabled = false
            tween(this.haloNode.getComponent(UITransform))
                .to(0.5, { width: 0, height: 0 }, { easing: "sineIn" })
                .call(() => {
                    this.drawColor()
                })
                .start()
            tween(
                this.haloNode
                    .getChildByName("glow_circle")
                    .getComponent(UITransform),
            )
                .to(
                    0.5,
                    {
                        width: 0,
                        height: 0,
                    },
                    { easing: "sineOut" },
                )
                .start()
        }
        this.collidedSet.forEach((entity) => {
            entity.onLeaveLampHalo(this)
            entity.onEnterLampHalo(this)
        })
        this.node.emit("changeColor", this.uuid, this.color)
        return true
    }

    public canInteract(player: Player, normal: math.Vec2): boolean {
        return true
        return (
            this.color !== null ||
            player.node.getComponent(PlayerHalo).color !== null
        )
    }

    public onCollide(other: Node): void {
        const player = other.getComponent(Player)
        // GameManager.inst.interactPrompt.hidePrompt()
        // this.scheduleOnce(() => {
        //     if (this.canInteract(player, null)) this.showPrompt(player)
        // }, 0.5)
        this.showPrompt(player)
    }

    public onBeginInteract(player: Player): void {
        const target_color = this.color
        // GameManager.inst.interactPrompt.hidePrompt()
        player.collidedHaloNodeSet.forEach((node) => {
            // check if node position is in the lamp's halo
            // dont change readonly vec3
            // const distance = node.node.position
            //     .clone()
            //     .subtract(this.node.position)
            //     .length()

            const target_node = node.node.getComponent(UITransform)
            const target_rect = math.rect(
                node.node.position.x - target_node.width / 2,
                node.node.position.y - target_node.height / 2,
                target_node.width,
                target_node.height,
            )

            // const colliderList = PhysicsSystem2D.instance.testAABB(target_rect)

            const circleCenter = new Vec2(
                this.node.position.x,
                this.node.position.y,
            )
            const ans = Intersection2D.rectCircle(
                target_rect,
                circleCenter,
                this.haloRadius,
            )
            if (ans) this.collidedSet.add(node)
        })
        const ret = this.changeColor(player)
        player.node.getComponent(PlayerHalo).interactWithLamp(target_color)
        if (ret) {
            // GameManager.inst.interactPrompt.hidePrompt()
            // this.scheduleOnce(() => {
            //     this.showPrompt(player)
            // }, 0.5)
            this.showPrompt(player)
        }
    }

    private onBeginContactHalo(
        self: Collider2D,
        other: Collider2D,
        contact: IPhysics2DContact,
    ): void {
        const entity = other.node.getComponent(Entity)
        if (entity) {
            entity.onEnterLampHalo(this)
            this.collidedSet.add(entity)
        }
    }

    private onEndContactHalo(
        self: Collider2D,
        other: Collider2D,
        contact: IPhysics2DContact,
    ): void {
        const entity = other.node.getComponent(Entity)
        if (entity) {
            entity.onLeaveLampHalo(this)
            this.collidedSet.delete(entity)
        }
    }
}
