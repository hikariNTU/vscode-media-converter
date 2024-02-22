import * as vscode from "vscode";
import sharp from "sharp";

type FileEntry = {
  fsPath: string;
  external: string;
  path: string;
  scheme: "file";
};

export function activate(context: vscode.ExtensionContext) {
  let converter = vscode.commands.registerCommand(
    "vscode-media-converter.convertMedia",
    (...args: [FileEntry, FileEntry[]]) => {
      const configs = vscode.workspace.getConfiguration(
        "vscode-media-converter"
      );
      const format = configs.get("imageTargetFormat") as string;
      const quality = configs.get("imageQuality");

      const [selectedFile, files] = args;
      const result: string[] = [];

      for (const file of files) {
        const chunks = file.fsPath.split(".");
        chunks.pop();
        chunks.push(format);
        const newPath = chunks.join(".");

        sharp(file.fsPath)
          .toFormat(format as any, {
            quality: typeof quality === "number" ? quality : 80,
          })
          .toFile(newPath);

        result.push(newPath);
      }

      vscode.window.showInformationMessage(
        `Selected ${result.length} file(s) has been converted to "${format}" format with quality-${quality}.`
      );
    }
  );

  context.subscriptions.push(converter);
}
