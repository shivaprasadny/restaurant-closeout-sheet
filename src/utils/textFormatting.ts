export function capitalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/(^|[\s'-])([a-z])/g, (_, separator: string, letter: string) =>
      `${separator}${letter.toUpperCase()}`
    );
}
