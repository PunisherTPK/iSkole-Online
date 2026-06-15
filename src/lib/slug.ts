export function slugify(value: string | number) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function paperSlug(year: number, title: string) {
  return `${year}-${slugify(title.replace(String(year), ""))}`.replace(/-+$/g, "");
}
