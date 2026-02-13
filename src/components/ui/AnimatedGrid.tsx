"use client";

import { useEffect, useRef } from "react";

// ── Perlin Noise (pure JS implementation) ──────────────────────────
// Based on Ken Perlin's improved noise reference implementation
class PerlinNoise {
    private perm: number[];

    constructor() {
        const p = Array.from({ length: 256 }, (_, i) => i);
        // Fisher-Yates shuffle
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [p[i], p[j]] = [p[j], p[i]];
        }
        this.perm = [...p, ...p]; // double it
    }

    private fade(t: number) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    private lerp(a: number, b: number, t: number) {
        return a + t * (b - a);
    }

    private grad(hash: number, x: number, y: number, z: number) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    noise(x: number, y: number, z: number = 0): number {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);

        const A = this.perm[X] + Y;
        const AA = this.perm[A] + Z;
        const AB = this.perm[A + 1] + Z;
        const B = this.perm[X + 1] + Y;
        const BA = this.perm[B] + Z;
        const BB = this.perm[B + 1] + Z;

        return (
            this.lerp(
                this.lerp(
                    this.lerp(
                        this.grad(this.perm[AA], x, y, z),
                        this.grad(this.perm[BA], x - 1, y, z),
                        u
                    ),
                    this.lerp(
                        this.grad(this.perm[AB], x, y - 1, z),
                        this.grad(this.perm[BB], x - 1, y - 1, z),
                        u
                    ),
                    v
                ),
                this.lerp(
                    this.lerp(
                        this.grad(this.perm[AA + 1], x, y, z - 1),
                        this.grad(this.perm[BA + 1], x - 1, y, z - 1),
                        u
                    ),
                    this.lerp(
                        this.grad(this.perm[AB + 1], x, y - 1, z - 1),
                        this.grad(this.perm[BB + 1], x - 1, y - 1, z - 1),
                        u
                    ),
                    v
                ),
                w
            ) *
            0.5 +
            0.5
        );
    }
}

// ── Particle ───────────────────────────────────────────────────────
interface Vec2 {
    x: number;
    y: number;
}

class Particle {
    pos: Vec2;
    vel: Vec2;
    acc: Vec2;
    prevPos: Vec2;
    maxspeed: number;
    color: string;

    constructor(width: number, height: number) {
        this.pos = { x: Math.random() * width, y: Math.random() * height };
        // Random initial velocity
        const angle = Math.random() * Math.PI * 2;
        this.vel = { x: Math.cos(angle), y: Math.sin(angle) };
        this.acc = { x: 0, y: 0 };
        this.prevPos = { x: this.pos.x, y: this.pos.y };
        this.maxspeed = 1.5;

        // Mixed tones — greys with subtle light blue and violet hints
        const roll = Math.random();
        if (roll < 0.35) {
            // Light blue / cyan tones
            const alpha = 0.06 + Math.random() * 0.12;
            const r = 20 + Math.floor(Math.random() * 40);
            const g = 140 + Math.floor(Math.random() * 60);
            const b = 200 + Math.floor(Math.random() * 55);
            this.color = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } else if (roll < 0.5) {
            // Subtle violet hints
            const alpha = 0.05 + Math.random() * 0.08;
            const r = 100 + Math.floor(Math.random() * 60);
            const g = 40 + Math.floor(Math.random() * 30);
            const b = 200 + Math.floor(Math.random() * 55);
            this.color = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } else {
            // Original grey tones
            const brightness = Math.floor(20 + Math.random() * 80);
            const alpha = 0.08 + Math.random() * 0.10;
            this.color = `rgba(${brightness}, ${brightness}, ${brightness}, ${alpha})`;
        }
    }

    applyForce(force: Vec2) {
        this.acc.x += force.x;
        this.acc.y += force.y;
    }

    update() {
        this.vel.x += this.acc.x;
        this.vel.y += this.acc.y;

        // Limit velocity
        const speed = Math.sqrt(this.vel.x ** 2 + this.vel.y ** 2);
        if (speed > this.maxspeed) {
            this.vel.x = (this.vel.x / speed) * this.maxspeed;
            this.vel.y = (this.vel.y / speed) * this.maxspeed;
        }

        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        this.acc.x = 0;
        this.acc.y = 0;
    }

    edges(width: number, height: number) {
        if (this.pos.x > width) {
            this.pos.x = 0;
            this.prevPos.x = this.pos.x;
            this.prevPos.y = this.pos.y;
        }
        if (this.pos.x < 0) {
            this.pos.x = width;
            this.prevPos.x = this.pos.x;
            this.prevPos.y = this.pos.y;
        }
        if (this.pos.y > height) {
            this.pos.y = 0;
            this.prevPos.x = this.pos.x;
            this.prevPos.y = this.pos.y;
        }
        if (this.pos.y < 0) {
            this.pos.y = height;
            this.prevPos.x = this.pos.x;
            this.prevPos.y = this.pos.y;
        }
    }

    show(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.moveTo(this.prevPos.x, this.prevPos.y);
        ctx.lineTo(this.pos.x, this.pos.y);
        ctx.stroke();

        this.prevPos.x = this.pos.x;
        this.prevPos.y = this.pos.y;
    }

    follow(flowfield: Vec2[], cols: number, scl: number) {
        const x = Math.floor(this.pos.x / scl);
        const y = Math.floor(this.pos.y / scl);
        const index = x + y * cols;
        const force = flowfield[index];
        if (force) {
            this.applyForce(force);
        }
    }
}

// ── Component ──────────────────────────────────────────────────────
export function AnimatedGrid() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const perlin = new PerlinNoise();
        const inc = 0.05;
        const scl = 50;
        let zoff = 0;
        let animationId: number;

        let cols: number;
        let rows: number;
        let flowfield: Vec2[];
        let particles: Particle[];

        const init = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            cols = Math.floor(canvas.width / scl);
            rows = Math.floor(canvas.height / scl);
            flowfield = new Array(cols * rows);

            // Initialize particles
            particles = [];
            for (let i = 0; i < 250; i++) {
                particles.push(new Particle(canvas.width, canvas.height));
            }

            // Fill with the site background color
            ctx.fillStyle = "#fafafa";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        };

        const draw = () => {
            // Fade previous frame — keeps trails soft and prevents over-accumulation
            ctx.fillStyle = "rgba(250, 250, 250, 0.04)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Compute flow field from Perlin noise
            let yoff = 0;
            for (let y = 0; y < rows; y++) {
                let xoff = 0;
                for (let x = 0; x < cols; x++) {
                    const index = x + y * cols;
                    const angle = perlin.noise(xoff, yoff, zoff) * Math.PI * 2 * 4;
                    flowfield[index] = {
                        x: Math.cos(angle) * 0.8,
                        y: Math.sin(angle) * 0.8,
                    };
                    xoff += inc;
                }
                yoff += inc;
                zoff += 0.0004;
            }

            // Update and draw particles
            for (let i = 0; i < particles.length; i++) {
                particles[i].follow(flowfield, cols, scl);
                particles[i].update();
                particles[i].edges(canvas.width, canvas.height);
                particles[i].show(ctx);
            }

            animationId = requestAnimationFrame(draw);
        };

        init();
        draw();

        const handleResize = () => {
            init();
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none"
            aria-hidden="true"
        />
    );
}
