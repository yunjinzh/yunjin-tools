const DB_NAME = 'yunjin-reader';
const DB_VERSION = 2;
const BOOKS_STORE = 'books';
const FILES_STORE = 'files';
const SETTINGS_KEY = 'yunjin-reader-settings';
const DEFAULT_SETTINGS = Object.freeze({ theme: 'light', zoom: 1, fit: 'width' });

let databasePromise;

function openDatabase() {
  if (databasePromise) return databasePromise;
  databasePromise = new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) {
      reject(new Error('当前浏览器不支持本地书架，请使用较新版本的浏览器。'));
      return;
    }
    const request = globalThis.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(BOOKS_STORE)) {
        request.result.createObjectStore(BOOKS_STORE, { keyPath: 'id' });
      }
      if (!request.result.objectStoreNames.contains(FILES_STORE)) {
        const files = request.result.createObjectStore(FILES_STORE, { keyPath: 'id' });
        const books = request.transaction.objectStore(BOOKS_STORE);
        const cursorRequest = books.openCursor();
        cursorRequest.onsuccess = () => {
          const cursor = cursorRequest.result;
          if (!cursor) return;
          const { blob, ...metadata } = cursor.value;
          if (blob !== undefined) files.put({ id: metadata.id, blob });
          cursor.update(metadata);
          cursor.continue();
        };
      }
    };
    request.onerror = () => reject(request.error || new Error('本地书架打开失败，请重试。'));
    request.onblocked = () => reject(new Error('请关闭其他阅读器页面后重试。'));
    request.onsuccess = () => {
      const database = request.result;
      database.onversionchange = () => {
        database.close();
        databasePromise = undefined;
      };
      resolve(database);
    };
  }).catch((error) => {
    databasePromise = undefined;
    throw error;
  });
  return databasePromise;
}

async function transaction(mode, operation, stores = [BOOKS_STORE]) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(stores, mode);
    let result;
    let operationError;
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(operationError || tx.error || new Error('本地书架操作失败。'));
    tx.onabort = () => reject(operationError || tx.error || new Error('本地书架操作已中止。'));
    const setResult = (value) => { result = value; };
    const fail = (error) => {
      operationError = error;
      tx.abort();
    };
    try {
      operation(tx.objectStore(BOOKS_STORE), setResult, fail, tx);
    } catch (error) {
      fail(error);
    }
  });
}

export function listBooks() {
  return transaction('readonly', (store, done) => {
    const request = store.getAll();
    request.onsuccess = () => {
      done(request.result.sort((a, b) => (Number(b.lastOpenedAt) || 0) - (Number(a.lastOpenedAt) || 0)));
    };
  });
}

export function getBook(id) {
  return transaction('readonly', (store, done, _fail, tx) => {
    const request = store.get(id);
    request.onsuccess = () => {
      if (!request.result) {
        done(undefined);
        return;
      }
      const metadata = request.result;
      const fileRequest = tx.objectStore(FILES_STORE).get(id);
      fileRequest.onsuccess = () => done({ ...metadata, blob: fileRequest.result?.blob });
    };
  }, [BOOKS_STORE, FILES_STORE]);
}

export function saveBook(book) {
  if (!book || typeof book.id !== 'string' || !book.id) {
    return Promise.reject(new Error('书籍缺少有效标识，无法保存。'));
  }
  return transaction('readwrite', (store, done, _fail, tx) => {
    const { blob, ...metadata } = book;
    store.put(metadata);
    if (blob !== undefined) tx.objectStore(FILES_STORE).put({ id: book.id, blob });
    done(book);
  }, [BOOKS_STORE, FILES_STORE]);
}

export function updateBook(id, patch) {
  if (patch && Object.prototype.hasOwnProperty.call(patch, 'blob')) {
    return Promise.reject(new Error('阅读进度更新不能替换 PDF 文件，请重新导入。'));
  }
  return transaction('readwrite', (store, done, fail) => {
    const request = store.get(id);
    request.onsuccess = () => {
      if (!request.result) {
        fail(new Error('这本书已不在书架中，请重新导入。'));
        return;
      }
      const updatedBook = { ...request.result, ...patch, id };
      store.put(updatedBook);
      done(updatedBook);
    };
  });
}

export function deleteBook(id) {
  return transaction('readwrite', (store, _done, _fail, tx) => {
    store.delete(id);
    tx.objectStore(FILES_STORE).delete(id);
  }, [BOOKS_STORE, FILES_STORE]);
}

function cleanSettings(input) {
  const output = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) return output;
  if (['light', 'sepia', 'dark'].includes(input.theme)) output.theme = input.theme;
  if (Number.isFinite(input.zoom) && input.zoom >= 0.5 && input.zoom <= 3) output.zoom = input.zoom;
  if (['width', 'page', 'custom'].includes(input.fit)) output.fit = input.fit;
  return output;
}

export function loadSettings() {
  try {
    const parsed = JSON.parse(globalThis.localStorage?.getItem(SETTINGS_KEY) || '{}');
    return { ...DEFAULT_SETTINGS, ...cleanSettings(parsed) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  const merged = { ...loadSettings(), ...cleanSettings(settings) };
  try {
    globalThis.localStorage?.setItem(SETTINGS_KEY, JSON.stringify(merged));
  } catch {
    // Reading remains available when browser storage is blocked or full.
  }
  return merged;
}
