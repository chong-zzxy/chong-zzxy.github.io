/**
 * Caochong Theme - Main JavaScript
 * 处理主题交互功能
 */

(function() {
  'use strict';

  // ====================
  // 暗黑模式切换
  // ====================
  const themeToggle = document.getElementById('theme-toggle');
  const htmlElement = document.documentElement;

  // 从 localStorage 读取主题设置
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    htmlElement.classList.add('dark');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      htmlElement.classList.toggle('dark');

      // 保存设置到 localStorage
      if (htmlElement.classList.contains('dark')) {
        localStorage.setItem('theme', 'dark');
      } else {
        localStorage.setItem('theme', 'light');
      }
    });
  }

  // ====================
  // 移动端导航菜单
  // ====================
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', function() {
      navMenu.classList.toggle('active');

      // 切换按钮动画
      const spans = mobileToggle.querySelectorAll('span');
      spans[0].style.transform = navMenu.classList.contains('active')
        ? 'rotate(45deg) translateY(7px)'
        : 'none';
      spans[1].style.opacity = navMenu.classList.contains('active') ? '0' : '1';
      spans[2].style.transform = navMenu.classList.contains('active')
        ? 'rotate(-45deg) translateY(-7px)'
        : 'none';
    });

    // 点击外部关闭菜单
    document.addEventListener('click', function(e) {
      if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        navMenu.classList.remove('active');
        const spans = mobileToggle.querySelectorAll('span');
        spans.forEach(span => {
          span.style.transform = 'none';
          span.style.opacity = '1';
        });
      }
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
  // 目录高亮
  // ====================
  const tocLinks = document.querySelectorAll('.toc-content a');
  const headings = document.querySelectorAll('.post-body h1, .post-body h2, .post-body h3');

  if (tocLinks.length > 0 && headings.length > 0) {
    const observer = new IntersectionObserver(
      function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');

            // 移除所有高亮
            tocLinks.forEach(function(link) {
              link.style.color = '';
              link.style.background = '';
            });

            // 高亮当前项
            const activeLink = document.querySelector(`.toc-content a[href="#${id}"]`);
            if (activeLink) {
              activeLink.style.color = 'var(--primary)';
              activeLink.style.background = 'var(--primary-alpha-10)';
            }
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px'
      }
    );

    headings.forEach(function(heading) {
      observer.observe(heading);
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
  const links = document.querySelectorAll('a[href^="http"]');
  links.forEach(function(link) {
    if (!link.getAttribute('target')) {
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
      const href = this.getAttribute('href');

      if (href !== '#' && href !== '') {
        e.preventDefault();
        const target = document.querySelector(href);

        if (target) {
          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
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
      navMenu.classList.remove('active');
    }
  });

  console.log('%c✨ Caochong Theme %cv1.0.0',
    'color: #317EFB; font-size: 20px; font-weight: bold;',
    'color: #60a5fa; font-size: 14px;');

  // ====================
  // Landing Page 特效
  // ====================

  // Canvas 粒子背景
  const particlesCanvas = document.getElementById('particles-canvas');
  if (particlesCanvas) {
    const ctx = particlesCanvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null, radius: 150 };

    // 设置canvas尺寸
    function resizeCanvas() {
      particlesCanvas.width = particlesCanvas.offsetWidth;
      particlesCanvas.height = particlesCanvas.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 粒子类
    class Particle {
      constructor() {
        this.x = Math.random() * particlesCanvas.width;
        this.y = Math.random() * particlesCanvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.color = 'rgba(49, 126, 251, ' + (Math.random() * 0.5 + 0.2) + ')';
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // 边界检测
        if (this.x > particlesCanvas.width || this.x < 0) {
          this.speedX = -this.speedX;
        }
        if (this.y > particlesCanvas.height || this.y < 0) {
          this.speedY = -this.speedY;
        }

        // 鼠标交互
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius && mouse.x !== null) {
          const force = (mouse.radius - distance) / mouse.radius;
          const directionX = dx / distance;
          const directionY = dy / distance;
          this.x -= directionX * force * 2;
          this.y -= directionY * force * 2;
        }
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 初始化粒子
    function init() {
      particles = [];
      const particleCount = Math.min(Math.floor(particlesCanvas.width * particlesCanvas.height / 10000), 100);
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }
    init();

    // 连接粒子
    function connectParticles() {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            const opacity = (100 - distance) / 100 * 0.3;
            ctx.strokeStyle = 'rgba(49, 126, 251, ' + opacity + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    }

    // 动画循环
    function animate() {
      ctx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      connectParticles();
      requestAnimationFrame(animate);
    }
    animate();

    // 鼠标移动监听
    particlesCanvas.addEventListener('mousemove', function(e) {
      mouse.x = e.offsetX;
      mouse.y = e.offsetY;
    });

    particlesCanvas.addEventListener('mouseleave', function() {
      mouse.x = null;
      mouse.y = null;
    });
  }

  // 打字机效果
  const typewriterElement = document.getElementById('typewriter');
  if (typewriterElement) {
    const texts = [
      'AI Algorithm Engineer',
      'Computer Vision Expert',
      'NLP Enthusiast',
      'Deep Learning Practitioner'
    ];
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
      const currentText = texts[textIndex];

      if (isDeleting) {
        typewriterElement.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
      } else {
        typewriterElement.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 100;
      }

      if (!isDeleting && charIndex === currentText.length) {
        typingSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
        typingSpeed = 500;
      }

      setTimeout(type, typingSpeed);
    }
    type();
  }

  // 数字滚动动画
  function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    function update() {
      current += step;
      if (current < target) {
        element.textContent = Math.floor(current);
        requestAnimationFrame(update);
      } else {
        element.textContent = target;
      }
    }
    update();
  }

  // 观察统计卡片，进入视口时触发动画
  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length > 0 && 'IntersectionObserver' in window) {
    let animated = false;
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting && !animated) {
          statNumbers.forEach(animateCounter);
          animated = true;
        }
      });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
      observer.observe(statsSection);
    }
  }

  // 滚动指示器隐藏
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 100) {
        scrollIndicator.style.opacity = '0';
        scrollIndicator.style.visibility = 'hidden';
      } else {
        scrollIndicator.style.opacity = '1';
        scrollIndicator.style.visibility = 'visible';
      }
    });
  }
})();
