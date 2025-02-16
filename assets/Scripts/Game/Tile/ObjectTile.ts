import {
    _decorator,
    Component,
    instantiate,
    Node,
    Prefab,
    Size,
    TiledObjectGroup,
    UITransform,
    Vec2,
} from "cc"
import { ResourceManager } from "../../ResourceManager"
import { Box } from "../Entities/Box"
import { Dialog } from "../Entities/Dialog"
import { Entity } from "../Entities/Entity"
import { Gate } from "../Entities/Gate"
import { Gem } from "../Entities/Gem"
import { Lamp } from "../Entities/Lamp"
import { Laser } from "../Entities/Laser"
import { MovingPlatform } from "../Entities/MovingPlatform"
import { Plate, PlateTriggerable } from "../Entities/Plate"
import { Portal, PortalType } from "../Entities/Portal"
import { Stone } from "../Entities/Stone"
import { StoneDestroyer } from "../Entities/StoneDestroyer"
import { StoneGenerator } from "../Entities/StoneGenerator"
import { ColorStringToGroupMap } from "../Physics/ColliderManager"
const { ccclass, property, requireComponent } = _decorator

type ObjectId = string | number
type RGBString = "red" | "green" | "blue" | "default"

type TileObjectTypes = {
    /** Shows dialog when touched */
    dialog: {
        class: "dialog"
        /** The dialog data file path without file association, with prefix `resources/Data/` added internally */
        dialog: string
    }
    /** Portal to another scene */
    scenePortal: {
        class: "scenePortal"
        /** The scene name to change to */
        scene: string
    }
    /** Portal to another node in the same scene */
    nodePortal: {
        class: "nodePortal"
        /** The object id (in Tiled) to move to, usually a dummy node */
        destination: ObjectId
    }
    /** Box that can be pushed/pulled by the player */
    box: {
        class: "box"
        color: RGBString
    }
    /**
     * Rolling stone. Can hurt player when at high speed.
     * Always 32x32 in size.
     */
    stone: {
        class: "stone"
        color: RGBString
    }
    /**
     * Stone generator. Generates stone every few seconds.
     */
    stoneGenerator: {
        class: "stoneGenerator"
        /** The interval to generate stone */
        interval: number
        /**
         * The pattern of stone color to generate. Loops indefinitely.
         * Use it like this: "red,green,blue" to generate stones in that order.
         */
        pattern: string
    }
    /**
     * Stone destroyer. Destroys stone when touched.
     */
    stoneDestroyer: {
        class: "stoneDestroyer"
    }
    /**
     * Moving platform. Moves between initial position and destination.
     */
    movingPlatform: {
        class: "moving"
        /** The color of the platform */
        color: RGBString
        /** The object id (in Tiled) of the destination */
        moveTo: ObjectId
        /** The duration of the transition */
        duration: number
    }
    /** Pressure plate, should always be 5px in height */
    plate: {
        class: "plate"
    }
    /** Gate triggered by pressure plate */
    gate: {
        class: "gate"
        /** The offset to move when triggered */
        offsetX: number
        offsetY: number
        /** The duration of the transition */
        transition: number
        /** The object id (in Tiled) of the trigger plate */
        trigger: ObjectId
    }
    /** Laser beam. Die when touched, can't be blocked by boxes */
    laser: {
        class: "laser"
        color: RGBString
    }
    /** Color gem */
    gem: {
        class: "gem"
        color: RGBString
        zone: string
    }
    /** Lamp that emits light */
    lamp: {
        class: "lamp"
        angle: number
        radius: number
    }
    /** Dummy object just for reference */
    dummy: {
        class: "dummy"
    }
}

type TileObject<T extends keyof TileObjectTypes> = TileObjectTypes[T] &
    ReturnType<TiledObjectGroup["getObject"]>

type TriggerableType = Entity & PlateTriggerable

@ccclass("ObjectTile")
@requireComponent(TiledObjectGroup)
export class ObjectTile extends Component {
    @property({ type: Prefab, group: "Prefabs" })
    private dialogPrefab: Prefab = null

    @property({ type: Prefab, group: "Prefabs" })
    private portalPrefab: Prefab = null

    @property({ type: Prefab, group: "Prefabs" })
    private boxPrefab: Prefab = null

    @property({ type: Prefab, group: "Prefabs" })
    private stonePrefab: Prefab = null

    @property({ type: Prefab, group: "Prefabs" })
    private stoneGeneratorPrefab: Prefab = null

    @property({ type: Prefab, group: "Prefabs" })
    private stoneDestroyerPrefab: Prefab = null

    @property({ type: Prefab, group: "Prefabs" })
    private movingPlatformPrefab: Prefab = null

    @property({ type: Prefab, group: "Prefabs" })
    private platePrefab: Prefab = null

    @property({ type: Prefab, group: "Prefabs" })
    private gatePrefab: Prefab = null

    @property({ type: Prefab, group: "Prefabs" })
    private laserPrefab: Prefab = null

    @property({ type: Prefab, group: "Prefabs" })
    private gemRedPrefab: Prefab = null

    @property({ type: Prefab, group: "Prefabs" })
    private gemGreenPrefab: Prefab = null

    @property({ type: Prefab, group: "Prefabs" })
    private gemBluePrefab: Prefab = null

    @property({ type: Prefab, group: "Prefabs" })
    private lampPrefab: Prefab = null

    protected onLoad(): void {
        // Cocos resets anchor and position everytime Tiled file reloaded
        this.node.getComponent(UITransform).setAnchorPoint(0, 0)
        this.node.setPosition(0, 0)

        const objects = this.getComponent(
            TiledObjectGroup,
        ).getObjects() as TileObject<keyof TileObjectTypes>[]

        const objectNodes: Map<ObjectId, Node> = new Map()
        const nodePortals: Map<ObjectId, ObjectId> = new Map() // <portal, destination>
        const triggerables: Map<ObjectId, ObjectId> = new Map() // <triggered, trigger>
        const movingPlatforms: Map<ObjectId, ObjectId> = new Map() // <platform, destination>

        for (const object of objects) {
            switch (object.class) {
                case "dialog":
                    objectNodes.set(object.id, this.createDialog(object))
                    break
                case "scenePortal":
                    objectNodes.set(object.id, this.createScenePortal(object))
                    break
                case "nodePortal":
                    const portal = this.createNodePortal(object)
                    objectNodes.set(object.id, portal)
                    nodePortals.set(object.id, object.destination)
                    break
                case "box":
                    const box = this.createBox(object)
                    objectNodes.set(object.id, box)
                    break
                case "stone":
                    const stone = this.createStone(object)
                    objectNodes.set(object.id, stone)
                    break
                case "stoneGenerator":
                    objectNodes.set(
                        object.id,
                        this.createStoneGenerator(object),
                    )
                    break
                case "stoneDestroyer":
                    objectNodes.set(
                        object.id,
                        this.createStoneDestroyer(object),
                    )
                    break
                case "moving":
                    const movingPlatform = this.createMovingPlatform(object)
                    objectNodes.set(object.id, movingPlatform)
                    movingPlatforms.set(object.id, object.moveTo)
                    break
                case "plate":
                    const plate = this.createPlate(object)
                    objectNodes.set(object.id, plate)
                    break
                case "gate":
                    const gate = this.createGate(object)
                    objectNodes.set(object.id, gate)
                    triggerables.set(object.id, object.trigger)
                    break
                case "laser":
                    const laser = this.createLaser(object)
                    objectNodes.set(object.id, laser)
                    break
                case "gem":
                    const gem = this.createGem(object)
                    objectNodes.set(object.id, gem)
                    break
                case "lamp":
                    const lamp = this.createLamp(object)
                    objectNodes.set(object.id, lamp)
                    break
                case "dummy":
                    objectNodes.set(object.id, this.createDummy(object))
                    break
                default:
                    console.warn(
                        `Unknown object class: ${(object as any).class}`,
                        object,
                    )
            }
        }

        for (const [portal, destination] of nodePortals) {
            const portalNode = objectNodes.get(portal)
            const destinationNode = objectNodes.get(destination)
            if (portalNode && destinationNode) {
                portalNode.getComponent(Portal)!.toNode = destinationNode
            }
        }

        for (const [triggered, trigger] of triggerables) {
            const triggeredNode = objectNodes.get(triggered)
            const triggerNode = objectNodes.get(trigger)
            if (triggeredNode && triggerNode) {
                triggerNode
                    .getComponent(Plate)!
                    .addConnectedEntity(
                        triggeredNode.getComponent(Entity) as TriggerableType,
                    )
            }
        }

        for (const [platform, destination] of movingPlatforms) {
            const platformNode = objectNodes.get(platform)
            const destinationNode = objectNodes.get(destination)
            if (platformNode && destinationNode) {
                platformNode.getComponent(MovingPlatform)!.moveToNode =
                    destinationNode
            }
        }
    }

    private createDialog(object: TileObject<"dialog">): Node {
        const dialogNode = instantiate(this.dialogPrefab)
        dialogNode.name = object.name
        dialogNode.setPosition(object.x, object.y)
        ResourceManager.getJsonAsset(object.dialog).then((asset) => {
            dialogNode.getComponent(Dialog)!.dialogData = asset
        })
        this.node.addChild(dialogNode)
        return dialogNode
    }

    private createScenePortal(object: TileObject<"scenePortal">): Node {
        const portalNode = instantiate(this.portalPrefab)
        portalNode.name = object.name
        portalNode.setPosition(object.x, object.y)
        const portal = portalNode.getComponent(Portal)
        portal.portalType = PortalType.SCENE
        portal.toScene = object.scene
        this.node.addChild(portalNode)
        return portalNode
    }

    private createNodePortal(object: TileObject<"nodePortal">): Node {
        const portalNode = instantiate(this.portalPrefab)
        portalNode.name = object.name
        portalNode.setPosition(object.x, object.y)
        const portal = portalNode.getComponent(Portal)
        portal.portalType = PortalType.NODE
        this.node.addChild(portalNode)
        return portalNode
    }

    private createBox(object: TileObject<"box">): Node {
        const boxNode = instantiate(this.boxPrefab)
        boxNode.name = object.name
        boxNode
            .getComponent(Box)
            .initialize(
                ColorStringToGroupMap[object.color],
                new Vec2(object.x, object.y),
                new Size(object.width, object.height),
            )
        this.node.addChild(boxNode)
        return boxNode
    }

    private createStone(object: TileObject<"stone">): Node {
        const stoneNode = instantiate(this.stonePrefab)
        stoneNode.name = object.name
        stoneNode
            .getComponent(Stone)
            .initialize(
                ColorStringToGroupMap[object.color],
                new Vec2(object.x, object.y),
                new Size(object.width, object.height),
            )
        this.node.addChild(stoneNode)
        return stoneNode
    }

    private createStoneGenerator(object: TileObject<"stoneGenerator">): Node {
        const stoneGenNode = instantiate(this.stoneGeneratorPrefab)
        stoneGenNode.name = object.name
        stoneGenNode
            .getComponent(StoneGenerator)
            .initialize(
                new Vec2(object.x, object.y),
                new Size(object.width, object.height),
                object.interval,
                object.pattern,
            )
        this.node.addChild(stoneGenNode)
        return stoneGenNode
    }

    private createStoneDestroyer(object: TileObject<"stoneDestroyer">): Node {
        const stoneDestroyerNode = instantiate(this.stoneDestroyerPrefab)
        stoneDestroyerNode.name = object.name
        stoneDestroyerNode
            .getComponent(StoneDestroyer)
            .initialize(
                new Vec2(object.x, object.y),
                new Size(object.width, object.height),
            )
        this.node.addChild(stoneDestroyerNode)
        return stoneDestroyerNode
    }

    private createMovingPlatform(object: TileObject<"movingPlatform">): Node {
        const movingNode = instantiate(this.movingPlatformPrefab)
        movingNode.name = object.name
        movingNode.setPosition(object.x, object.y)
        movingNode
            .getComponent(MovingPlatform)!
            .initialize(
                ColorStringToGroupMap[object.color],
                new Vec2(object.x, object.y),
                new Size(object.width, object.height),
            )
        movingNode.getComponent(MovingPlatform)!.durationValue = object.duration
        this.node.addChild(movingNode)
        return movingNode
    }

    private createPlate(object: TileObject<"plate">): Node {
        const plateNode = instantiate(this.platePrefab)
        plateNode
            .getComponent(Plate)!
            .initialize(
                new Vec2(object.x, object.y),
                new Size(object.width, object.height),
            )
        this.node.addChild(plateNode)
        return plateNode
    }

    private createGate(object: TileObject<"gate">): Node {
        const gateNode = instantiate(this.gatePrefab)
        gateNode
            .getComponent(Gate)!
            .initialize(
                new Vec2(object.x, object.y),
                new Size(object.width, object.height),
                new Vec2(object.offsetX, object.offsetY),
                object.transition,
            )
        this.node.addChild(gateNode)
        return gateNode
    }

    private createLaser(object: TileObject<"laser">): Node {
        const laserNode = instantiate(this.laserPrefab)
        laserNode.name = object.name
        laserNode
            .getComponent(Laser)!
            .initialize(
                ColorStringToGroupMap[object.color],
                new Vec2(object.x, object.y),
                new Size(object.width, object.height),
            )
        this.node.addChild(laserNode)
        return laserNode
    }

    private createGem(object: TileObject<"gem">): Node {
        let gemPrefab: Prefab
        switch (object.color) {
            case "red":
                gemPrefab = this.gemRedPrefab
                break
            case "green":
                gemPrefab = this.gemGreenPrefab
                break
            case "blue":
                gemPrefab = this.gemBluePrefab
                break
            default:
                throw new Error(`Unknown gem color: ${object.color}`)
        }
        const gemNode = instantiate(gemPrefab)
        gemNode.name = object.name
        gemNode.setPosition(object.x, object.y)
        gemNode.getComponent(Gem).setZone(object.zone)
        this.node.addChild(gemNode)
        return gemNode
    }

    private createLamp(object: TileObject<"lamp">): Node {
        const lampNode = instantiate(this.lampPrefab)
        lampNode.name = object.name
        lampNode
            .getComponent(Lamp)
            .initialize(
                new Vec2(object.x, object.y),
                object.radius,
                object.angle,
            )
        this.node.addChild(lampNode)
        return lampNode
    }

    private createDummy(object: TileObject<"dummy">): Node {
        const dummyNode = new Node(object.name)
        dummyNode.setPosition(object.x, object.y)
        this.node.addChild(dummyNode)
        return dummyNode
    }
}
