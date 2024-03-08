# Media Converter

![Media Converter Icon](icon.png)

## Features

- Convert image/video files into desired formats within File Explorer.
- Convert svg text or url from clipboard to React Component

## Requirements

`ffmpeg` is required for video processing.

https://www.ffmpeg.org/download.html

## Known Issues

- Releases only contain pre-build with Mac x64, Mac ARM, Windows x64, linux x64 builds.
- File types are not checked before processing.
- ffmpeg are directly execute command on the system with node's `exec`.

## Build by your self

The extension can be build directly with Node.js by following commands.

> `npm` version 10+  
> `node` version 20+

```sh
npm install
npm run build-release
npm run package-vsix
```

It should generate and bundle a file called `vscode-media-converter-x.x.x.vsix` at root which can be directly installed by VS code.

The generated extension will match the current system's cpu(x64 or arm), and os automatically at the `npm install` step.

For supported platforms and architectures, see [sharp installation#prebuilt-binary](https://sharp.pixelplumbing.com/install#prebuilt-binaries).

## Release Notes

### 0.0.6

Add cross-platform support by providing separated package.

### 0.0.5

Add **Paste as SVG Component** command

### 0.0.3

Using presets configs for processing.

### 0.0.1

basic implementation
