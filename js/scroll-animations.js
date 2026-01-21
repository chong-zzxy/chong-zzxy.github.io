/**
 * 滚动动画 - Intersection Observer
 * 优雅的淡入效果
 */

class ScrollAnimations {
  constructor() {
    this.init();
  }

  init() {
    // 配置观察器选项
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };

    // 创建观察器
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // 一次性动画，观察后即移除
          this.observer.unobserve(entry.target);
        }
      });
    }, options);

    // 观察所有需要动画的元素
    this.observeElements();
  }

  observeElements() {
    // 自动添加 fade-in-element 类的元素
    const elements = document.querySelectorAll('.fade-in-element');
    elements.forEach(el => this.observer.observe(el));

    // 手动指定需要动画的元素
    const selectors = [
      '.stat-card',
      '.skill-tag',
      '.featured-post-card',
      '.post-card',
      '.album-card',
      '.category-item',
      '.tag-item'
    ];

    selectors.forEach(selector => {
      const els = document.querySelectorAll(selector);
      els.forEach((el, index) => {
        if (!el.classList.contains('fade-in-element')) {
          el.classList.add('fade-in-element');
          // 设置延迟
          el.style.transitionDelay = `${index * 0.1}s`;
        }
        this.observer.observe(el);
      });
    });
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new ScrollAnimations();
});

// 页面加载完成后的淡入
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});
