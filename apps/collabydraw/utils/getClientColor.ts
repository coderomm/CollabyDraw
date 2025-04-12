function hashToInteger(id: string) {
  let hash = 0;
  if (!id) return hash;

  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = (hash << 5) - hash + char;
  }
  return hash;
}

export const getClientColor = (collaborator: {
  userId: string;
  userName: string;
}) => {
  if (!collaborator?.userId) return "hsl(0, 0%, 83%)";

  const hash = Math.abs(hashToInteger(collaborator?.userId));
  const hue = (hash % 36) * 10;
  const saturation = 90;
  const lightness = 75;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};
