import { PHOSPHORS, PHOSPHOR_IDS, isPhosphor, nextPhosphor } from "@portfolio/theme/phosphors.js";
import { line, blank, table, wrap } from "./output.js";
import { ASK_SUGGESTIONS, validateQuestion } from "../ask.js";
import { keysFor } from "../useKeys.js";
import { asciiFrame } from "../toon/sprite.js";
import { TOON_NAME } from "../toon/dialogue.js";
import {
  fileText,
  skillsText,
  experienceText,
  projectsText,
  educationText,
  usesText,
  contactText,
} from "./plainText.js";

export const ROOT = "~/portfolio";
export const PROJECTS_DIR = "~/portfolio/projects";

function basename(name) {
  return name.toLowerCase().replace(/\.[^.]+$/, "");
}

export function resolveFile(token, files) {
  if (!token) return null;
  const needle = String(token).toLowerCase().replace(/^\.\//, "").replace(/^projects\//, "");

  return (
    files.find((file) => file.name.toLowerCase() === needle) ||
    files.find((file) => file.kind === needle) ||
    files.find((file) => file.slug === needle) ||
    files.find((file) => basename(file.name) === needle) ||
    null
  );
}

function formatUptime(startedAt) {
  const total = Math.floor((Date.now() - startedAt) / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

const NEOFETCH_ART = [
  "        ▄▄▄▄▄▄▄▄▄        ",
  "     ▄█████████████▄     ",
  "    ███▀         ▀███    ",
  "   ███             ███   ",
  "   ███    ▄███▄    ███   ",
  "   ███    ▀███▀    ███   ",
  "    ███▄         ▄███    ",
  "     ▀█████████████▀     ",
  "        ▀▀▀▀▀▀▀▀▀        ",
];

const QUESTION_OPENERS = [
  "what",
  "who",
  "when",
  "where",
  "why",
  "how",
  "which",
  "whose",
  "is",
  "are",
  "was",
  "were",
  "do",
  "does",
  "did",
  "can",
  "could",
  "has",
  "have",
  "should",
  "would",
  "will",
  "tell",
  "show",
  "explain",
];

export function looksLikeQuestion(raw) {
  const text = String(raw || "").trim();
  if (!text) return false;

  const words = text.split(/\s+/);
  if (words.length < 2) return false;
  if (findCommand(words[0].toLowerCase())) return false;

  return text.endsWith("?") || QUESTION_OPENERS.includes(words[0].toLowerCase());
}

export const COMMANDS = [
  {
    name: "help",
    group: "session",
    usage: "help",
    summary: "List every command",
    run: () => {
      const groups = [
        ["navigation", COMMANDS.filter((c) => c.group === "navigation")],
        ["content", COMMANDS.filter((c) => c.group === "content")],
        ["session", COMMANDS.filter((c) => c.group === "session")],
      ];

      return {
        lines: groups.flatMap(([title, commands], index) => [
          line(title.toUpperCase(), "accent"),
          ...table(commands.map((command) => [command.usage, command.summary, "dim"])),
          ...(index < groups.length - 1 ? [blank()] : []),
        ]),
      };
    },
  },
  {
    name: "ls",
    group: "navigation",
    usage: "ls",
    summary: "List files in the current directory",
    run: (args, ctx) => {
      if (ctx.cwd === PROJECTS_DIR) {
        return {
          lines: table(
            ctx.files
              .filter((file) => file.kind === "project")
              .map((file) => [file.name, file.label, "dim"])
          ),
        };
      }

      const rows = ctx.tree.map((node) =>
        node.type === "folder"
          ? [`${node.name}/`, `${node.children.length} projects`, "accent"]
          : [node.name, node.label, "dim"]
      );

      return { lines: table(rows) };
    },
  },
  {
    name: "cd",
    group: "navigation",
    usage: "cd <dir>",
    summary: "Change directory",
    run: (args, ctx) => {
      const target = (args[0] || "~").toLowerCase();

      if (["~", "/", "..", ""].includes(target)) {
        ctx.setCwd(ROOT);
        return { lines: [] };
      }

      if (target === "projects" || target === "projects/") {
        ctx.setCwd(PROJECTS_DIR);
        return { lines: [] };
      }

      return { lines: [line(`cd: no such directory: ${args[0]}`, "error")] };
    },
  },
  {
    name: "pwd",
    group: "navigation",
    usage: "pwd",
    summary: "Print the current directory",
    run: (args, ctx) => ({ lines: [line(ctx.cwd)] }),
  },
  {
    name: "cat",
    group: "content",
    usage: "cat <file>",
    summary: "Print a file without opening it",
    run: (args, ctx) => {
      if (!args[0]) return { lines: [line("cat: missing file operand", "error")] };

      const file = resolveFile(args[0], ctx.files);
      if (!file) return { lines: [line(`cat: ${args[0]}: no such file`, "error")] };

      return { lines: fileText(file, ctx.content) };
    },
  },
  {
    name: "open",
    group: "navigation",
    usage: "open <file>",
    summary: "Open a file in the editor",
    run: (args, ctx) => {
      if (!args[0]) return { lines: [line("open: missing file operand", "error")] };

      const file = resolveFile(args[0], ctx.files);
      if (!file) return { lines: [line(`open: ${args[0]}: no such file`, "error")] };

      ctx.openFile(file.id);
      return { lines: [line(`opening ${file.kind === "project" ? "projects/" : ""}${file.name}`, "ok")] };
    },
  },
  {
    name: "whoami",
    group: "content",
    usage: "whoami",
    summary: "The short version",
    run: (args, ctx) => {
      const { profile } = ctx.content;
      const current = ctx.content.experience.find((role) => role.current);

      return {
        lines: [
          line(profile.name, "accent"),
          ...wrap(`${profile.roleTitle} · ${profile.location}`).map((row) => line(row, "dim")),
          blank(),
          ...wrap(profile.tagline).map((row) => line(row)),
          ...(current ? [blank(), line(`${current.role} at ${current.company}`, "dim")] : []),
        ],
      };
    },
  },
  {
    name: "skills",
    group: "content",
    usage: "skills [group]",
    summary: "Print the stack, optionally filtered",
    run: (args, ctx) => ({ lines: skillsText(ctx.content, args[0]) }),
  },
  {
    name: "experience",
    group: "content",
    usage: "experience",
    summary: "Print the work history",
    run: (args, ctx) => ({ lines: experienceText(ctx.content) }),
  },
  {
    name: "projects",
    group: "content",
    usage: "projects",
    summary: "List the production platforms",
    run: (args, ctx) => ({ lines: projectsText(ctx.content) }),
  },
  {
    name: "education",
    group: "content",
    usage: "education",
    summary: "Print education",
    run: (args, ctx) => ({ lines: educationText(ctx.content) }),
  },
  {
    name: "uses",
    group: "content",
    usage: "uses",
    summary: "Print the daily tools",
    run: (args, ctx) => ({ lines: usesText(ctx.content) }),
  },
  {
    name: "contact",
    group: "content",
    usage: "contact",
    summary: "Print every way to reach Soham",
    run: (args, ctx) => ({ lines: contactText(ctx.content) }),
  },
  {
    name: "mail",
    group: "content",
    usage: "mail",
    summary: "Open the message form in the editor",
    run: (args, ctx) => {
      const file = resolveFile("contact", ctx.files);
      if (!file) return { lines: [line("mail: contact.sh is not in this workspace", "error")] };

      ctx.openFile(file.id);
      return {
        lines: [
          line(`opening ${file.name}`, "ok"),
          line("The form on the right writes straight to the admin inbox.", "dim"),
        ],
      };
    },
  },
  {
    name: "email",
    group: "content",
    usage: "email",
    summary: "Copy the email address to the clipboard",
    run: (args, ctx) => {
      ctx.copyText(ctx.content.profile.email);
      return { lines: [line(`copied ${ctx.content.profile.email}`, "ok")] };
    },
  },
  {
    name: "socials",
    group: "content",
    usage: "socials",
    summary: "List profile links",
    run: (args, ctx) => ({
      lines: ctx.content.profile.socials.map((social) =>
        line(`${social.label.padEnd(10)}${social.url}`, "link")
      ),
    }),
  },
  {
    name: "resume",
    group: "content",
    usage: "resume",
    summary: "Open the resume PDF",
    run: (args, ctx) => {
      ctx.openResume();
      return { lines: [line("opening Resume.pdf", "ok")] };
    },
  },
  {
    name: "spotify",
    group: "content",
    usage: "spotify",
    summary: "What Soham is listening to",
    run: (args, ctx) => {
      const state = ctx.nowPlaying;

      if (!state?.configured) {
        return { lines: [line("spotify: not connected on this deployment", "dim")] };
      }

      if (!state.track) {
        return { lines: [line("spotify: nothing played recently", "dim")] };
      }

      const { track } = state;
      const rows = [
        line(state.playing ? "now playing" : "last played", "accent"),
        ...table([
          ["track", track.title, "normal"],
          ["artist", track.artist, "normal"],
          ...(track.album ? [["album", track.album, "dim"]] : []),
        ]),
      ];

      if (track.url) rows.push(blank(), line(track.url, "link"));

      return { lines: rows };
    },
  },
  {
    name: "ask",
    group: "content",
    usage: "ask <question>",
    summary: "Ask a question about Soham's work",
    run: (args, ctx) => {
      const question = args.join(" ").trim();

      if (!question) {
        return {
          lines: [
            line("ask: what would you like to know?", "error"),
            blank(),
            ...ASK_SUGGESTIONS.map((example) => line(`  ask ${example}`, "dim")),
          ],
        };
      }

      const problem = validateQuestion(question);
      if (problem) return { lines: [line(`ask: ${problem}`, "error")] };

      if (!ctx.ask) {
        return { lines: [line("ask: not available in this session", "dim")] };
      }

      return {
        lines: [line("thinking\u2026", "dim")],
        resolve: async () => {
          try {
            const result = await ctx.ask(question);

            if (!result?.configured) {
              return {
                lines: [
                  line("ask: not enabled on this deployment", "dim"),
                  line("Every other command works offline. Try 'help'.", "dim"),
                ],
              };
            }

            if (!result.answer) {
              return { lines: [line("ask: no answer came back. Try rephrasing.", "dim")] };
            }

            return {
              lines: [
                ...wrap(result.answer).map((row) => line(row)),
                blank(),
                line(
                  `answered from this site's own content \u00b7 ${result.remaining} questions left today`,
                  "dim"
                ),
              ],
            };
          } catch (error) {
            return { lines: [line(`ask: ${error.message}`, "error")] };
          }
        },
      };
    },
  },
  {
    name: "keys",
    group: "session",
    usage: "keys",
    summary: "Every keyboard shortcut the shell understands",
    run: () => {
      const apple =
        typeof navigator !== "undefined" &&
        /mac|iphone|ipad|ipod/i.test(
          navigator.userAgentData?.platform || navigator.platform || navigator.userAgent || ""
        );
      const keys = keysFor(apple);

      return {
        lines: [
          line("EDITOR", "accent"),
          ...table([
            [keys.palette, "Command palette — jump to any file or action", "dim"],
            [keys.terminal, "Show or hide this terminal", "dim"],
            [keys.explorer, "Show or hide the file tree", "dim"],
            [keys.shortcuts, "Open the shortcut sheet", "dim"],
          ]),
          blank(),
          line("TABS", "accent"),
          ...table([
            [keys.nextTab, "Next open file", "dim"],
            [keys.prevTab, "Previous open file", "dim"],
            [keys.jumpTab, "Jump straight to the nth open file", "dim"],
            [keys.closeTab, "Close the current file", "dim"],
          ]),
          blank(),
          line("TERMINAL", "accent"),
          ...table([
            ["Tab", "Complete a command or a filename", "dim"],
            ["↑ ↓", "Walk back through what you have typed", "dim"],
            ["Ctrl+L", "Clear the scrollback", "dim"],
            ["Esc", "Close the terminal", "dim"],
          ]),
        ],
      };
    },
  },
  {
    name: "theme",
    group: "session",
    usage: "theme [name|list|next]",
    summary: "Switch phosphor",
    run: (args, ctx) => {
      const requested = (args[0] || "").toLowerCase();

      if (!requested) {
        ctx.openThemePicker();
        return {
          lines: [
            line("opening the phosphor picker…", "ok"),
            line(`${PHOSPHORS.length} palettes · run "theme list" to see them here`, "dim"),
          ],
        };
      }

      if (requested === "list") {
        return {
          lines: [
            line("PHOSPHORS", "accent"),
            ...table(
              PHOSPHORS.map((phosphor) => [
                phosphor.id === ctx.phosphor ? `${phosphor.id} *` : phosphor.id,
                phosphor.note,
                phosphor.id === ctx.phosphor ? "ok" : "dim",
              ])
            ),
            blank(),
            line('* in use — run "theme <name>" to switch', "dim"),
          ],
        };
      }

      const next = requested === "next" ? nextPhosphor(ctx.phosphor) : requested;

      if (!isPhosphor(next)) {
        return {
          lines: [
            line(`theme: unknown phosphor "${args[0]}"`, "error"),
            line(`try: ${PHOSPHOR_IDS.join(", ")}`, "dim"),
          ],
        };
      }

      ctx.setPhosphor(next);
      return { lines: [line(`phosphor set to ${next}`, "ok")] };
    },
  },
  {
    name: "history",
    group: "session",
    usage: "history",
    summary: "Show the commands you have run",
    run: (args, ctx) =>
      ctx.history.length === 0
        ? { lines: [line("no history yet", "dim")] }
        : {
            lines: ctx.history.map((entry, index) =>
              line(`${String(index + 1).padStart(4)}  ${entry}`)
            ),
          },
  },
  {
    name: "date",
    group: "session",
    usage: "date",
    summary: "Local time in Vadodara",
    run: () => ({
      lines: [
        line(
          new Intl.DateTimeFormat("en-GB", {
            dateStyle: "full",
            timeStyle: "medium",
            timeZone: "Asia/Kolkata",
          }).format(new Date())
        ),
      ],
    }),
  },
  {
    name: "uptime",
    group: "session",
    usage: "uptime",
    summary: "How long this session has been open",
    run: (args, ctx) => ({ lines: [line(`up ${formatUptime(ctx.startedAt)}`)] }),
  },
  {
    name: "neofetch",
    group: "session",
    usage: "neofetch",
    summary: "System card",
    run: (args, ctx) => {
      const { profile, meta } = ctx.content;
      const facts = [
        ["", "soham@vadodara"],
        ["", "─".repeat(24)],
        ["role", profile.roleTitle],
        ["location", profile.location],
        ["shell", "portfolio-sh 1.0"],
        ["theme", `${ctx.phosphor} phosphor`],
        ["projects", String(meta.counts.projects)],
        ["skills", String(meta.counts.skills)],
        ["uptime", formatUptime(ctx.startedAt)],
      ];

      const rendered = facts.map(([key, value]) =>
        key ? `${key.padEnd(10)}${value}` : value
      );

      const rows = Math.max(NEOFETCH_ART.length, rendered.length);
      const lines = [];

      for (let index = 0; index < rows; index += 1) {
        const art = NEOFETCH_ART[index] || " ".repeat(25);
        const fact = rendered[index] || "";
        lines.push(line(`${art} ${fact}`, index < 2 ? "accent" : "normal"));
      }

      return { lines };
    },
  },
  {
    name: "echo",
    group: "session",
    usage: "echo <text>",
    summary: "Say something back",
    run: (args) => ({ lines: [line(args.join(" "))] }),
  },
  {
    name: "toon",
    group: "session",
    usage: "toon [tour|ask|come|dance|say]",
    summary: `Summon ${TOON_NAME}, the pixel guide`,
    run: (args, ctx) => {
      const toon = ctx.toon;
      if (!toon) return { lines: [line("toon: no display attached", "error")] };

      const action = (args[0] || "").toLowerCase();

      if (action === "hide" || action === "off") {
        toon.hide();
        return { lines: [line(`${TOON_NAME} powers down.`, "dim")] };
      }

      if (action === "come" || action === "here") {
        toon.summon();
        toon.come();
        return { lines: [line(`${TOON_NAME} ambles over.`, "dim")] };
      }

      if (action === "dance") {
        toon.summon();
        toon.dance();
        return { lines: [line("♪ ♫", "accent"), line(`${TOON_NAME} dances. Badly.`, "dim")] };
      }

      if (action === "wave") {
        toon.summon();
        toon.wave();
        return { lines: [line(`${TOON_NAME} waves.`, "dim")] };
      }

      if (action === "tour") {
        toon.summon();
        toon.tour();
        return { lines: [line(`${TOON_NAME} takes the lead. Follow the bubble.`, "dim")] };
      }

      if (action === "ask") {
        const question = args.slice(1).join(" ").trim().slice(0, 300);
        toon.summon();
        toon.ask(question);
        return {
          lines: [
            line(
              question
                ? `${TOON_NAME} is reading. The answer lands in its bubble.`
                : `${TOON_NAME} is listening. Type into its bubble.`,
              "dim"
            ),
          ],
        };
      }

      if (action === "say") {
        const text = args.slice(1).join(" ").trim().slice(0, 140);
        if (!text) return { lines: [line("usage: toon say <text>", "dim")] };
        toon.summon();
        toon.say(text);
        return { lines: [line(`${TOON_NAME}: ${text}`, "dim")] };
      }

      if (action && action !== "on") {
        return {
          lines: [
            line(`toon: unknown action '${action}'`, "error"),
            line("try: toon [tour|ask <q>|come|dance|wave|say <text>|hide]", "dim"),
          ],
        };
      }

      toon.summon();

      return {
        lines: [
          ...asciiFrame("wave").map((row) => line(row, "accent")),
          blank(),
          line(`${TOON_NAME} — 14x13 pixels, knows the whole file tree.`),
          line("Click for directions or a question. Drag to throw. Poke to annoy.", "dim"),
        ],
      };
    },
  },
  {
    name: "clear",
    group: "session",
    usage: "clear",
    summary: "Clear the terminal",
    run: () => ({ lines: [], clear: true }),
  },
  {
    name: "exit",
    group: "session",
    usage: "exit",
    summary: "Close the terminal panel",
    run: () => ({ lines: [line("closing terminal", "dim")], close: true }),
  },
  {
    name: "sudo",
    group: "session",
    hidden: true,
    usage: "sudo <command>",
    summary: "Elevated privileges",
    run: (args, ctx) => {
      if (args.join(" ").toLowerCase() === "hire-me") {
        const { profile } = ctx.content;
        return {
          lines: [
            line("[sudo] password for recruiter: ", "dim"),
            blank(),
            line("Access granted.", "ok"),
            blank(),
            ...wrap(
              `${profile.name} is a ${profile.roleTitle.toLowerCase()} in ${profile.location}.`
            ).map((row) => line(row)),
            blank(),
            ...table([
              ["email", profile.email],
              ["phone", profile.phone],
            ]),
            blank(),
            line("Run 'projects' to see what he has shipped.", "dim"),
          ],
        };
      }

      return {
        lines: [
          line("soham is not in the sudoers file.", "error"),
          line("This incident will be reported.", "dim"),
        ],
      };
    },
  },
  {
    name: "vim",
    group: "session",
    hidden: true,
    usage: "vim",
    summary: "Open vim",
    run: () => ({
      lines: [
        line("You are already inside an editor."),
        line("Press Ctrl+` to escape this one. You are welcome.", "dim"),
      ],
    }),
  },
  {
    name: "rm",
    group: "session",
    hidden: true,
    usage: "rm <path>",
    summary: "Remove files",
    run: (args) => {
      const target = args.join(" ");
      if (target.includes("-rf") && (target.includes("/") || target.includes("*"))) {
        return {
          lines: [
            line("rm: refusing to remove '/' — this portfolio took a while", "error"),
            line("Nice try though.", "dim"),
          ],
        };
      }
      return { lines: [line("rm: read-only file system", "error")] };
    },
  },
  {
    name: "sl",
    group: "session",
    hidden: true,
    usage: "sl",
    summary: "Steam locomotive",
    run: () => ({
      lines: [
        line("      ====        ________                ___________ ", "accent"),
        line("  _D _|  |_______/        \\__I_I_____===__|_________| ", "accent"),
        line("   |(_)---  |   H\\________/ |   |        =|___ ___|   ", "accent"),
        line("   /     |  |   H  |  |     |   |         ||_| |_||   ", "accent"),
        line("  |      |  |   H  |__--------------------| [___] |   ", "accent"),
        line("  | ________|___H__/__|_____/[][]~\\_______|       |   ", "accent"),
        line("  |/ |   |-----------I_____I [][] []  D   |=======|__ ", "accent"),
        blank(),
        line("You typed sl instead of ls. It happens.", "dim"),
      ],
    }),
  },
  {
    name: "matrix",
    group: "session",
    hidden: true,
    usage: "matrix",
    summary: "Wake up",
    run: () => {
      const glyphs = "01ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉ";
      const rows = Array.from({ length: 8 }, () =>
        Array.from({ length: 60 }, () =>
          Math.random() > 0.35 ? glyphs[Math.floor(Math.random() * glyphs.length)] : " "
        ).join("")
      );

      return {
        lines: [...rows.map((row) => line(row, "ok")), blank(), line("Wake up, Soham.", "dim")],
      };
    },
  },
];

export const VISIBLE_COMMANDS = COMMANDS.filter((command) => !command.hidden);

export function findCommand(name) {
  return COMMANDS.find((command) => command.name === name) || null;
}
