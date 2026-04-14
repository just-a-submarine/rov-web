"use client";

import { useEffect, useRef } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export function BubbleField() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    });
  }, []);

  return (
    <Particles
      id="bubble-field"
      className="absolute inset-0 -z-10"
      options={{
        fullScreen: false,
        background: { color: "transparent" },
        fpsLimit: 60,
        particles: {
          number: { value: 60, density: { enable: true, width: 1920, height: 1080 } },
          color: { value: ["#22D3EE", "#A78BFA", "#6EE7F9"] },
          opacity: {
            value: { min: 0.1, max: 0.45 },
            animation: { enable: true, speed: 0.4, sync: false },
          },
          size: {
            value: { min: 1, max: 4 },
            animation: { enable: true, speed: 1.5, sync: false },
          },
          move: {
            enable: true,
            speed: { min: 0.3, max: 0.8 },
            direction: "top",
            random: true,
            straight: false,
            outModes: { default: "out", top: "destroy", bottom: "none" },
          },
          shape: { type: "circle" },
        },
        detectRetina: true,
      }}
    />
  );
}
