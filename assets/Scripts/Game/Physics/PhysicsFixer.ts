import { Collider2D, IPhysics2DContact, Vec2 } from "cc"

/**
 * @returns The correct normal direction
 * @see {@link NormalDirection} for mnemonic
 * @description
 * sometimes cocos creator will swap the normal direction \
 * reason and mechanic is unknown, but can detect by checking collider A/B order \
 * usually self should be collider B, flip the normal if self is collider A \
 * SB cocos creator
 * @returns The correct normal direction
 */
export function getCorrectNormal(
    self: Collider2D,
    other: Collider2D,
    contact: IPhysics2DContact,
) {
    // NOTE
    let normal = contact.getWorldManifold().normal

    if (contact.colliderA.node === self.node) {
        return new Vec2(-normal.x, -normal.y)
    } else {
        return normal
    }
}

/**
 * @summary Mnemonic for y-axis normal direction
 * @description
 * `ON_TOP`: stand on top \
 * `FROM_BOTTOM`: hit from bottom
 */
export enum NormalDirection {
    ON_TOP = 1,
    FROM_BOTTOM = -1,
}

/**
 * @summary Compare two numbers with slight tolerance
 * @param a - The first number
 * @param b - The second number
 * @param epsilon - The epsilon (tolerance) value, default is 1e-5
 * @returns Whether the two numbers are almost equal
 */
export function fuzzyEqual(a: number, b: number, epsilon: number = 1e-5) {
    return Math.abs(a - b) < epsilon
}