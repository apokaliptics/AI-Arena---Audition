/**
 * Vietnamese Traditional Costume Studio - Event Bus (Pub/Sub)
 * Cung cấp cơ chế giao tiếp phi tập trung giữa Left Panel, Right Panel, Center Viewport và Timeline.
 */

export type EventHandler<T = any> = (data: T) => void;

export class EventBus {
  private events: Map<string, Set<EventHandler>> = new Map();

  /**
   * Đăng ký lắng nghe sự kiện
   */
  public on<T = any>(eventName: string, handler: EventHandler<T>): () => void {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }
    const handlers = this.events.get(eventName)!;
    handlers.add(handler);

    // Trả về hàm hủy đăng ký
    return () => {
      this.off(eventName, handler);
    };
  }

  /**
   * Hủy lắng nghe sự kiện
   */
  public off<T = any>(eventName: string, handler: EventHandler<T>): void {
    const handlers = this.events.get(eventName);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.events.delete(eventName);
      }
    }
  }

  /**
   * Phát sự kiện tới toàn bộ subscriber
   */
  public emit<T = any>(eventName: string, data?: T): void {
    const handlers = this.events.get(eventName);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (err) {
          console.error(`Lỗi khi xử lý sự kiện [${eventName}]:`, err);
        }
      });
    }
  }

  /**
   * Lắng nghe sự kiện duy nhất 1 lần
   */
  public once<T = any>(eventName: string, handler: EventHandler<T>): () => void {
    const unsubscribe = this.on<T>(eventName, (data) => {
      unsubscribe();
      handler(data);
    });
    return unsubscribe;
  }

  /**
   * Xóa toàn bộ listener của một sự kiện hoặc toàn bộ event bus
   */
  public clear(eventName?: string): void {
    if (eventName) {
      this.events.delete(eventName);
    } else {
      this.events.clear();
    }
  }
}

// Khởi tạo Singleton Event Bus
export const eventBus = new EventBus();

// Định nghĩa các tên sự kiện chuẩn của ứng dụng
export const APP_EVENTS = {
  // Timeline events
  TIMELINE_ERA_SELECT: 'timeline:era_select',
  TIMELINE_COSTUME_SELECT: 'timeline:costume_select',
  TIMELINE_NAVIGATE_PREV: 'timeline:navigate_prev',
  TIMELINE_NAVIGATE_NEXT: 'timeline:navigate_next',

  // Viewport 3D events
  VIEWPORT_RESET_CAMERA: 'viewport:reset_camera',
  VIEWPORT_CAPTURE_SNAPSHOT: 'viewport:capture_snapshot',
  VIEWPORT_SET_LIGHTING: 'viewport:set_lighting',
  VIEWPORT_SET_POSE: 'viewport:set_pose',
  VIEWPORT_SNAPSHOT_READY: 'viewport:snapshot_ready',

  // Editor events
  EDITOR_SET_TOOL: 'editor:set_tool',
  EDITOR_SELECT_LAYER: 'editor:select_layer',
  EDITOR_DRAW_STROKE: 'editor:draw_stroke',
  EDITOR_TEXTURE_UPDATED: 'editor:texture_updated',
  EDITOR_APPLY_TEXTURE: 'editor:apply_texture',
  EDITOR_CLEAR_CANVAS: 'editor:clear_canvas',

  // Wardrobe & Avatar
  AVATAR_SET_SKIN: 'avatar:set_skin',
  AVATAR_SET_SCALE: 'avatar:set_scale',
  WARDROBE_EQUIP_OUTFIT: 'wardrobe:equip_outfit',
  WARDROBE_TOGGLE_ACCESSORY: 'wardrobe:toggle_accessory',

  // Background
  BACKGROUND_CHANGE_COLOR: 'background:change_color',
  BACKGROUND_CHANGE_IMAGE: 'background:change_image',

  // Undo / Redo
  COMMAND_EXECUTED: 'command:executed',
  COMMAND_UNDONE: 'command:undone',
  COMMAND_REDONE: 'command:redone',

  // UI Notifications & Modals
  SHOW_TOAST: 'ui:show_toast',
  OPEN_MODAL: 'ui:open_modal',
  CLOSE_MODAL: 'ui:close_modal',
  TOGGLE_DEBUG: 'ui:toggle_debug',
} as const;
