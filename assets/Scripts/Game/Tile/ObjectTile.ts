import {
    _decorator,
    Component,
    instantiate,
    Prefab,
    TiledObjectGroup,
    UITransform,
} from "cc"
import { ResourceManager } from "../../ResourceManager"
import { Dialog } from "../Entities/Dialog"
import { Portal, PortalType } from "../Entities/Portal"
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
        /** The node name to move to */
        node: string
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

    protected onLoad(): void {
        // Cocos resets anchor and position everytime Tiled file reloaded
        this.node.getComponent(UITransform).setAnchorPoint(0, 0)
        this.node.setPosition(0, 0)

        const objects = this.getComponent(
            TiledObjectGroup,
        ).getObjects() as TileObject<keyof TileObjectTypes>[]

        for (const object of objects) {
            switch (object.class) {
                case "dialog":
                    this.createDialog(object)
                    break
                case "scenePortal":
                    this.createScenePortal(object)
                    break
                case "nodePortal":
                    console.warn("Node portal not implemented")
                    break
                default:
                    console.warn(
                        `Unknown object class: ${(object as any).class}`,
                    )
            }
        }
    }

    private createDialog(object: TileObject<"dialog">): void {
        const dialogNode = instantiate(this.dialogPrefab)
        dialogNode.name = object.name
        dialogNode.setPosition(object.x, object.y)
        ResourceManager.getJsonAsset(object.dialog).then((asset) => {
            dialogNode.getComponent(Dialog)!.dialogData = asset
        })
        this.node.addChild(dialogNode)
    }

    private createScenePortal(object: TileObject<"scenePortal">): void {
        const portalNode = instantiate(this.portalPrefab)
        portalNode.name = object.name
        portalNode.setPosition(object.x, object.y)
        const portal = portalNode.getComponent(Portal)
        portal.portalType = PortalType.SCENE
        portal.toScene = object.scene
        this.node.addChild(portalNode)
    }
}
