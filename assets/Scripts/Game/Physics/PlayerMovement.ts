/**
 * Bitwise enum for player movement direction
 */
enum Direction {
    STATIC = 0b0000,
    LEFT = 0b0001,
    RIGHT = 0b0010,
    UP = 0b0100,
    DOWN = 0b1000,
}

export class Movement {
    movement: Direction = Direction.STATIC

    /**
     * Whether the player is moving left, and not right
     */
    get left(): boolean {
        return (
            (this.movement & Direction.LEFT) === Direction.LEFT &&
            (this.movement & Direction.RIGHT) !== Direction.RIGHT
        )
    }

    /**
     * Set/reset the left movement flag
     */
    set left(value: boolean) {
        this.movement = value
            ? this.movement | Direction.LEFT
            : this.movement & ~Direction.LEFT
    }

    /**
     * Whether the player is moving right, and not left
     */
    get right(): boolean {
        return (
            (this.movement & Direction.RIGHT) === Direction.RIGHT &&
            (this.movement & Direction.LEFT) !== Direction.LEFT
        )
    }

    /**
     * Set/reset the right movement flag
     */
    set right(value: boolean) {
        this.movement = value
            ? this.movement | Direction.RIGHT
            : this.movement & ~Direction.RIGHT
    }

    /**
     * Whether the player is moving up, and not down
     */
    get up(): boolean {
        return (
            (this.movement & Direction.UP) === Direction.UP &&
            (this.movement & Direction.DOWN) !== Direction.DOWN
        )
    }

    /**
     * Set/reset the up movement flag
     */
    set up(value: boolean) {
        this.movement = value
            ? this.movement | Direction.UP
            : this.movement & ~Direction.UP
    }

    /**
     * Whether the player is moving down, and not up
     */
    get down(): boolean {
        return (
            (this.movement & Direction.DOWN) === Direction.DOWN &&
            (this.movement & Direction.UP) !== Direction.UP
        )
    }

    /**
     * Set/reset the down movement flag
     */
    set down(value: boolean) {
        this.movement = value
            ? this.movement | Direction.DOWN
            : this.movement & ~Direction.DOWN
    }

    /**
     * Whether the player is not moving \
     * Can be none, or *moving in opposite directions at the same time*
     */
    get static(): boolean {
        return (
            this.movement === Direction.STATIC ||
            this.movement === (Direction.UP ^ Direction.DOWN) ||
            this.movement === (Direction.LEFT ^ Direction.RIGHT)
        )
    }

    reset(): void {
        this.movement = Direction.STATIC
    }
}
