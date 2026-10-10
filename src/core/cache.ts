/**
 * Vietnamese Traditional Costume Studio - Mini Cache Engine
 * Quản lý lưu trữ ngoại tuyến hỗ trợ IndexedDB (với fallback LocalStorage),
 * namespaces riêng biệt, versioning, hidden cache tương tác và autosave debounce 500-1000ms.
 */

import { AppStateModel } from '../constants/appState';
import { appStore } from './store';

export type CacheNamespace =
  | 'settings'
  | 'avatar'
  | 'garments'
  | 'layers'
  | 'projects'
  | 'timeline'
  | 'backgrounds'
  | 'temp_hidden';

export interface CacheEntry<T = any> {
  namespace: CacheNamespace;
  key: string;
  value: T;
  version: number;
  updatedAt: number;
}

export class MiniCache {
  private dbName: string;
  private version: number;
  private db: IDBDatabase | null = null;
  private isIndexedDBAvailable: boolean = false;
  // Bộ nhớ tạm thời trong RAM cho cache ẩn tương tác cực nhanh
  private tempMemoryCache = new Map<string, any>();

  constructor(dbName = 'vtcs-cache', version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.init();
  }

  /**
   * Khởi tạo kết nối IndexedDB nếu trình duyệt hỗ trợ
   */
  private async init(): Promise<void> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('IndexedDB không hỗ trợ, sử dụng LocalStorage fallback.');
      this.isIndexedDBAvailable = false;
      return;
    }

    try {
      this.db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = window.indexedDB.open(this.dbName, this.version);

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('entries')) {
            const store = db.createObjectStore('entries', { keyPath: ['namespace', 'key'] });
            store.createIndex('namespace', 'namespace', { unique: false });
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      this.isIndexedDBAvailable = true;
    } catch (err) {
      console.warn('Lỗi mở IndexedDB, fallback sang LocalStorage:', err);
      this.isIndexedDBAvailable = false;
    }
  }

  private getFallbackKey(namespace: string, key: string): string {
    return `${this.dbName}:${namespace}:${key}`;
  }

  /**
   * Lưu dữ liệu vào cache theo namespace và key
   */
  public async set<T = any>(namespace: CacheNamespace, key: string, value: T): Promise<void> {
    const entry: CacheEntry<T> = {
      namespace,
      key,
      value,
      version: this.version,
      updatedAt: Date.now(),
    };

    if (this.isIndexedDBAvailable && this.db) {
      try {
        await new Promise<void>((resolve, reject) => {
          const tx = this.db!.transaction('entries', 'readwrite');
          const store = tx.objectStore('entries');
          const req = store.put(entry);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
        return;
      } catch (err) {
        console.warn('Lỗi ghi IndexedDB, chuyển fallback LocalStorage:', err);
      }
    }

    // LocalStorage fallback
    try {
      const serialized = JSON.stringify(entry);
      localStorage.setItem(this.getFallbackKey(namespace, key), serialized);
    } catch (err) {
      console.error('Lỗi lưu LocalStorage:', err);
    }
  }

  /**
   * Đọc dữ liệu từ cache theo namespace và key
   */
  public async get<T = any>(namespace: CacheNamespace, key: string): Promise<T | null> {
    if (this.isIndexedDBAvailable && this.db) {
      try {
        const entry = await new Promise<CacheEntry<T> | undefined>((resolve, reject) => {
          const tx = this.db!.transaction('entries', 'readonly');
          const store = tx.objectStore('entries');
          const req = store.get([namespace, key]);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
        if (entry) return entry.value;
      } catch (err) {
        console.warn('Lỗi đọc IndexedDB, kiểm tra LocalStorage fallback:', err);
      }
    }

    // LocalStorage fallback
    try {
      const raw = localStorage.getItem(this.getFallbackKey(namespace, key));
      if (!raw) return null;
      const parsed: CacheEntry<T> = JSON.parse(raw);
      return parsed.value;
    } catch {
      return null;
    }
  }

  /**
   * Xóa một key trong namespace
   */
  public async delete(namespace: CacheNamespace, key: string): Promise<void> {
    if (this.isIndexedDBAvailable && this.db) {
      try {
        await new Promise<void>((resolve, reject) => {
          const tx = this.db!.transaction('entries', 'readwrite');
          const store = tx.objectStore('entries');
          const req = store.delete([namespace, key]);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      } catch (err) {
        console.warn('Lỗi xóa IndexedDB:', err);
      }
    }

    try {
      localStorage.removeItem(this.getFallbackKey(namespace, key));
    } catch {}
  }

  /**
   * Lấy danh sách toàn bộ các giá trị trong namespace
   */
  public async list<T = any>(namespace: CacheNamespace): Promise<CacheEntry<T>[]> {
    if (this.isIndexedDBAvailable && this.db) {
      try {
        return await new Promise<CacheEntry<T>[]>((resolve, reject) => {
          const tx = this.db!.transaction('entries', 'readonly');
          const store = tx.objectStore('entries');
          const index = store.index('namespace');
          const req = index.getAll(namespace);
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => reject(req.error);
        });
      } catch (err) {
        console.warn('Lỗi lấy danh sách IndexedDB:', err);
      }
    }

    // LocalStorage fallback
    const results: CacheEntry<T>[] = [];
    const prefix = `${this.dbName}:${namespace}:`;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) {
        try {
          const item = JSON.parse(localStorage.getItem(k) || '');
          results.push(item);
        } catch {}
      }
    }
    return results;
  }

  /**
   * Xóa toàn bộ dữ liệu trong một namespace
   */
  public async clear(namespace: CacheNamespace): Promise<void> {
    const items = await this.list(namespace);
    for (const item of items) {
      await this.delete(namespace, item.key);
    }
  }

  // --- HỆ THỐNG CACHE ẨN TƯƠNG TÁC (Hidden / In-memory & scratchpad cache) ---

  /**
   * Lưu dữ liệu tạm trong phiên tương tác (ví dụ texture đang vẽ dở, nét vẽ nháp, ảnh preview)
   */
  public setTemp(key: string, value: any): void {
    this.tempMemoryCache.set(key, value);
    // Đồng thời đồng bộ xuống namespace temp_hidden bất đồng bộ
    this.set('temp_hidden', key, value).catch(() => {});
  }

  /**
   * Lấy dữ liệu tạm từ cache ẩn
   */
  public getTemp(key: string): any {
    if (this.tempMemoryCache.has(key)) {
      return this.tempMemoryCache.get(key);
    }
    return null;
  }

  /**
   * Xóa cache ẩn
   */
  public clearTemp(): void {
    this.tempMemoryCache.clear();
    this.clear('temp_hidden').catch(() => {});
  }
}

// Khởi tạo instance MiniCache
export const miniCache = new MiniCache('vtcs-heritage-cache', 1);

/**
 * Trình quản lý Autosave tự động (Debounced Autosave Engine: 800ms)
 */
class AutoSaveEngine {
  private timer: any = null;
  private debounceMs = 800;

  constructor() {
    this.bindStore();
  }

  private bindStore(): void {
    appStore.subscribe((state) => {
      this.triggerSave(state);
    });
  }

  public triggerSave(state: AppStateModel): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(async () => {
      try {
        const payloadToSave = {
          app: state.app,
          avatar: state.avatar,
          wardrobe: state.wardrobe,
          timeline: state.timeline,
          background: state.background,
          savedAt: Date.now(),
        };

        await miniCache.set('projects', 'autosave_latest', payloadToSave);

        // Cập nhật metadata hiển thị không kích hoạt vòng lặp save
        const currentMeta = appStore.getState().cache.metadata;
        const newCount = (currentMeta.autoSaveCount || 0) + 1;

        // Lưu thông tin phiên
        await miniCache.set('settings', 'last_session_meta', {
          lastSaved: Date.now(),
          autoSaveCount: newCount,
        });
      } catch (err) {
        console.error('Autosave thất bại:', err);
      }
    }, this.debounceMs);
  }

  /**
   * Khôi phục trạng thái gần nhất khi ứng dụng khởi chạy
   */
  public async restoreLastSession(): Promise<boolean> {
    try {
      const savedProject = await miniCache.get<any>('projects', 'autosave_latest');
      if (savedProject) {
        console.info('Đã tìm thấy bản autosave, khôi phục trạng thái phiên trước...');
        appStore.setState((prev) => ({
          ...prev,
          avatar: savedProject.avatar || prev.avatar,
          wardrobe: savedProject.wardrobe || prev.wardrobe,
          timeline: savedProject.timeline || prev.timeline,
          background: savedProject.background || prev.background,
          cache: {
            metadata: {
              lastSaved: savedProject.savedAt || Date.now(),
              autoSaveCount: 1,
            },
          },
        }));
        return true;
      }
    } catch (err) {
      console.warn('Không thể khôi phục autosave:', err);
    }
    return false;
  }
}

export const autoSaveEngine = new AutoSaveEngine();
