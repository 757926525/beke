/**
 * Global File Operation Progress State Manager
 * 负责全站文件上传、下载与同步操作时的动态进度监听与展示。
 * 严格遵循用户规范：仅在用户触发操作时浮动显示进度条，闲置时彻底隐藏。
 */

class ProgressTracker {
  constructor() {
    this.state = {
      active: false,
      type: 'upload',
      filename: '',
      percent: 0
    };
    this.listeners = new Set();
    this.timer = null;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify() {
    this.listeners.forEach((fn) => fn({ ...this.state }));
  }

  start(type, filename) {
    if (this.timer) clearInterval(this.timer);
    this.state = {
      active: true,
      type,
      filename,
      percent: 15
    };
    this.notify();

    // 动态步进模拟真实流传输
    this.timer = setInterval(() => {
      if (this.state.percent < 90) {
        this.state.percent += Math.floor(Math.random() * 15) + 10;
        if (this.state.percent > 90) this.state.percent = 90;
        this.notify();
      }
    }, 150);
  }

  update(percent) {
    this.state.percent = Math.min(100, Math.max(0, percent));
    this.notify();
  }

  complete() {
    if (this.timer) clearInterval(this.timer);
    this.state.percent = 100;
    this.notify();

    setTimeout(() => {
      this.state.active = false;
      this.notify();
    }, 600);
  }

  cancel() {
    if (this.timer) clearInterval(this.timer);
    this.state.active = false;
    this.notify();
  }
}

export const fileProgress = new ProgressTracker();
