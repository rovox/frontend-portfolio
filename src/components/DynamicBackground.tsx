import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function DynamicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Only run on the client
    if (typeof window === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Mouse tracking state
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      isActive: false
    };

    // Scroll tracking for parallax
    let scrollY = window.scrollY;
    
    // Particle configuration
    const PARTICLES_COUNT = Math.min(Math.floor((width * height) / 8000), 100); 
    const CONNECTION_DISTANCE = 120;
    const MOUSE_ATTRACTION_RADIUS = 200;

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      baseSize: number;
      size: number;
      color: string;
      alpha: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.baseSize = Math.random() * 1.5 + 0.5;
        this.size = this.baseSize;
        
        // Matrix/Cyan glowing color palette
        const colors = ['#2de2e6', '#55ff9f', '#8f6bff', '#ffffff'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = Math.random() * 0.5 + 0.1;
      }

      update(scrollDelta: number) {
        // Move
        this.x += this.vx;
        this.y += this.vy;

        // Apply scroll parallax
        this.y -= scrollDelta * 0.3;

        // Wrapping edges
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < -50) this.y = height + 50;
        if (this.y > height + 50) this.y = -50;

        // Mouse interaction
        if (mouse.isActive) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < MOUSE_ATTRACTION_RADIUS) {
            const force = (MOUSE_ATTRACTION_RADIUS - dist) / MOUSE_ATTRACTION_RADIUS;
            this.vx += (dx / dist) * force * 0.05;
            this.vy += (dy / dist) * force * 0.05;
            
            this.size = this.baseSize + force * 2;
            this.alpha = Math.min(this.alpha + 0.02, 0.8);
          } else {
            this.size = this.baseSize;
            this.alpha = Math.max(this.alpha - 0.01, 0.1);
            
            this.vx *= 0.99;
            this.vy *= 0.99;
            
            if (Math.abs(this.vx) < 0.2) this.vx += (Math.random() - 0.5) * 0.1;
            if (Math.abs(this.vy) < 0.2) this.vy += (Math.random() - 0.5) * 0.1;
          }
        }
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        
        ctx.fill();
        ctx.restore();
      }
    }

    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLES_COUNT; i++) {
      particles.push(new Particle());
    }

    function drawConnections() {
      if (!ctx) return;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DISTANCE) {
            const opacity = 1 - (dist / CONNECTION_DISTANCE);
            ctx.save();
            ctx.globalAlpha = opacity * 0.2;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.strokeStyle = '#2de2e6';
            ctx.lineWidth = 0.5;
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    }

    let animationFrameId: number;

    function animate() {
      if (!ctx || !canvas) return;

      // Clear rect with opacity for trails effect
      ctx.fillStyle = 'rgba(4, 7, 15, 0.2)'; // Matches var(--bg)
      ctx.fillRect(0, 0, width, height);

      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;

      const currentScroll = window.scrollY;
      const scrollDelta = currentScroll - scrollY;
      scrollY = currentScroll;

      for (let i = 0; i < particles.length; i++) {
        particles[i].update(scrollDelta);
        particles[i].draw();
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

    const scrollAnim = gsap.to(canvas, {
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5,
      },
      rotation: 5,
      scale: 1.1,
      ease: 'none',
      transformOrigin: '50% 50%'
    });

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
      if (scrollAnim) scrollAnim.kill();
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        opacity: 0.6
      }}
    />
  );
}
