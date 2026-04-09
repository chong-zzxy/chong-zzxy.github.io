/**
 * Xingwei Theme - Main JavaScript
 * 处理主题交互功能
 */

(function() {
  'use strict';

  // ====================
  // 暗黑模式切换
  // ====================
  const themeToggle = document.getElementById('theme-toggle');
  const htmlElement = document.documentElement;
  const safeStorage = {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch (error) {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch (error) {
      }
    }
  };

  // 从 localStorage 读取主题设置
  const savedTheme = safeStorage.get('theme') || 'light';
  if (savedTheme === 'dark') {
    htmlElement.classList.add('dark');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      htmlElement.classList.toggle('dark');

      // 保存设置到 localStorage
      if (htmlElement.classList.contains('dark')) {
        safeStorage.set('theme', 'dark');
      } else {
        safeStorage.set('theme', 'light');
      }
    });
  }

  // ====================
  // 移动端导航菜单
  // ====================
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  let closeMobileMenu = function() {};

  if (mobileToggle && navMenu) {
    const toggleSpans = mobileToggle.querySelectorAll('span');
    const applyMobileToggleVisualState = function(isOpen) {
      if (!toggleSpans.length) return;
      toggleSpans[0].style.transform = isOpen ? 'rotate(45deg) translateY(7px)' : 'none';
      toggleSpans[1].style.opacity = isOpen ? '0' : '1';
      toggleSpans[2].style.transform = isOpen ? 'rotate(-45deg) translateY(-7px)' : 'none';
    };
    const setMobileMenuState = function(isOpen) {
      navMenu.classList.toggle('active', isOpen);
      mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      applyMobileToggleVisualState(isOpen);
    };
    closeMobileMenu = function() {
      setMobileMenuState(false);
    };

    // 初始化状态，避免刷新后 aria 与视觉不同步。
    setMobileMenuState(navMenu.classList.contains('active'));

    mobileToggle.addEventListener('click', function() {
      const isOpen = !navMenu.classList.contains('active');
      setMobileMenuState(isOpen);
    });

    // 点击外部关闭菜单
    document.addEventListener('click', function(e) {
      if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        closeMobileMenu();
      }
    });

    // 移动端点击菜单项后自动收起菜单。
    navMenu.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        closeMobileMenu();
      });
    });
  }

  // ====================
  // 返回顶部按钮
  // ====================
  const backToTop = document.getElementById('back-to-top');

  if (backToTop) {
    // 滚动时显示/隐藏按钮
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        backToTop.classList.add('show');
      } else {
        backToTop.classList.remove('show');
      }
    });

    // 点击返回顶部
    backToTop.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ====================
  // 图片懒加载增强
  // ====================
  const images = document.querySelectorAll('img[loading="lazy"]');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(function(img) {
      imageObserver.observe(img);
    });
  }

  // ====================
  // 外链新窗口打开
  // ====================
  const links = document.querySelectorAll('a[href]');
  links.forEach(function(link) {
    const rawHref = link.getAttribute('href');
    if (!rawHref) return;
    if (
      rawHref.startsWith('#') ||
      rawHref.startsWith('mailto:') ||
      rawHref.startsWith('tel:') ||
      rawHref.startsWith('javascript:')
    ) {
      return;
    }

    let isExternal = false;
    try {
      const parsed = new URL(rawHref, window.location.href);
      isExternal = parsed.origin !== window.location.origin;
    } catch (error) {
      isExternal = false;
    }

    if (isExternal && !link.getAttribute('target')) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });

  // ====================
  // 代码块复制功能
  // ====================
  const codeBlocks = document.querySelectorAll('pre code');

  codeBlocks.forEach(function(codeBlock) {
    // 创建复制按钮
    const copyButton = document.createElement('button');
    copyButton.className = 'code-copy-btn';
    copyButton.textContent = '复制';
    copyButton.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      padding: 4px 12px;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.3s;
    `;

    const pre = codeBlock.parentElement;
    pre.style.position = 'relative';
    pre.appendChild(copyButton);

    // 鼠标悬停显示按钮
    pre.addEventListener('mouseenter', function() {
      copyButton.style.opacity = '1';
    });

    pre.addEventListener('mouseleave', function() {
      copyButton.style.opacity = '0';
    });

    // 复制功能
    copyButton.addEventListener('click', function() {
      const code = codeBlock.textContent;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(code).then(function() {
          copyButton.textContent = '已复制!';
          setTimeout(function() {
            copyButton.textContent = '复制';
          }, 2000);
        });
      } else {
        // 降级方案
        const textarea = document.createElement('textarea');
        textarea.value = code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        copyButton.textContent = '已复制!';
        setTimeout(function() {
          copyButton.textContent = '复制';
        }, 2000);
      }
    });
  });

  // ====================
  // 平滑滚动锚点
  // ====================
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      if (e.defaultPrevented) return;
      const href = this.getAttribute('href');
      if (!href || href === '#' || this.hasAttribute('data-no-smooth-scroll')) return;

      let target = null;
      try {
        target = document.querySelector(href);
      } catch (error) {
        target = null;
      }
      if (!target) {
        const fallbackId = href.slice(1);
        target = document.getElementById(decodeURIComponent(fallbackId));
      }
      if (!target) return;

      e.preventDefault();
      const headerOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      window.scrollTo({
        top: offsetPosition,
        behavior: reduceMotion ? 'auto' : 'smooth'
      });

      const nextHash = target.id ? ('#' + target.id) : href;
      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', nextHash);
      } else {
        window.location.hash = nextHash;
      }
    });
  });

  // ====================
  // 文章卡片视差效果
  // ====================
  const cards = document.querySelectorAll('.post-card, .category-card');

  cards.forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', function() {
      card.style.transform = '';
    });
  });

  // ====================
  // 性能优化：防抖函数
  // ====================
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = function() {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // 滚动事件防抖
  let ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        // 这里可以添加需要在滚动时执行的其他逻辑
        ticking = false;
      });
      ticking = true;
    }
  });

  // ====================
  // 页面加载完成动画
  // ====================
  window.addEventListener('load', function() {
    document.body.classList.add('loaded');

    // 添加渐入动画
    const animatedElements = document.querySelectorAll('.post-card, .category-card');
    animatedElements.forEach(function(el, index) {
      setTimeout(function() {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, index * 100);
    });
  });

  // ====================
  // 打印优化
  // ====================
  window.addEventListener('beforeprint', function() {
    // 展开所有折叠的内容
    document.querySelectorAll('details').forEach(function(details) {
      details.setAttribute('open', '');
    });
  });

  // ====================
  // 键盘快捷键
  // ====================
  document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K: 搜索（如果有搜索功能）
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      // 这里可以添加搜索功能的触发逻辑
    }

    // Esc: 关闭移动端菜单
    if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
      closeMobileMenu();
    }
  });

})();
