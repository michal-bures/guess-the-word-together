export function capitalize(str: string): string {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export function redact(str: string) {
    return str ? str.slice(1, 4) + '*****' + str.slice(-4) : ''
}
