export function slugify(str: string): string {
  return str
    .normalize('NFD') // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, '') // remove diacritical marks
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // remove all non-word characters (except space and hyphen)
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/-+/g, '-') // replace multiple hyphens with single hyphen
    .replace(/^-+/, '') // remove leading hyphens
    .replace(/-+$/, '') // remove trailing hyphens
    .trim()
}
