import { WebSocketMessage } from "@repo/common/types";

const LOCAL_STORAGE_KEY = "unsent-ws-queue";

export class MessageQueue {
  private static queue: WebSocketMessage[] = [];
  private static isFlushing: boolean = false;

  static enqueue(message: WebSocketMessage) {
    this.queue.push(message);
    this.saveToStorage();
  }

  static dequeue(): WebSocketMessage | undefined {
    const msg = this.queue.shift();
    this.saveToStorage();
    return msg;
  }

  static peek(): WebSocketMessage | undefined {
    return this.queue[0];
  }

  static isEmpty(): boolean {
    return this.queue.length === 0;
  }

  static flush(sendFn: (msg: WebSocketMessage) => boolean) {
    if (this.isFlushing || this.isEmpty()) return;

    this.isFlushing = true;

    const tempQueue = [...this.queue];
    for (const message of tempQueue) {
      const success = sendFn(message);
      if (success) {
        this.dequeue();
      } else {
        break;
      }
    }

    this.isFlushing = false;
  }

  static saveToStorage() {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.queue));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      console.warn("Failed to persist message queue");
    }
  }

  static loadFromStorage() {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        this.queue = JSON.parse(saved);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      console.warn("Failed to load message queue");
    }
  }

  static clear() {
    this.queue = [];
    this.saveToStorage();
  }
}
