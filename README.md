# Media Converter

![Media Converter Icon](icon.png)

## Features

Convert image/video files into desired format for later usage.

## Requirements

If video conversions are needed, the system must install `ffmpeg` in terminal through node exec command.

https://www.ffmpeg.org/download.html

## Extension Settings

This extension contributes the following settings:

- `vscode-media-converter.imageTargetFormat`: Target format for image files, if sharp support it.
- `myExtension.imageQuality`: Image Sharp quality setting. A number between 0 to 100.
- `vscode-media-converter.videoCommandDefault`: The command used for video conversion. INPUT_FILE will be replace by the file path, and OUTPUT_FILE will be replace by the file path WITHOUT extension

## Known Issues

File types are not checked before processing.

## Release Notes

### 0.0.1

basic implementation
