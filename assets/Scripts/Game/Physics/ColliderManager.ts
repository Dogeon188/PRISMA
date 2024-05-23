import { Collider2D, Component, Enum, _decorator } from "cc"
const { ccclass, property } = _decorator

export const ColliderType = Enum({
    /** fallback type, do not use in game */ NONE: 0,
    /** solid, static ground & wall */ GROUND: -1,
    /** one way platform, can stand on top */ ONEWAY: -1,
    /** kills player on touch */ SPIKE: -1,
    /** the player */ PLAYER: -1,
    /** interactable items, sensor only */ ITEM: -1,
})

@ccclass("ColliderManager")
export class ColliderManager extends Component {
    @property({
        type: ColliderType,
        visible: true,
        displayName: "Collider Type",
        tooltip: "Type of collider",
    })
    private _type: number = ColliderType.NONE

    /**
     * Type of collider
     * @see {@link ColliderType} for available types
     */
    get type(): number {
        return this._type
    }

    protected onLoad(): void {
        for (const collider of this.node.getComponents(Collider2D)) {
            collider.tag = this._type
            if (this._type === ColliderType.ITEM) {
                collider.sensor = true
            }
        }
    }
}
