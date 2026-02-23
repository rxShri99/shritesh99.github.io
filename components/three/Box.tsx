'use client';

/**
 * Box component - A simple 3D box mesh
 * Demonstrates a reusable scene object component
 */
export default function Box() {
  return (
    <mesh rotation={[45, 45, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#0066ff" wireframe={false} />
    </mesh>
  );
}
