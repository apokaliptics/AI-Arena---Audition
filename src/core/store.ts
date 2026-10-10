/**
 * Vietnamese Traditional Costume Studio - Observable Store
 * Quản lý trạng thái trung tâm với pattern Observable, hỗ trợ cập nhật theo path hoặc function updater.
 */

import { useState, useEffect } from 'react';
import { AppStateModel, INITIAL_APP_STATE } from '../constants/appState';

export type StateListener<T = AppStateModel> = (state: T, prevState: T) => void;
export type StateUpdater<T = any> = T | ((prev: T) => T);

/**
 * Hàm hỗ trợ set giá trị theo nested path (ví dụ: "ui.activeRightMode") một cách immutable
 */
function setByPath(obj: any, path: string, valueOrUpdater: any): any {
  const parts = path.split('.');
  const clone = Array.isArray(obj) ? [...obj] : { ...obj };

  let current = clone;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    const nextVal = current[key];
    current[key] = Array.isArray(nextVal)
      ? [...nextVal]
      : typeof nextVal === 'object' && nextVal !== null
      ? { ...nextVal }
      : {};
    current = current[key];
  }

  const lastKey = parts[parts.length - 1];
  if (typeof valueOrUpdater === 'function') {
    current[lastKey] = valueOrUpdater(current[lastKey]);
  } else {
    current[lastKey] = valueOrUpdater;
  }

  return clone;
}

/**
 * Hàm lấy giá trị theo nested path (ví dụ: "avatar.params.skin.color")
 */
export function getByPath(obj: any, path: string, defaultValue: any = undefined): any {
  if (!obj || !path) return defaultValue;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return defaultValue;
    current = current[part];
  }
  return current !== undefined ? current : defaultValue;
}

/**
 * Observable Store Factory
 */
export function createStore<T extends object = AppStateModel>(initialState: T) {
  let state = structuredClone(initialState);
  const listeners = new Set<StateListener<T>>();

  function getState(): T {
    return state;
  }

  /**
   * setState hỗ trợ 2 dạng:
   * 1. setState("ui.activeRightMode", "draw")
   * 2. setState((prevState) => ({ ...prevState, ... }))
   */
  function setState(pathOrUpdater: string | ((prev: T) => T), value?: any): void {
    const prevState = state;

    if (typeof pathOrUpdater === 'function') {
      state = pathOrUpdater(prevState);
    } else if (typeof pathOrUpdater === 'string') {
      state = setByPath(prevState, pathOrUpdater, value);
    } else {
      console.warn('Invalid setState argument', pathOrUpdater);
      return;
    }

    // Thông báo toàn bộ listeners
    listeners.forEach((listener) => {
      try {
        listener(state, prevState);
      } catch (err) {
        console.error('Error in store listener:', err);
      }
    });
  }

  function subscribe(listener: StateListener<T>): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  return {
    getState,
    setState,
    subscribe,
  };
}

// Khởi tạo Singleton Store của toàn bộ ứng dụng
export const appStore = createStore<AppStateModel>(INITIAL_APP_STATE);

/**
 * React Hook: Lắng nghe toàn bộ store
 */
export function useStore(): [AppStateModel, typeof appStore.setState] {
  const [state, setLocalState] = useState<AppStateModel>(() => appStore.getState());

  useEffect(() => {
    return appStore.subscribe((nextState) => {
      setLocalState(nextState);
    });
  }, []);

  return [state, appStore.setState];
}

/**
 * React Hook: Lắng nghe có chọn lọc (Selector) để tránh render thừa
 */
export function useStoreSelector<R>(selector: (state: AppStateModel) => R): R {
  const [slice, setSlice] = useState<R>(() => selector(appStore.getState()));

  useEffect(() => {
    return appStore.subscribe((nextState) => {
      const nextSlice = selector(nextState);
      setSlice((prev) => {
        // So sánh nông (shallow comparison)
        if (Object.is(prev, nextSlice)) return prev;
        return nextSlice;
      });
    });
  }, [selector]);

  return slice;
}
