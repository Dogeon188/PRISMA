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
const { ccclass, property, requireComponent } = _decorator

type TileObjectTypes = {
    dialog: {
        class: "dialog"
        /** The dialog data file path without file association, with prefix `resources/Data/` added internally */
        dialog: string
    }
}

type TileObject<T extends keyof TileObjectTypes> = TileObjectTypes[T] &
    ReturnType<TiledObjectGroup["getObject"]>

@ccclass("ObjectTile")
@requireComponent(TiledObjectGroup)
export class ObjectTile extends Component {
    @property({ type: Prefab, group: "Prefabs" })
    private dialogPrefab: Prefab = null

    protected onLoad(): void {
        // Cocos resets anchor and position everytime Tiled file reloaded
        this.node.getComponent(UITransform).setAnchorPoint(0, 0)
        this.node.setPosition(0, 0)

        const objects = this.getComponent(
            TiledObjectGroup,
        ).getObjects() as TileObject<any>[]

        for (const object of objects) {
            switch (object.class) {
                case "dialog":
                    this.createDialog(object)
                    break
                default:
                    console.warn(`Unknown object class: ${object.class}`)
            }
        }
    }

    private createDialog(object: TileObject<"dialog">): void {
        const dialogNode = instantiate(this.dialogPrefab)
        dialogNode.setPosition(object.x, object.y)
        ResourceManager.getJsonAsset(object.dialog).then((asset) => {
            dialogNode.getComponent(Dialog)!.dialogData = asset
        })
        this.node.addChild(dialogNode)
    }
}
