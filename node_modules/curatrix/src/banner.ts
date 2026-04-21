import chalk from "chalk";

export const banner = `
██████╗██╗   ██╗██████╗  █████╗ ████████╗██████╗ ██╗██╗  ██╗
██╔════╝██║   ██║██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗██║╚██╗██╔╝
██║     ██║   ██║██████╔╝███████║   ██║   ██████╔╝██║ ╚███╔╝
██║     ██║   ██║██╔══██╗██╔══██║   ██║   ██╔══██╗██║ ██╔██╗
╚██████╗╚██████╔╝██║  ██║██║  ██║   ██║   ██║  ██║██║██╔╝ ██╗
 ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝
`;

const softGold = chalk.hex("#D8B56A");
const softGoldDim = chalk.hex("#B89A57");

export function showBanner(version: string): void {
  console.log(
    softGold.bold(banner) +
      softGoldDim.bold(` v${version}`) +
      "\n" +
      chalk.gray("  Local-first project auditing with AI-powered insights") +
      "\n",
  );
}
