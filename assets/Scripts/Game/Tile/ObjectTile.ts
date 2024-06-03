import {
    _decorator,
    BoxCollider2D,
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
import { Portal, PortalType } from "../Entities/Portal"
import { ColorStringToGroupMap } from "../Physics/ColliderManager"
const { ccclass, property, requireComponent } = _decorator

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
        destination: number
    }
    /** Box that can be pushed/pulled by the player */
    box: {
        class: "box"
        color: "red" | "green" | "blue"
    }
    /** Color gem */
    gem: {
        class: "gem"
        color: "red" | "green" | "blue"
    }
    /** Dummy object just for reference */
    dummy: {
        class: "dummy"
    }
}

type TileObject<T extends keyof TileObjectTypes> = TileObjectTypes[T] &
    ReturnType<TiledObjectGroup["getObject"]>

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
    private gemRedPrefab: Prefab = null

    @property({ type: Prefab, group: "Prefabs" })
    private gemGreenPrefab: Prefab = null

    @property({ type: Prefab, group: "Prefabs" })
    private gemBluePrefab: Prefab = null

    protected onLoad(): void {
        // Cocos resets anchor and position everytime Tiled file reloaded
        this.node.getComponent(UITransform).setAnchorPoint(0, 0)
        this.node.setPosition(0, 0)

        const objects = this.getComponent(
            TiledObjectGroup,
        ).getObjects() as TileObject<keyof TileObjectTypes>[]

        const objectNodes: Map<string | number, Node> = new Map()
        const nodePortals: Map<string | number, string | number> = new Map()

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
                case "gem":
                    const gem = this.createGem(object)
                    objectNodes.set(object.id, gem)
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
        // destination node id set
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
        this.node.addChild(gemNode)
        return gemNode
    }

    private createDummy(object: TileObject<"dummy">): Node {
        const dummyNode = new Node(object.name)
        dummyNode.setPosition(object.x, object.y)
        this.node.addChild(dummyNode)
        return dummyNode
    }
}
