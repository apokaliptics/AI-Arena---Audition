/**
 * Vietnamese Traditional Costume Studio - Command & Undo/Redo Engine
 * Triển khai Command Pattern với giới hạn lịch sử 80 bước (50-100 bước),
 * hỗ trợ các thao tác Layer, Draw, Garment Param, Background,...
 */

import { eventBus, APP_EVENTS } from './events';
import { appStore } from './store';
import { LayerItem } from '../constants/appState';

export interface Command {
  id: string;
  name: string;
  description?: string;
  timestamp: number;
  execute: () => void | Promise<void>;
  undo: () => void | Promise<void>;
}

export class UndoManager {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private limit: number;

  constructor({ limit = 80 }: { limit?: number } = {}) {
    this.limit = limit;
  }

  /**
   * Thực thi một lệnh mới và đưa vào ngăn xếp undo
   */
  public async execute(command: Command): Promise<void> {
    try {
      await command.execute();
      this.undoStack.push(command);

      // Giới hạn số lượng bước trong lịch sử
      if (this.undoStack.length > this.limit) {
        this.undoStack.shift();
      }

      // Xóa redo stack khi có thao tác mới
      this.redoStack = [];

      eventBus.emit(APP_EVENTS.COMMAND_EXECUTED, {
        command,
        undoCount: this.undoStack.length,
        redoCount: this.redoStack.length,
      });
    } catch (err) {
      console.error(`Lỗi thực thi lệnh [${command.name}]:`, err);
    }
  }

  /**
   * Hoàn tác thao tác gần nhất
   */
  public async undo(): Promise<Command | null> {
    if (this.undoStack.length === 0) return null;

    const command = this.undoStack.pop()!;
    try {
      await command.undo();
      this.redoStack.push(command);

      eventBus.emit(APP_EVENTS.COMMAND_UNDONE, {
        command,
        undoCount: this.undoStack.length,
        redoCount: this.redoStack.length,
      });

      return command;
    } catch (err) {
      console.error(`Lỗi hoàn tác lệnh [${command.name}]:`, err);
      // Đưa lại vào undo nếu rollback hỏng
      this.undoStack.push(command);
      return null;
    }
  }

  /**
   * Làm lại thao tác vừa hoàn tác
   */
  public async redo(): Promise<Command | null> {
    if (this.redoStack.length === 0) return null;

    const command = this.redoStack.pop()!;
    try {
      await command.execute();
      this.undoStack.push(command);

      eventBus.emit(APP_EVENTS.COMMAND_REDONE, {
        command,
        undoCount: this.undoStack.length,
        redoCount: this.redoStack.length,
      });

      return command;
    } catch (err) {
      console.error(`Lỗi làm lại lệnh [${command.name}]:`, err);
      this.redoStack.push(command);
      return null;
    }
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public getHistory(): { undo: Command[]; redo: Command[] } {
    return {
      undo: [...this.undoStack],
      redo: [...this.redoStack],
    };
  }

  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}

// Khởi tạo Singleton UndoManager
export const undoManager = new UndoManager({ limit: 80 });

// --- CÁC HÀM TẠO LỆNH (COMMAND FACTORIES) ---

/**
 * Lệnh 1: Thêm lớp vẽ (Add Layer)
 */
export function createAddLayerCommand(newLayer: LayerItem): Command {
  return {
    id: `cmd_add_layer_${Date.now()}`,
    name: `Thêm lớp: ${newLayer.name}`,
    timestamp: Date.now(),
    execute: () => {
      appStore.setState('editor.layers', (layers: LayerItem[]) => [...layers, newLayer]);
      appStore.setState('editor.activeLayerId', newLayer.id);
    },
    undo: () => {
      appStore.setState('editor.layers', (layers: LayerItem[]) =>
        layers.filter((l) => l.id !== newLayer.id)
      );
    },
  };
}

/**
 * Lệnh 2: Xóa lớp vẽ (Remove Layer)
 */
export function createRemoveLayerCommand(layerId: string): Command {
  const currentLayers = appStore.getState().editor.layers;
  const removedLayer = currentLayers.find((l) => l.id === layerId);
  const layerIndex = currentLayers.findIndex((l) => l.id === layerId);

  return {
    id: `cmd_remove_layer_${Date.now()}`,
    name: `Xóa lớp: ${removedLayer?.name || layerId}`,
    timestamp: Date.now(),
    execute: () => {
      appStore.setState('editor.layers', (layers: LayerItem[]) =>
        layers.filter((l) => l.id !== layerId)
      );
    },
    undo: () => {
      if (removedLayer) {
        appStore.setState('editor.layers', (layers: LayerItem[]) => {
          const next = [...layers];
          next.splice(layerIndex, 0, removedLayer);
          return next;
        });
      }
    },
  };
}

/**
 * Lệnh 3: Di chuyển thứ tự lớp (Move Layer)
 */
export function createMoveLayerCommand(fromIndex: number, toIndex: number): Command {
  return {
    id: `cmd_move_layer_${Date.now()}`,
    name: `Đổi thứ tự lớp (${fromIndex} -> ${toIndex})`,
    timestamp: Date.now(),
    execute: () => {
      appStore.setState('editor.layers', (layers: LayerItem[]) => {
        const next = [...layers];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return next;
      });
    },
    undo: () => {
      appStore.setState('editor.layers', (layers: LayerItem[]) => {
        const next = [...layers];
        const [moved] = next.splice(toIndex, 1);
        next.splice(fromIndex, 0, moved);
        return next;
      });
    },
  };
}

/**
 * Lệnh 4: Biến đổi lớp (Transform Layer - Opacity / BlendMode)
 */
export function createTransformLayerCommand(
  layerId: string,
  prevProps: Partial<LayerItem>,
  nextProps: Partial<LayerItem>
): Command {
  return {
    id: `cmd_transform_layer_${Date.now()}`,
    name: `Chỉnh thông số lớp #${layerId.slice(-4)}`,
    timestamp: Date.now(),
    execute: () => {
      appStore.setState('editor.layers', (layers: LayerItem[]) =>
        layers.map((l) => (l.id === layerId ? { ...l, ...nextProps } : l))
      );
    },
    undo: () => {
      appStore.setState('editor.layers', (layers: LayerItem[]) =>
        layers.map((l) => (l.id === layerId ? { ...l, ...prevProps } : l))
      );
    },
  };
}

/**
 * Lệnh 5: Nét vẽ hoa văn (Draw Stroke)
 */
export function createDrawStrokeCommand(description: string, prevCanvasData: ImageData, nextCanvasData: ImageData, ctx: CanvasRenderingContext2D): Command {
  return {
    id: `cmd_draw_stroke_${Date.now()}`,
    name: description || 'Nét vẽ hoa văn',
    timestamp: Date.now(),
    execute: () => {
      ctx.putImageData(nextCanvasData, 0, 0);
      eventBus.emit(APP_EVENTS.EDITOR_TEXTURE_UPDATED, { canvas: ctx.canvas });
    },
    undo: () => {
      ctx.putImageData(prevCanvasData, 0, 0);
      eventBus.emit(APP_EVENTS.EDITOR_TEXTURE_UPDATED, { canvas: ctx.canvas });
    },
  };
}

/**
 * Lệnh 6: Đổi thông số trang phục (Change Garment Param)
 */
export function createChangeGarmentParamCommand(
  paramKey: string,
  prevVal: any,
  nextVal: any
): Command {
  return {
    id: `cmd_change_garment_${paramKey}_${Date.now()}`,
    name: `Đổi thông số: ${paramKey}`,
    timestamp: Date.now(),
    execute: () => {
      appStore.setState(`wardrobe.customParams.${paramKey}`, nextVal);
    },
    undo: () => {
      appStore.setState(`wardrobe.customParams.${paramKey}`, prevVal);
    },
  };
}

/**
 * Lệnh 7: Đổi màu sắc / ảnh background (Change Background)
 */
export function createChangeBackgroundCommand(
  prevBg: any,
  nextBg: any
): Command {
  return {
    id: `cmd_change_bg_${Date.now()}`,
    name: 'Đổi nền bối cảnh',
    timestamp: Date.now(),
    execute: () => {
      appStore.setState('background', nextBg);
    },
    undo: () => {
      appStore.setState('background', prevBg);
    },
  };
}
