import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSessionState } from "../lib/useSessionState.js";

const LANGUAGE_TAGS = {
  markdown: "MD",
  typescript: "TS",
  javascript: "JS",
  json: "{}",
  shell: "SH",
};

function buildRows(tree, expanded) {
  const rows = [
    { key: "root", kind: "root", name: "~/portfolio", depth: 0, expandable: true },
  ];

  if (expanded.root === false) return rows;

  for (const node of tree) {
    if (node.type === "folder") {
      const open = expanded[node.id] !== false;

      rows.push({
        key: node.id,
        kind: "folder",
        node,
        name: node.name,
        depth: 1,
        expandable: true,
        expanded: open,
        count: node.children.length,
        fileId: node.index?.id || null,
      });

      if (!open) continue;

      for (const child of node.children) {
        rows.push({
          key: child.id,
          kind: "file",
          file: child,
          name: child.name,
          depth: 2,
          fileId: child.id,
        });
      }

      continue;
    }

    rows.push({
      key: node.id,
      kind: "file",
      file: node,
      name: node.name,
      depth: 1,
      fileId: node.id,
    });
  }

  return rows;
}

export default function Explorer({
  tree,
  activeId,
  openIds,
  onOpen,
  socials,
  onSocial,
  compact,
  open,
}) {
  const [expanded, setExpanded] = useSessionState("portfolio.tree", {});
  const [focusKey, setFocusKey] = useState("root");
  const wantsFocus = useRef(false);
  const nodes = useRef(new Map());

  const rows = useMemo(() => buildRows(tree, expanded), [tree, expanded]);

  const toggle = useCallback(
    (key, next) => {
      setExpanded((current) => {
        const isOpen = current[key] !== false;
        const value = next === undefined ? !isOpen : next;
        if (value === isOpen) return current;
        return { ...current, [key]: value };
      });
    },
    [setExpanded]
  );

  useEffect(() => {
    if (rows.some((row) => row.key === focusKey)) return;
    setFocusKey(rows[0]?.key || "root");
  }, [rows, focusKey]);

  useEffect(() => {
    if (!wantsFocus.current) return;
    wantsFocus.current = false;
    nodes.current.get(focusKey)?.focus();
  }, [focusKey]);

  const activate = useCallback(
    (row) => {
      if (row.kind === "root") {
        toggle("root");
        return;
      }

      if (row.kind === "folder") {
        toggle(row.key);
        if (row.fileId) onOpen(row.fileId);
        return;
      }

      onOpen(row.fileId);
    },
    [onOpen, toggle]
  );

  const move = useCallback(
    (index) => {
      const row = rows[Math.max(0, Math.min(rows.length - 1, index))];
      if (!row) return;
      wantsFocus.current = true;
      setFocusKey(row.key);
    },
    [rows]
  );

  const onKeyDown = (event) => {
    const index = rows.findIndex((row) => row.key === focusKey);
    if (index === -1) return;
    const row = rows[index];

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        move(index + 1);
        return;

      case "ArrowUp":
        event.preventDefault();
        move(index - 1);
        return;

      case "Home":
        event.preventDefault();
        move(0);
        return;

      case "End":
        event.preventDefault();
        move(rows.length - 1);
        return;

      case "ArrowRight":
        event.preventDefault();
        if (row.expandable && row.expanded === false) toggle(row.key, true);
        else if (row.expandable) move(index + 1);
        return;

      case "ArrowLeft": {
        event.preventDefault();
        if (row.expandable && row.expanded !== false) {
          toggle(row.key, false);
          return;
        }
        const parent = rows.slice(0, index).reverse().find((entry) => entry.depth < row.depth);
        if (parent) move(rows.indexOf(parent));
        return;
      }

      case "Enter":
      case " ":
        event.preventDefault();
        activate(row);
        return;

      default:
    }
  };

  return (
    <aside
      id="explorer"
      className="explorer"
      data-compact={compact}
      data-open={open}
      aria-label="File explorer"
    >
      <div className="explorer__head">Explorer</div>

      <div
        className="explorer__tree"
        role="tree"
        aria-label="Files"
        onKeyDown={onKeyDown}
      >
        {rows.map((row, index) => {
          const isActive = row.fileId && row.fileId === activeId;
          const isOpen = row.fileId && openIds.includes(row.fileId);
          const expandedState = row.expandable
            ? row.kind === "root"
              ? expanded.root !== false
              : row.expanded
            : undefined;

          return (
            <button
              type="button"
              key={row.key}
              id={`tree-${row.key}`}
              ref={(element) => {
                if (element) nodes.current.set(row.key, element);
                else nodes.current.delete(row.key);
              }}
              className={`tree__${row.kind === "root" ? "root" : row.kind}`}
              role="treeitem"
              aria-level={row.depth + 1}
              aria-setsize={rows.length}
              aria-posinset={index + 1}
              aria-expanded={expandedState}
              aria-current={isActive ? "true" : undefined}
              data-active={isActive || undefined}
              data-open={(isOpen && !isActive) || undefined}
              tabIndex={row.key === focusKey ? 0 : -1}
              style={{ paddingLeft: `${0.75 + row.depth * 0.9}rem` }}
              onFocus={() => setFocusKey(row.key)}
              onClick={() => activate(row)}
            >
              {row.expandable ? (
                <span className="tree__chevron" aria-hidden="true">
                  {expandedState ? "▾" : "▸"}
                </span>
              ) : (
                <span className="tree__tag" aria-hidden="true">
                  {LANGUAGE_TAGS[row.file.language] || "··"}
                </span>
              )}

              <span className="tree__name">{row.name}</span>

              {row.kind === "folder" ? <span className="tree__count">{row.count}</span> : null}
            </button>
          );
        })}
      </div>

      <div className="explorer__foot">
        <span className="explorer__foot-head">Elsewhere</span>
        <ul className="explorer__socials">
          {socials.map((social) => (
            <li key={social.platform}>
              <a
                href={social.url}
                target="_blank"
                rel="noreferrer noopener"
                onClick={() => onSocial?.(social)}
              >
                {social.label}
                <span aria-hidden="true"> ↗</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
