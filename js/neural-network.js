/**
 * 神经网络动画 - 绿色主题版
 * 特性：
 * - 贝塞尔曲线连线
 * - 颜色渐变变化
 * - Parallax 视差效果
 * - 鼠标跟随
 */

class NeuralNetwork {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.connections = [];
    this.mouse = { x: null, y: null, radius: 150 };

    // 统一绿色色系 - 避免杂色
    this.colors = {
      primary: 'rgba(132, 165, 157, ',      // 主绿色
      light: 'rgba(168, 197, 190, ',        // 淡绿色
      dark: 'rgba(95, 138, 129, ',          // 深绿色
      white: 'rgba(253, 252, 248, ',        // 奶白色
    };

    this.parallaxOffset = { x: 0, y: 0 };

    this.init();
    this.setupEventListeners();
    this.animate();
  }

  init() {
    this.resizeCanvas();
    this.createParticles();
  }

  resizeCanvas() {
    this.canvas.width = this.canvas.offsetWidth * window.devicePixelRatio;
    this.canvas.height = this.canvas.offsetHeight * window.devicePixelRatio;
    this.canvas.style.width = this.canvas.offsetWidth + 'px';
    this.canvas.style.height = this.canvas.offsetHeight + 'px';
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  createParticles() {
    // 减少粒子数量，避免视觉噪音
    const numParticles = Math.floor((this.canvas.width * this.canvas.height) / 25000);
    this.particles = [];

    for (let i = 0; i < numParticles; i++) {
      this.particles.push(new Particle(
        Math.random() * this.canvas.width,
        Math.random() * this.canvas.height,
        this.colors
      ));
    }
  }

  setupEventListeners() {
    // 鼠标移动
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;

      // Parallax 效果
      const centerX = this.canvas.offsetWidth / 2;
      const centerY = this.canvas.offsetHeight / 2;
      this.parallaxOffset.x = (this.mouse.x - centerX) * 0.02;
      this.parallaxOffset.y = (this.mouse.y - centerY) * 0.02;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
      this.parallaxOffset.x = 0;
      this.parallaxOffset.y = 0;
    });

    // 窗口缩放
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.createParticles();
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 更新和绘制粒子
    this.particles.forEach(particle => {
      particle.update(this.mouse, this.parallaxOffset, this.canvas);
      particle.draw(this.ctx);
    });

    // 绘制连接（贝塞尔曲线）
    this.drawConnections();

    requestAnimationFrame(() => this.animate());
  }

  drawConnections() {
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
          // 极淡的透明度，避免视觉噪音
          const opacity = (1 - distance / 150) * 0.12;

          // 统一绿色，不再使用杂色
          const greenShade = 132 + (distance / 150) * 40; // 132-172 范围

          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(${greenShade}, ${greenShade + 30}, ${greenShade + 25}, ${opacity})`;
          this.ctx.lineWidth = 1.2; // 加粗线条

          // 平滑贝塞尔曲线
          const cpx = (p1.x + p2.x) / 2 + (Math.random() - 0.5) * 15;
          const cpy = (p1.y + p2.y) / 2 + (Math.random() - 0.5) * 15;

          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.quadraticCurveTo(cpx, cpy, p2.x, p2.y);
          this.ctx.stroke();
        }
      }
    }
  }

}

class Particle {
  constructor(x, y, colors) {
    this.x = x;
    this.y = y;
    this.baseX = x;
    this.baseY = y;
    this.size = Math.random() * 2 + 1.5;
    this.speedX = (Math.random() - 0.5) * 0.25;
    this.speedY = (Math.random() - 0.5) * 0.25;
    this.colors = colors;

    // 统一绿色系，随机选择深浅
    const colorOptions = ['primary', 'light', 'dark', 'white'];
    this.colorKey = colorOptions[Math.floor(Math.random() * colorOptions.length)];

    // 降低透明度，避免过于抢眼
    this.opacity = Math.random() * 0.3 + 0.15;
  }

  update(mouse, parallax, canvas) {
    // 基础移动
    this.x += this.speedX;
    this.y += this.speedY;

    // 边界检测
    if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
    if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

    // Parallax 效果
    this.x += parallax.x * 0.05;
    this.y += parallax.y * 0.05;

    // 鼠标交互 - 避让效果
    if (mouse.x !== null) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < mouse.radius) {
        const force = (mouse.radius - distance) / mouse.radius;
        const angle = Math.atan2(dy, dx);
        this.x -= Math.cos(angle) * force * 3;
        this.y -= Math.sin(angle) * force * 3;
      }
    }

    // 回归原位
    const dxBase = this.baseX - this.x;
    const dyBase = this.baseY - this.y;
    this.x += dxBase * 0.02;
    this.y += dyBase * 0.02;
  }

  draw(ctx) {
    // 极淡的光晕效果
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.size * 2.5
    );
    gradient.addColorStop(0, this.colors[this.colorKey] + (this.opacity * 0.8) + ')');
    gradient.addColorStop(1, this.colors[this.colorKey] + '0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 核心粒子
    ctx.fillStyle = this.colors[this.colorKey] + (this.opacity + 0.2) + ')';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('neural-canvas');
  if (canvas) {
    new NeuralNetwork(canvas);
  }
});
