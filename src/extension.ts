import { exec } from "node:child_process";
import { promisify } from "node:util";
import * as vscode from "vscode";
import sharp from "sharp";

const exec_async = promisify(exec);

type FileEntry = {
  fsPath: string;
  external: string;
  path: string;
  scheme: "file";
};

const videoFormat = ["mov", "mp4", "wav", "mpeg", "mkv", "avi"];

export function activate(context: vscode.ExtensionContext) {
  let converter = vscode.commands.registerCommand(
    "vscode-media-converter.convertMedia",
    (...args: [FileEntry, FileEntry[]]) => {
      const configs = vscode.workspace.getConfiguration(
        "vscode-media-converter"
      );
      const imageFormat = configs.get("imageTargetFormat") as string;
      const videoCommandDefault = configs.get("videoCommandDefault") as string;
      const quality = configs.get("imageQuality");

      const [selectedFile, files] = args;
      const result: string[] = [];

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Window,
          cancellable: false,
          title: `Converting ${files.length} Files`,
        },
        async (progress) => {
          progress.report({ increment: 0 });

          let videoCommand = "";

          for (const file of files) {
            const chunks = file.fsPath.split(".");
            const originalFormat = chunks.pop();

            progress.report({ message: file.path });

            if (videoFormat.includes(originalFormat || "")) {
              const pathWithoutExt = chunks.join(".");
              if (!videoCommand) {
                videoCommand =
                  (await vscode.window.showInputBox({
                    title: "Provide ffmpeg convert command:",
                    value: videoCommandDefault,
                    prompt: "available variable: INPUT_FILE OUTPUT_FILE",
                  })) || videoCommandDefault;
              }
              await exec_async(
                videoCommand
                  .replace("INPUT_FILE", file.fsPath)
                  .replace("OUTPUT_FILE", pathWithoutExt)
              );
              result.push(pathWithoutExt);
            } else {
              chunks.push(imageFormat);
              const newPath = chunks.join(".");
              await sharp(file.fsPath)
                .toFormat(imageFormat as any, {
                  quality: typeof quality === "number" ? quality : 80,
                })
                .toFile(newPath);
              result.push(newPath);
            }
            progress.report({ increment: (1 / files.length) * 100 });
          }
          vscode.window.showInformationMessage(
            `Selected ${result.length} file(s) has been converted.`
          );
        }
      );
    }
  );

  context.subscriptions.push(converter);
}
