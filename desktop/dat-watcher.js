const fs = require('fs');
const log = require('electron-log');
const parseItemOrder = require('./parse-item-order.js');
const { exec } = require('child_process');


let lastContentId = null;
let watcher = null;

function onEvent(event, filename, win, watchDir) {
  if (event === 'change' && filename.indexOf('FFXIV_CHR') > -1) {
    const contentId = /FFXIV_CHR(\w+)/.exec(filename)[1];
    if (contentId !== lastContentId) {
      log.log(`New content ID: ${contentId}`);
      win.webContents.send('dat:content-id', contentId);
      lastContentId = contentId;
    }
  }
}

function start(win) {
  if (watcher) {
    return;
  }
  exec('Get-ItemProperty -Path Registry::HKEY_CURRENT_USER\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\"User Shell Folders" -Name Personal', { 'shell': 'powershell.exe' }, (err, output) => {
    if (output) {
      const documentsDir = /Personal\s+:\s?(.*)/.exec(output.trim())[1];
      const watchDir = `${documentsDir}\\My Games\\FINAL FANTASY XIV - A Realm Reborn`;
      watcher = fs.watch(watchDir, { recursive: true }, (event, filename) => {
        onEvent(event, filename, win, watchDir);
      });
      log.log(`DAT Watcher started on ${watchDir} !`);
    } else {
      log.error('No output from reg read command, DAT Watcher cannot start !');
      log.error(`Error: ${error}`);
    }
  });
}

function stop() {
  if (!watcher) {
    return;
  }
  watcher.close();
  watcher = null;
}

// TODO ODR parsing?
// fs.readFile('D:\\Documents\\My Games\\FINAL FANTASY XIV - A Realm Reborn\\FFXIV_CHR004000174A4A2318\\ITEMODR.DAT', (err, content) => {
//   console.log(JSON.stringify(parseItemOrder(content), null, 2));
// });

module.exports.start = start;
module.exports.stop = stop;
