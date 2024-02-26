import { exec } from "node:child_process";
import { promisify } from "node:util";
import * as vscode from "vscode";
import sharp from "sharp";
import parser from "yargs-parser";

const exec_async = promisify(exec);

type FileEntry = {
  fsPath: string;
  external: string;
  path: string;
  scheme: "file";
};

const videoFormat = ["mov", "mp4", "wav", "mpeg", "mkv", "avi"];
const audioFormat = ["wav", "mp3", "acc", "m4a", "ogg", "flac"];
const ffmpegSupportFormat = audioFormat.concat(videoFormat);

async function getVideoPreset() {
  const configs = vscode.workspace.getConfiguration("vscode-media-converter");
  const presets = configs.get("videoCommandPresets") as string[];

  let command = (
    await vscode.window.showQuickPick(
      [
        ...presets.map((preset) => {
          const presetChunk = preset.split("::");
          return {
            label: presetChunk[0],
            detail: presetChunk.at(-1),
          } as vscode.QuickPickItem;
        }),
        {
          label: "Custom Command...",
          detail: undefined,
        } as vscode.QuickPickItem,
      ],
      { placeHolder: "Choose a preset for video format" }
    )
  )?.detail;

  if (!command) {
    command = await vscode.window.showInputBox({
      placeHolder: "provide custom ffmpeg command...",
      prompt: "available variable: INPUT_FILE OUTPUT_FILE",
    });
  }

  return command;
}

async function getImagePreset() {
  const configs = vscode.workspace.getConfiguration("vscode-media-converter");
  const presets = configs.get("imagePresets") as string[];

  let selected = await vscode.window.showQuickPick(
    [
      ...presets.map((preset) => {
        const presetChunk = preset.split("::");
        const [format, ...optionStr] = presetChunk.at(-1)!.split(" ");

        return {
          label: presetChunk[0],
          description: format,
          detail: optionStr.join(" "),
        } as vscode.QuickPickItem;
      }),
      {
        label: "Custom Command...",
      } as vscode.QuickPickItem,
    ],
    { placeHolder: "Choose a preset for image format" }
  );

  const command = {
    format: selected?.description,
    options: selected?.detail,
  };
  if (!command.format) {
    command.format = await vscode.window.showQuickPick(
      [
        "jpeg",
        "png",
        "webp",
        "gif",
        "jp2",
        "tiff",
        "avif",
        "heif",
        "jxl",
        "raw",
      ],
      {
        placeHolder: "Select output format",
      }
    );
    if (!command.format) {
      throw Error("No format selected");
    }
    command.options = await vscode.window.showInputBox({
      placeHolder: "(optional) provide format options, eg: --quality=75",
    });
  }

  const options = !command.options ? undefined : parser(command.options);

  if (options && "_" in options) {
    // @ts-expect-error remove command
    delete options._;
  }

  return {
    format: command.format,
    options,
  };
}

export function activate(context: vscode.ExtensionContext) {
  let converter = vscode.commands.registerCommand(
    "vscode-media-converter.convertMedia",
    (...args: [FileEntry, FileEntry[]]) => {
      if (!args.length) {
        vscode.window.showErrorMessage(
          "Please Select and execute command through context menu in file explorer."
        );
        return;
      }

      const [, files] = args;
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
          let imageFormat = "";
          let imageOptions = undefined;

          for (const file of files) {
            const chunks = file.fsPath.split(".");
            const originalFormat = chunks.pop();
            const pathWithoutExt = chunks.join(".");
            progress.report({ message: file.path });

            if (ffmpegSupportFormat.includes(originalFormat || "")) {
              if (!videoCommand) {
                videoCommand = (await getVideoPreset()) || "";
              }
              await exec_async(
                videoCommand
                  .replace("INPUT_FILE", file.fsPath)
                  .replace("OUTPUT_FILE", pathWithoutExt)
              );
              result.push(pathWithoutExt);
            } else {
              if (!imageFormat) {
                const { format, options } = await getImagePreset();
                imageFormat = format;
                imageOptions = options;
              }

              const newPath = `${pathWithoutExt}.${imageFormat}`;

              await sharp(file.fsPath)
                .toFormat(imageFormat as any, imageOptions as any)
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
