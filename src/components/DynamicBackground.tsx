import React, { useEffect, useRef } from 'react';

export default function DynamicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      isActive: false
    };

    let scrollY = window.scrollY;
    
    const PARTICLES_COUNT = Math.min(Math.floor((width * height) / 16000), 50); 
    const CONNECTION_DISTANCE = 100;
    const MOUSE_ATTRACTION_RADIUS = 150;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      baseSize: number;
      size: number;
      color: string;
      alpha: number;
    }

    const colors = ['#2de2e6', '#55ff9f', '#8f6bff', '#ffffff'];

    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLES_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        baseSize: Math.random() * 1.2 + 0.4,
        size: Math.random() * 1.2 + 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.4 + 0.1,
      });
    }

    const GRID_SIZE = CONNECTION_DISTANCE;

    function drawConnections() {
      if (!ctx) return;
      
      const grid: Map<string, number[]> = new Map();
      
      for (let i = 0; i < particles.length; i++) {
        const gx = Math.floor(particles[i].x / GRID_SIZE);
        const gy = Math.floor(particles[i].y / GRID_SIZE);
        const key = `${gx},${gy}`;
        if (!grid.has(key)) grid.set(key, []);
        grid.get(key)!.push(i);
      }

      ctx.strokeStyle = '#2de2e6';
      ctx.lineWidth = 0.4;

      for (const [key, indices] of grid) {
        const [gx, gy] = key.split(',').map(Number);
        
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const neighborKey = `${gx + dx},${gy + dy}`;
            const neighborIndices = grid.get(neighborKey);
            if (!neighborIndices) continue;

            for (const a of indices) {
              for (const b of neighborIndices) {
                if (a >= b) continue;
                
                const ddx = particles[a].x - particles[b].x;
                const ddy = particles[a].y - particles[b].y;
                const distSq = ddx * ddx + ddy * ddy;
                const maxDistSq = CONNECTION_DISTANCE * CONNECTION_DISTANCE;

                if (distSq < maxDistSq) {
                  const opacity = 1 - Math.sqrt(distSq) / CONNECTION_DISTANCE;
                  ctx.globalAlpha = opacity * 0.15;
                  ctx.beginPath();
                  ctx.moveTo(particles[a].x, particles[a].y);
                  ctx.lineTo(particles[b].x, particles[b].y);
                  ctx.stroke();
                }
              }
            }
          }
        }
      }
      ctx.globalAlpha = 1;
    }

    function drawParticle(p: Particle) {
      if (!ctx) return;
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
      gradient.addColorStop(0, p.color);
      gradient.addColorStop(0.4, p.color + '80');
      gradient.addColorStop(1, 'transparent');
      
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.globalAlpha = p.alpha * 1.5;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    let animationFrameId: number;

    function animate() {
      if (!ctx || !canvas) return;

      ctx.fillStyle = 'rgba(4, 7, 15, 0.15)';
      ctx.fillRect(0, 0, width, height);

      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      const currentScroll = window.scrollY;
      const scrollDelta = currentScroll - scrollY;
      scrollY = currentScroll;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        p.x += p.vx;
        p.y += p.vy;
        p.y -= scrollDelta * 0.2;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < -30) p.y = height + 30;
        if (p.y > height + 30) p.y = -30;

        if (mouse.isActive) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < MOUSE_ATTRACTION_RADIUS) {
            const force = (MOUSE_ATTRACTION_RADIUS - dist) / MOUSE_ATTRACTION_RADIUS;
            p.vx += (dx / dist) * force * 0.03;
            p.vy += (dy / dist) * force * 0.03;
            p.size = p.baseSize + force * 1.5;
            p.alpha = Math.min(p.alpha + 0.015, 0.7);
          } else {
            p.size += (p.baseSize - p.size) * 0.1;
            p.alpha += (0.2 - p.alpha) * 0.05;
            p.vx *= 0.995;
            p.vy *= 0.995;
          }
        }

        drawParticle(p);
      }

      drawConnections();
      animationFrameId = requestAnimationFrame(animate);
    }

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.isActive = true;
    };

    const handleMouseLeave = () => {
      mouse.isActive = false;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        opacity: 0.5
      }}
    />
  );
}
