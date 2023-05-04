import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { Canvas } from "@react-three/fiber";
import { useState, useRef, Suspense, useLayoutEffect } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { TextureLoader } from "expo-three";
import { useAnimatedSensor, SensorType } from "react-native-reanimated";

// import { Canvas, useFrame } from "@react-three/fiber";
// import {
//   useGLTF,
//   Stage,
//   Grid,
//   OrbitControls,
//   Environment,
// } from "@react-three/drei";
// import { EffectComposer, Bloom } from "@react-three/postprocessing";
// import { easing } from "maath";

export default function App() {
  function DemoBox(props) {
    // This reference will give us direct access to the mesh
    const mesh = useRef();
    // Set up state for the hovered and active state
    const [hovered, setHover] = useState(false);
    const [active, setActive] = useState(false);
    // Subscribe this component to the render-loop, rotate the mesh every frame
    useFrame((state, delta) => (mesh.current.rotation.x += delta));
    // Return view, these are regular three.js elements expressed in JSX
    return (
      <mesh
        {...props}
        ref={mesh}
        scale={active ? 1.5 : 1}
        onClick={(event) => setActive(!active)}
        onPointerOver={(event) => setHover(true)}
        onPointerOut={(event) => setHover(false)}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
      </mesh>
    );
  }
  function Box(props) {
    const [active, setActive] = useState(false);
    const mesh = useRef();
    useFrame((state, delta) => {
      if (active) {
        mesh.current.rotation.y += delta;
        mesh.current.rotation.x += delta;
      }
    });

    return (
      <mesh
        {...props}
        ref={mesh}
        scale={active ? 1.5 : 1}
        onClick={(event) => setActive(!active)}
      >
        <boxGeometry />
        <meshStandardMaterial color={active ? "hotpink" : "orange"} />
      </mesh>
    );
  }
  function Shoe(props) {
    const [base, normal, rough] = useLoader(TextureLoader, [
      require("./assets/Airmax/textures/BaseColor.jpg"),
      require("./assets/Airmax/textures/Normal.jpg"),
      require("./assets/Airmax/textures/Roughness.png"),
    ]);
    const material = useLoader(MTLLoader, require("./assets/Airmax/shoe.mtl"));
    const obj = useLoader(
      OBJLoader,
      require("./assets/Airmax/shoe.obj"),
      (loader) => {
        material.preload();
        loader.setMaterials(material);
      }
    );

    const mesh = useRef();

    useLayoutEffect(() => {
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material.map = base;
          child.material.normalMap = normal;
          child.material.roughnessMap = rough;
        }
      });
    }, [obj]);

    useFrame((state, delta) => {
      let { x, y, z } = props.animatedSensor.sensor.value;
      x = ~~(x * 100) / 5000;
      y = ~~(y * 100) / 5000;
      mesh.current.rotation.x += x;
      mesh.current.rotation.y += y;
    });
    return (
      <mesh ref={mesh} rotation={[0.7, 0, 0]}>
        <primitive object={obj} scale={15} />
      </mesh>
    );
  }
  const animatedSensor = useAnimatedSensor(SensorType.GYROSCOPE, {
    interval: 100,
  });
  return (
    <Canvas>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      {/* <Box /> */}
      <Suspense fallback={null}>
        <Shoe animatedSensor={animatedSensor} />
      </Suspense>
      {/* <DemoBox /> */}
    </Canvas>
  );
}

// export default function App() {
//   return (
//     <Canvas
//       gl={{ logarithmicDepthBuffer: true }}
//       shadows
//       camera={{ position: [-15, 0, 10], fov: 25 }}
//     >
//       <fog attach="fog" args={["black", 15, 21.5]} />
//       <Stage
//         intensity={0.5}
//         environment="city"
//         shadows={{ type: "accumulative", bias: -0.001 }}
//         adjustCamera={false}
//       >
//         {/* <Kamdo rotation={[0, Math.PI, 0]} /> */}
//       </Stage>
//       <Grid
//         renderOrder={-1}
//         position={[0, -1.85, 0]}
//         infiniteGrid
//         cellSize={0.6}
//         cellThickness={0.6}
//         sectionSize={3.3}
//         sectionThickness={1.5}
//         sectionColor={[0.5, 0.5, 10]}
//         fadeDistance={30}
//       />
//       <OrbitControls
//         autoRotate
//         autoRotateSpeed={0.05}
//         enableZoom={false}
//         makeDefault
//         minPolarAngle={Math.PI / 2}
//         maxPolarAngle={Math.PI / 2}
//       />
//       <EffectComposer disableNormalPass>
//         <Bloom luminanceThreshold={1} mipmapBlur />
//       </EffectComposer>
//       <Environment background preset="sunset" blur={0.8} />
//     </Canvas>
//   );
// }

// function Kamdo(props) {
//   const head = useRef();
//   const stripe = useRef();
//   const light = useRef();
//   const { nodes, materials } = useGLTF(
//     "/s2wt_kamdo_industrial_divinities-transformed.glb"
//   );
//   useFrame((state, delta) => {
//     const t = (1 + Math.sin(state.clock.elapsedTime * 2)) / 2;
//     stripe.current.color.setRGB(1 + t * 10, 2, 20 + t * 50);
//     easing.dampE(
//       head.current.rotation,
//       [0, state.pointer.x * (state.camera.position.z > 1 ? 1 : -1), 0],
//       0.4,
//       delta
//     );
//     light.current.intensity = 1 + t * 2;
//   });
//   return (
//     <group {...props}>
//       <mesh
//         castShadow
//         receiveShadow
//         geometry={nodes.body001.geometry}
//         material={materials.Body}
//       />
//       <group ref={head}>
//         <mesh
//           castShadow
//           receiveShadow
//           geometry={nodes.head001.geometry}
//           material={materials.Head}
//         />
//         <mesh castShadow receiveShadow geometry={nodes.stripe001.geometry}>
//           <meshBasicMaterial ref={stripe} toneMapped={false} />
//           <pointLight
//             ref={light}
//             intensity={1}
//             color={[10, 2, 5]}
//             distance={2.5}
//           />
//         </mesh>
//       </group>
//     </group>
//   );
// }

// useGLTF.preload(
//   "../public/assets/s2wt_kamdo_industrial_divinities-transformed.glb"
// );

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
