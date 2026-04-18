export function shouldMountPlayer(itemIndex: number, activeIndex: number): boolean {
  return Math.abs(itemIndex - activeIndex) <= 1;
}
