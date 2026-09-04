/**
 * Utility to generate free, lightweight SVG avatars using Dicebear API.
 * Does not require image storage space and provides deterministic avatars per username.
 */
export const getDicebearAvatar = (seed = 'user', style = 'bottts-neutral') => {
  const safeSeed = encodeURIComponent(seed.toLowerCase().trim() || 'notecreep');
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${safeSeed}&backgroundColor=0d1117,0a1628,161f30`;
};
