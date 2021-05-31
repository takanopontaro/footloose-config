import {
  IBootstrap,
  IDirectorySettings,
  IEntry,
  IGetKeyMaps,
  IGetSettings,
  IKeyBindings,
} from 'footloose-client';

function previewImage(entry: IEntry) {
  const isImg = /\.(png|jpe?g|gif|svg)/i.test(entry.ext);
  if (!isImg) {
    return '';
  }
  const imgHtml = `<img src="/@${entry.path}" alt="">`;
  return `<div class="table_thumbnail">${imgHtml}</div><div class="table_preview">${imgHtml}</div>`;
}

const getKeyMaps: IGetKeyMaps = async function getKeyMaps(allExports) {
  const { app, dialog, directory, itemSelector, log, taskManager } = allExports;
  const dialogType = await app.getCurrentDialogType();
  const directoryFilterInput: IKeyBindings = {
    'tab,shift+tab': () => {
      directory.focusFrame();
    },
    'escape,enter': () => {
      directory.setEntryFilter('');
      directory.focusFrame();
    },
    'up,down': (combo) => {
      const step = combo === 'up' ? -1 : 1;
      directory.focusFrame();
      directory.cursorMove(step);
    },
  };
  const itemSelectorFilterInput: IKeyBindings = {
    'tab,shift+tab': (combo) => {
      const step = combo === 'tab' ? 1 : -1;
      itemSelector.switchFocusContext(step);
    },
    'escape,enter': () => {
      itemSelector.process();
    },
    'up,down': (combo) => {
      const step = combo === 'up' ? -1 : 1;
      itemSelector.cursorMove(step);
    },
  };
  return {
    app: {
      '~': () => {
        app.cycleFrameFocus(1);
      },
    },
    dialog: {
      'tab,shift+tab': (combo) => {
        const step = combo === 'tab' ? 1 : -1;
        dialog.moveElementFocus(step, true);
      },
      'enter': () => {
        return dialog.process();
      },
      'escape': () => {
        dialog.reject(null);
      },
    },
    itemSelector: {
      'tab,shift+tab': (combo) => {
        const step = combo === 'tab' ? 1 : -1;
        itemSelector.switchFocusContext(step);
      },
      'enter': () => {
        itemSelector.process();
      },
      'up,down': (combo) => {
        const step = combo === 'up' ? -1 : 1;
        itemSelector.cursorMove(step);
      },
      'escape': () => {
        itemSelector.reject(null);
      },
      'backspace, del': async () => {
        if (await app.confirm({ className: 'itemSelectorDelete' })) {
          itemSelector.deleteItem();
        }
      },
    },
    directory: {
      '0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,_,-,.':
        (combo) => {
          directory.selectEntryByFirstLetter(combo);
        },
      'tab,shift+tab': () => {
        directory.focusFilterInput();
      },
      'enter': () => {
        directory.processActiveRow();
      },
      'backspace, del': () => {
        directory.changeToParentDirectory();
      },
      'home,end': async (combo) => {
        const activeRow = await directory.getActiveRow();
        activeRow.activate(0);
        if (combo === 'end') {
          directory.cursorMove(-1, true);
        }
      },
      'pageup': () => {
        directory.scrollPage('up');
      },
      'pagedown': () => {
        directory.scrollPage('down');
      },
      'up,down': async (combo) => {
        if (await directory.hasFrameTypeOf('gallery')) {
          const step = combo === 'up' ? -5 : 5;
          directory.cursorMove(step, false, combo === 'down');
          return;
        }
        const step = combo === 'up' ? -1 : 1;
        directory.cursorMove(step);
      },
      'left,right': async (combo) => {
        if (await directory.hasFrameTypeOf('gallery')) {
          const step = combo === 'left' ? -1 : 1;
          directory.cursorMove(step, false);
          return;
        }
        const index = combo === 'left' ? 0 : 1;
        directory.focusFrame(index);
      },
      'shift+left,shift+right': (combo) => {
        const index = combo === 'shift+left' ? 0 : 1;
        directory.focusFrame(index);
      },
      'meta+left,meta+right': (combo) => {
        const step = combo === 'meta+left' ? -1 : 1;
        directory.historyGoBy(step);
      },
      'space': () => {
        directory.toggleActiveRowSelection();
      },
      'shift+a': () => {
        directory.setAllRowSelections(true);
      },
      'shift+ctrl+a': () => {
        directory.setAllRowSelections(false);
      },
      'shift+ctrl+meta+a': () => {
        directory.invertAllRowSelections();
      },
      'shift+c': () => {
        directory.copy(true);
      },
      'shift+m': () => {
        directory.move(false);
      },
      'shift+z': () => {
        directory.zip();
      },
      'shift+ctrl+z': () => {
        directory.unzip();
      },
      'shift+d': async () => {
        if (await app.confirm({ className: 'removeConfirm' })) {
          directory.remove();
        }
      },
      'shift+k': () => {
        directory.makeDirectory();
      },
      'shift+t': () => {
        directory.touch();
      },
      'shift+r': () => {
        directory.rename();
      },
      'f5': () => {
        directory.refresh();
      },
      'plus': () => {
        directory.copyItemPaths();
      },
      '_': () => {
        directory.copyCurrentDirectoryPath();
      },
      'shift+i': async () => {
        const { cwd, sourcePaths } = await directory.getDirectoryInfo();
        log.write({ data: cwd, level: 'info' });
        log.write({ data: sourcePaths.join(', '), level: 'info' });
      },
      'escape': async () => {
        if (await directory.hasDirectoryError()) {
          directory.clearDirectoryError();
        } else {
          directory.setEntryFilter('');
        }
      },
      'shift+h': () => {
        directory.showHistoryDialog();
      },
      'shift+b': () => {
        directory.showBookmarkDialog();
      },
      'shift+ctrl+b': () => {
        directory.bookmarkCurrentDirectory();
      },
      'shift+j': () => {
        directory.changeDirectoryWithPrompt();
      },
      'shift+p': () => {
        directory.matchDirectoryPaths(true);
      },
      'shift+ctrl+p': () => {
        directory.matchDirectoryPaths(false);
      },
      'shift+ctrl+meta+p': () => {
        directory.exchangeDirectoryPaths();
      },
      'shift+o': () => {
        directory.openPath();
      },
      'shift+ctrl+o': async () => {
        const entry = await directory.getActiveEntry();
        if (entry) {
          const option = entry.type === 'directory' ? '' : '-R';
          directory.rawApi.exec({ command: `open ${option} "${entry.path}"` });
        }
      },
      '!': () => {
        app.toggleClassName('ellipsis-left');
      },
      'shift+g': async () => {
        const isGallery = await directory.hasFrameTypeOf('gallery');
        directory.setFrameType('gallery', !isGallery);
        directory.setPreviewMaker(isGallery ? () => '' : previewImage);
      },
    },
    filterInput:
      dialogType === 'itemSelector'
        ? itemSelectorFilterInput
        : directoryFilterInput,
    log: {
      // nothing
    },
    taskManager: {
      'tab,shift+tab': (combo) => {
        const step = combo === 'tab' ? 1 : -1;
        taskManager.moveElementFocus(step, false);
      },
    },
  };
};

const directorySettingsBase: IDirectorySettings = {
  sorts: [{ key: 'type', order: 'ascending' }],
  filter: '',
  path: '/',
  previewMaker: () => '',
};

const getSettings: IGetSettings = async function getSettings() {
  return {
    app: {
      persistentSettings: true,
    },
    directory: {
      selectedRowsOnly: false,
      openPathApps: {
        '\\.(tsx?|js|json|s?css|html?|md|txt)$': { name: 'visual studio code' },
      },
      frames: [{ ...directorySettingsBase }, { ...directorySettingsBase }],
    },
    log: {
      filter: () => true,
    },
    taskManager: {
      filter: () => true,
    },
  };
};

const bootstrap: IBootstrap = {
  getSettings,
  getKeyMaps,
};

// eslint-disable-next-line import/no-default-export
export default bootstrap;
