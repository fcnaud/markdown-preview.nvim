"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/*
 * fork from https://github.com/domenic/opener
 */
const child_process_1 = tslib_1.__importDefault(require("child_process"));
const os_1 = tslib_1.__importDefault(require("os"));
module.exports = function opener(args, tool) {
    let platform = process.platform;
    args = [].concat(args);
    // Attempt to detect Windows Subystem for Linux (WSL).
    // WSL  itself as Linux (which works in most cases), but in
    // this specific case we need to treat it as actually being Windows.
    // The "Windows-way" of opening things through cmd.exe works just fine here,
    // whereas using xdg-open does not, since there is no X Windows in WSL.
    if (platform === 'linux' && os_1.default.release().toLowerCase().indexOf('microsoft') !== -1) {
        // 在 wsl 下用 cmd.exe 命令打开浏览器会同时打开一个 cmd 窗口，不清楚怎么关
        // 所以这里不用 cmd.exe，使用在 wsl 中创建一个浏览器链接的方式
        // platform = 'win32';
    }
    // http://stackoverflow.com/q/1480971/3191, but see below for Windows.
    let command;
    switch (platform) {
        case 'win32': {
            command = 'cmd.exe';
            if (tool) {
                args.unshift(tool);
            }
            break;
        }
        case 'darwin': {
            command = 'open';
            if (tool) {
                args.unshift(tool);
                args.unshift('-a');
            }
            break;
        }
        default: {
            command = tool || 'xdg-open';
            break;
        }
    }
    if (platform === 'win32') {
        // On Windows, we really want to use the "start" command.
        // But, the rules regarding arguments with spaces, and escaping them with quotes,
        // can get really arcane. So the easiest way to deal with this is to pass off the
        // responsibility to "cmd /c", which has that logic built in.
        //
        // Furthermore, if "cmd /c" double-quoted the first parameter,
        // then "start" will interpret it as a window title,
        // so we need to add a dummy empty-string window title: http://stackoverflow.com/a/154090/3191
        //
        // Additionally, on Windows ampersand needs to be escaped when passed to "start"
        args = args.map(value => {
            return value.replace(/&/g, '^&');
        });
        args = ['/c', 'start', '""'].concat(args);
    }
    return child_process_1.default.spawn(command, args, {
        shell: false,
        detached: true
    });
};
