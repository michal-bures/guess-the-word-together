// Predefined color palette for players
const PLAYER_COLORS = [
    '#3B82F6', // blue-500
    '#10B981', // emerald-500
    '#F59E0B', // amber-500
    '#EF4444', // red-500
    '#8B5CF6', // violet-500
    '#EC4899', // pink-500
    '#06B6D4', // cyan-500
    '#84CC16', // lime-500
    '#F97316', // orange-500
    '#6366F1', // indigo-500
    '#14B8A6', // teal-500
    '#EAB308' // yellow-500
] as const

export type PlayerColor = (typeof PLAYER_COLORS)[number]

/**
 * Gets the next color for a new player based on the number of existing players
 * Uses round-robin assignment to cycle through the color palette
 *
 * @param playerCount - Current number of players (0-based)
 * @returns Hex color string for the new player
 */
export function getNextColor(colorsTaken: string[]): PlayerColor {
    return (
        PLAYER_COLORS.find(c => !colorsTaken.includes(c)) ||
        (PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)] as PlayerColor)
    )
}

/**
 * Gets the color name for a given hex color (for nickname generation)
 */
export function getColorName(color: PlayerColor): string {
    const colorMap: Record<PlayerColor, string> = {
        '#EF4444': 'Red',
        '#3B82F6': 'Blue',
        '#10B981': 'Green',
        '#F59E0B': 'Amber',
        '#8B5CF6': 'Purple',
        '#EC4899': 'Pink',
        '#06B6D4': 'Cyan',
        '#84CC16': 'Lime',
        '#F97316': 'Orange',
        '#6366F1': 'Indigo',
        '#14B8A6': 'Teal',
        '#EAB308': 'Yellow'
    }

    return colorMap[color] || 'Unknown'
}

/**
 * Gets all available colors
 */
export function getAllColors(): readonly PlayerColor[] {
    return PLAYER_COLORS
}

// Animal names for nickname generation
const ANIMALS = [
    'Falcon',
    'Eagle',
    'Hawk',
    'Owl',
    'Raven',
    'Wolf',
    'Fox',
    'Bear',
    'Tiger',
    'Lion',
    'Dolphin',
    'Whale',
    'Shark',
    'Octopus',
    'Turtle',
    'Dragon',
    'Phoenix',
    'Unicorn',
    'Griffin',
    'Pegasus',
    'Panther',
    'Jaguar',
    'Cheetah',
    'Lynx',
    'Leopard',
    'Elephant',
    'Rhino',
    'Hippo',
    'Giraffe',
    'Zebra',
    'Penguin',
    'Flamingo',
    'Peacock',
    'Swan',
    'Heron',
    'Butterfly',
    'Dragonfly',
    'Firefly',
    'Beetle',
    'Spider',
    'Otter',
    'Seal',
    'Walrus',
    'Beaver',
    'Raccoon',
    'Rabbit',
    'Squirrel',
    'Chipmunk',
    'Hamster',
    'Hedgehog'
] as const

/**
 * Generates a nickname based on the player's color and a random animal
 * Format: "ColorName Animal" (e.g., "Red Falcon", "Blue Dragon")
 *
 * @param color - The player's assigned color
 * @returns A unique-sounding nickname
 */
export function generateNickname(color: PlayerColor): string {
    const colorName = getColorName(color)
    const randomAnimal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]

    return `${colorName} ${randomAnimal}`
}
