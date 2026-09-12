export const PROJECT_FOLDER = "projects";

export function buildTree(content) {
  if (!content) return [];

  const nodes = [];

  for (const section of content.sections) {
    if (section.key === PROJECT_FOLDER) {
      nodes.push({
        type: "folder",
        id: PROJECT_FOLDER,
        name: section.filename,
        label: section.label,
        order: section.order,
        index: {
          type: "file",
          id: `section:${PROJECT_FOLDER}`,
          name: `${section.filename}/`,
          label: section.label,
          language: "markdown",
          kind: PROJECT_FOLDER,
        },
        children: content.projects.map((project) => ({
          type: "file",
          id: `project:${project.slug}`,
          name: project.filename,
          label: project.title,
          language: "markdown",
          kind: "project",
          slug: project.slug,
        })),
      });
      continue;
    }

    nodes.push({
      type: "file",
      id: `section:${section.key}`,
      name: section.filename,
      label: section.label,
      language: section.language,
      kind: section.key,
    });
  }

  return nodes;
}

export function flattenFiles(tree) {
  return tree.flatMap((node) =>
    node.type === "folder" ? [node.index, ...node.children].filter(Boolean) : [node]
  );
}

export function findFile(tree, id) {
  return flattenFiles(tree).find((file) => file.id === id) || null;
}

export function defaultFileId(content, tree) {
  const preferred = content?.sections?.find((section) => section.openByDefault);
  if (preferred) {
    const match = findFile(tree, `section:${preferred.key}`);
    if (match) return match.id;
  }
  return flattenFiles(tree)[0]?.id || null;
}
