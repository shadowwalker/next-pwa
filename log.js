// https://github.com/vercel/next.js/blob/canary/packages/next/build/output/log.ts
const chalk = require("chalk");

const prefixes = {
  wait: chalk.cyan("wait") + "  -",
  error: chalk.red("error") + " -",
  warn: chalk.yellow("warn") + "  -",
  ready: chalk.green("ready") + " -",
  info: chalk.cyan("info") + "  -",
  event: chalk.magenta("event") + " -",
};

export function wait(...message) {
  console.log(prefixes.wait, ...message);
}

export function error(...message) {
  console.log(prefixes.error, ...message);
}

export function warn(...message) {
  console.log(prefixes.warn, ...message);
}

export function ready(...message) {
  console.log(prefixes.ready, ...message);
}

export function info(...message) {
  console.log(prefixes.info, ...message);
}

export function event(...message) {
  console.log(prefixes.event, ...message);
}
