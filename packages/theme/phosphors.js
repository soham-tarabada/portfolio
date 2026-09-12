export const PHOSPHORS = [
  {
    id: "amber",
    label: "Amber",
    note: "P3 phosphor · the default",
    preview: { ground: "#0b0906", panel: "#131009", rule: "#2e2418", text: "#e9deca", phosphor: "#ffb000", phosphorDim: "#c98a1e" },
  },
  {
    id: "green",
    label: "Green",
    note: "P1 phosphor · classic VDU",
    preview: { ground: "#050a05", panel: "#0a1109", rule: "#1d2c1a", text: "#d4ecd0", phosphor: "#7cd97c", phosphorDim: "#4faa52" },
  },
  {
    id: "cyan",
    label: "Cyan",
    note: "Cold cathode",
    preview: { ground: "#060b0c", panel: "#091213", rule: "#182d2e", text: "#c8e7ea", phosphor: "#00eeff", phosphorDim: "#31bcc6" },
  },
  {
    id: "mono",
    label: "Mono",
    note: "P4 phosphor · monochrome",
    preview: { ground: "#08090a", panel: "#0d0e10", rule: "#202226", text: "#d3d8de", phosphor: "#d5d9de", phosphorDim: "#a6acb5" },
  },
];

export const PHOSPHOR_IDS = PHOSPHORS.map((phosphor) => phosphor.id);

export const DEFAULT_PHOSPHOR = "amber";

export function isPhosphor(value) {
  return PHOSPHOR_IDS.includes(value);
}

export function findPhosphor(value) {
  return PHOSPHORS.find((phosphor) => phosphor.id === value) || PHOSPHORS[0];
}

export function nextPhosphor(value, step = 1) {
  const index = PHOSPHOR_IDS.indexOf(value);
  const from = index === -1 ? 0 : index;
  return PHOSPHOR_IDS[(from + step + PHOSPHOR_IDS.length) % PHOSPHOR_IDS.length];
}
