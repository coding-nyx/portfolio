export function createField(width, height) {
  const points = [];
  const spacing = 48;
  for (let y = 24, row = 0; y < height + spacing; y += spacing, row += 1) {
    for (let x = -spacing, column = 0; x < width + spacing; x += spacing, column += 1) {
      const seed = (row * 43 + column * 17) % 13;
      points.push({
        x: x + (seed - 6) * 1.8,
        y: y + ((seed * 3) % 11) - 5,
        offsetX: 0,
        offsetY: 0,
        seed,
        warmth: 0,
      });
    }
  }
  return points;
}

export function updateField(points, pointer) {
  let movement = 0;
  points.forEach((point) => {
    const dx = point.x - pointer.x;
    const dy = point.y - pointer.y;
    const distance = Math.hypot(dx, dy);
    const influence = pointer.active ? Math.max(0, 1 - distance / 240) ** 2 : 0;
    const nextX = (dx / Math.max(distance, 1)) * influence * 36;
    const nextY = (dy / Math.max(distance, 1)) * influence * 36;
    const stepX = (nextX - point.offsetX) * 0.16;
    const stepY = (nextY - point.offsetY) * 0.16;
    const stepWarmth = (influence - point.warmth) * 0.16;
    point.offsetX += stepX;
    point.offsetY += stepY;
    point.warmth += stepWarmth;
    movement = Math.max(movement, Math.abs(stepX), Math.abs(stepY), Math.abs(stepWarmth) * 20);
  });
  return movement;
}

export function paintField(context, points, width, height) {
  context.clearRect(0, 0, width, height);
  points.forEach((point) => {
    const alpha = 0.06 + (point.seed / 13) * 0.08 + point.warmth * 0.7;
    const size = (point.seed % 4 === 0 ? 1.8 : 1.2) + point.warmth * 0.9;
    context.fillStyle = `rgba(255, 160, 91, ${alpha})`;
    context.fillRect(point.x + point.offsetX, point.y + point.offsetY, size, size);
  });
}
