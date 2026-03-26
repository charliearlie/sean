export function getPicsumUrl(
  seed: string,
  width: number = 600,
  height: number = 400
): string {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}
