"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

/**
 * ROV Hull 3D model — corrected to match actual build photos + FreeCAD spec.
 *
 * Coordinate mapping (1 unit = 100 mm):
 *   FreeCAD Z (hull length, 0=rear 250=front) → model X (–1.25 to +1.25)
 *   FreeCAD X (transverse)                    → model Z
 *   FreeCAD Y (vertical, Y+ = top)            → model Y
 *
 * Key features (FreeCAD coords → model coords):
 *   End caps      : Z=0 (X=–1.25) rear, Z=250 (X=+1.25) front — transparent PP
 *   O-rings       : X≈±1.15 — black rubber seal
 *   Obs dome      : Z=170 → X=+0.36, Y+ — white epoxy ring + clear PS hemisphere
 *   Cable chimney : Z=90  → X=–0.28, Y+
 *   Vert motor    : Z=125 → X=0, Y– — single vertical thruster
 *   Horiz arms    : Z=144–194 center Z=169 → X=+0.352, each ±Z=0.655
 *   Motors        : shaft along X (hull axis), embedded from arm's rear face (X=+0.152),
 *                   exposed portion X=–0.088 to X=+0.152, propeller at X≈–0.09
 *   Tail fins     : Z=19–69 → X=–0.648, ±Z sides
 */
function ROVHull() {
  const GREY   = "#7A8C9E";   // painted PETG (matte gray)
  const GREY_D = "#5C6E80";   // darker mount parts
  const BLACK  = "#1C1C1C";   // motors / O-rings
  const EPOXY  = "#C8CDD2";   // white epoxy / PP clips

  return (
    <group>

      {/* ── Main hull cylinder ── */}
      {/* OD=90mm → r=0.45, L=250mm, along X axis */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.45, 0.45, 2.50, 64]} />
        <meshStandardMaterial color={GREY} roughness={0.75} metalness={0.0} />
      </mesh>

      {/* ── Rear O-ring (X≈–1.15) ── */}
      <mesh position={[-1.15, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.452, 0.024, 8, 48]} />
        <meshStandardMaterial color={BLACK} roughness={0.85} metalness={0.0} />
      </mesh>

      {/* ── Rear PP end cap — flat disc (PP 現成品，平蓋) ── */}
      <mesh position={[-1.265, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.45, 0.45, 0.03, 32]} />
        <meshStandardMaterial color="#C8D4DE" roughness={0.28} metalness={0.04} />
      </mesh>

      {/* ── Front O-ring (X≈+1.15) ── */}
      <mesh position={[1.15, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.452, 0.024, 8, 48]} />
        <meshStandardMaterial color={BLACK} roughness={0.85} metalness={0.0} />
      </mesh>

      {/* ── Front PP end cap — flat disc ── */}
      <mesh position={[1.265, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.45, 0.45, 0.03, 32]} />
        <meshStandardMaterial color="#C8D4DE" roughness={0.28} metalness={0.04} />
      </mesh>

      {/* ── PP clip tabs (×4 per end, approximate) ── */}
      {[-1.25, 1.25].map((x) =>
        [0.45, -0.45].map((z) => (
          <mesh key={`clip-${x}-${z}`} position={[x * 0.96, 0, z * 0.97]}>
            <boxGeometry args={[0.04, 0.10, 0.06]} />
            <meshStandardMaterial color={EPOXY} roughness={0.3} metalness={0.05} />
          </mesh>
        ))
      )}

      {/* ── PS observation dome — Z=170 → model X=+0.36, Y+ ── */}
      {/* White epoxy mounting ring */}
      <mesh position={[0.36, 0.455, 0]}>
        <cylinderGeometry args={[0.178, 0.178, 0.04, 32]} />
        <meshStandardMaterial color={EPOXY} roughness={0.55} metalness={0.0} />
      </mesh>
      {/* Clear PS hemisphere (dome curves outward from hull) */}
      <mesh position={[0.36, 0.47, 0]}>
        <sphereGeometry args={[0.165, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#C8E8F8" transparent opacity={0.40}
          roughness={0.02} metalness={0.08}
        />
      </mesh>

      {/* ── Cable chimney — Z=90 → model X=–0.28, Y+ ── */}
      {/* OD=20mm → r=0.10, height 8mm=0.08 */}
      <mesh position={[-0.28, 0.50, 0]}>
        <cylinderGeometry args={[0.10, 0.08, 0.09, 16]} />
        <meshStandardMaterial color={GREY} roughness={0.65} metalness={0.0} />
      </mesh>

      {/* ── Vertical motor assembly — Z=125 → model X=0, Y– ── */}
      {/* Housing: OD=38mm → r=0.19, height 33mm=0.33 */}
      <mesh position={[0, -0.62, 0]}>
        <cylinderGeometry args={[0.19, 0.19, 0.33, 24]} />
        <meshStandardMaterial color={GREY_D} roughness={0.65} metalness={0.0} />
      </mesh>
      {/* Motor body (exposed black cylinder below housing) */}
      <mesh position={[0, -0.85, 0]}>
        <cylinderGeometry args={[0.155, 0.155, 0.26, 24]} />
        <meshStandardMaterial color={BLACK} roughness={0.45} metalness={0.55} />
      </mesh>
      {/* Vertical propeller (3-blade, pointing down) */}
      <mesh position={[0, -0.99, 0]}>
        <cylinderGeometry args={[0.21, 0.02, 0.025, 3]} />
        <meshStandardMaterial color={BLACK} roughness={0.4} metalness={0.3} />
      </mesh>

      {/* ── Right horizontal motor arm (+Z) ── */}
      {/* Arm box: 40(X)×38(Y)×41(Z) mm, center X=0.352, Z=0.655 */}
      <mesh position={[0.352, 0, 0.655]}>
        <boxGeometry args={[0.40, 0.38, 0.41]} />
        <meshStandardMaterial color={GREY} roughness={0.75} metalness={0.0} />
      </mesh>
      {/* Right motor body (shaft along X hull axis, at arm outer tip Z=0.86)
          Embedded: X=0.152→0.392 inside arm  |  Exposed: X=–0.088→0.152 behind arm */}
      <mesh position={[0.152, 0, 0.86]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.155, 0.155, 0.48, 24]} />
        <meshStandardMaterial color={BLACK} roughness={0.45} metalness={0.55} />
      </mesh>
      {/* Right propeller (at rear face of motor, X≈–0.088, facing –X = generates forward thrust) */}
      <mesh position={[-0.09, 0, 0.86]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.21, 0.02, 0.025, 3]} />
        <meshStandardMaterial color={BLACK} roughness={0.4} metalness={0.3} />
      </mesh>

      {/* ── Left horizontal motor arm (–Z) ── */}
      <mesh position={[0.352, 0, -0.655]}>
        <boxGeometry args={[0.40, 0.38, 0.41]} />
        <meshStandardMaterial color={GREY} roughness={0.75} metalness={0.0} />
      </mesh>
      <mesh position={[0.152, 0, -0.86]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.155, 0.155, 0.48, 24]} />
        <meshStandardMaterial color={BLACK} roughness={0.45} metalness={0.55} />
      </mesh>
      <mesh position={[-0.09, 0, -0.86]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.21, 0.02, 0.025, 3]} />
        <meshStandardMaterial color={BLACK} roughness={0.4} metalness={0.3} />
      </mesh>

      {/* ── Right tail fin (+Z) — Z=19–69 → X=–0.848 to –0.448, center X=–0.648 ── */}
      {/* Fin extends 30mm outward: from hull wall Z=0.45 to Z=0.75, center Z=0.60 */}
      <mesh position={[-0.648, 0, 0.60]}>
        <boxGeometry args={[0.40, 0.04, 0.30]} />
        <meshStandardMaterial color={GREY_D} roughness={0.70} metalness={0.0} />
      </mesh>

      {/* ── Left tail fin (–Z) ── */}
      <mesh position={[-0.648, 0, -0.60]}>
        <boxGeometry args={[0.40, 0.04, 0.30]} />
        <meshStandardMaterial color={GREY_D} roughness={0.70} metalness={0.0} />
      </mesh>

    </group>
  );
}

export function HullViewer() {
  return (
    <div className="w-full rounded-2xl overflow-hidden glass" style={{ height: 360 }}>
      <Canvas
        camera={{ position: [2.8, 1.2, 2.8], fov: 40 }}
        shadows
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#080C18"]} />

        {/* Ambient + key lights */}
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 6, 3]} intensity={1.0} castShadow />
        <directionalLight position={[-3, 2, -4]} intensity={0.4} />

        {/* Accent fills */}
        <pointLight position={[-3, -2, -3]} intensity={0.5} color="#A78BFA" />
        <pointLight position={[3, 2, -2]}  intensity={0.4} color="#22D3EE" />

        {/* Rim light to show transparent end caps */}
        <pointLight position={[0, 0, 4]}  intensity={0.6} color="#BFDBFE" />
        <pointLight position={[0, 0, -4]} intensity={0.6} color="#BFDBFE" />

        <Suspense fallback={null}>
          <ROVHull />
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={2.5}
          maxDistance={9}
          autoRotate
          autoRotateSpeed={0.8}
        />
      </Canvas>
    </div>
  );
}
