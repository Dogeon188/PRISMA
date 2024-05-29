import {
    Collider2D,
    Component,
    ERigidBody2DType,
    Enum,
    RigidBody2D,
    _decorator,
} from "cc"
const { ccclass, property, requireComponent, executionOrder } = _decorator

/**
 * Group of colliders, applied to {@linkcode Collider2D.group}
 * @see {@link https://docs.cocos.com/creator/manual/zh/physics/physics-group-mask.html|Physics Group & Mask}
 */
export const ColliderGroup = Enum({
    DEFAULT: 1 << 0,
    RED: 1 << 1,
    GREEN: 1 << 2,
    BLUE: 1 << 3,
})

/**
 * Type of collider, applied to {@linkcode Collider2D.tag} \
 * Used to identify different objects with low cost
 */
export const ColliderType = Enum({
    /** fallback type, do not use in game */
    NONE: 0,
    /** solid, static ground & wall */
    GROUND: -1,
    /** one way platform, can stand on top */
    ONEWAY: -1,
    /** kills player on touch */
    SPIKE: -1,
    /** the player */
    PLAYER: 32,
    /**
     * A range of halo around player.
     * Collider of colored objects will be affected when within the halo. */
    HALO: -1,
    /** Interactable sensor entity. */
    SENSOR: 64,
    /** Interactable items, not a sensor */
    OBJECT: -1,
})

/**
 * @summary Set collider type and rigid body properties on load
 * @description
 * Add this component to a node with Collider2D and RigidBody2D, and set its "Collider Type" property to the desired type in the editor. \
 * Possible types are defined in {@link ColliderType}
 */
@ccclass("ColliderManager")
@requireComponent(RigidBody2D)
@executionOrder(100)
export class ColliderManager extends Component {
    @property({
        type: ColliderType,
        visible: true,
        displayName: "Collider Type",
        tooltip:
            "Type of collider. See <code>ColliderType</code> in <code>ColliderManager.ts</code> for details",
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
        const rigidBody = this.getComponent(RigidBody2D)
        for (const collider of this.node.getComponents(Collider2D)) {
            collider.tag = this._type
            // collider.group = this._type
            switch (this._type) {
                case ColliderType.GROUND:
                    rigidBody.type = ERigidBody2DType.Static
                    rigidBody.fixedRotation = true
                    break
                case ColliderType.PLAYER:
                    rigidBody.type = ERigidBody2DType.Dynamic
                    rigidBody.enabledContactListener = true
                    rigidBody.fixedRotation = true
                    break
                case ColliderType.SENSOR:
                    rigidBody.type = ERigidBody2DType.Static
                    collider.sensor = true
                    break
            }
        }
    }
}
