export function pathForFile(file) {
  if (!file) return "/";
  if (file.kind === "project") return `/projects/${file.slug}`;
  return `/${file.kind}`;
}

export function fileForPath(pathname, files) {
  const clean = String(pathname || "/").replace(/\/+$/, "") || "/";
  if (clean === "/") return null;

  const project = clean.match(/^\/projects\/([a-z0-9-]+)$/i);
  if (project) {
    return files.find((file) => file.kind === "project" && file.slug === project[1]) || null;
  }

  const key = clean.slice(1);
  return files.find((file) => file.kind === key) || null;
}
