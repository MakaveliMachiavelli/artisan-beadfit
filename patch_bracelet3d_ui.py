import re

with open('src/components/Bracelet3D.tsx', 'r') as f:
    content = f.read()

# 1. Update Scene Background and Lighting
scene_setup = """    // 1. SCENE & CAMERA
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f2f2f4'); // Light studio grey
    sceneRef.current = scene;
"""
content = re.sub(
    r"    // 1\. SCENE & CAMERA\n    const scene = new THREE\.Scene\(\);\n    // Luxurious twilight-colored background\n    // scene\.background = new THREE\.Color\('#0a0d14'\); // Removed to let Background3D shine through\n    sceneRef\.current = scene;",
    scene_setup,
    content
)

lighting_setup = """    // 4. RICH LIGHTING DESIGN
    // Soft studio illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight2.position.set(-5, 5, -7);
    scene.add(dirLight2);
"""
content = re.sub(
    r"    // 4\. RICH LIGHTING DESIGN\n    // Soft global illumination\n    const ambientLight = new THREE\.AmbientLight\(0xffffff, 0\.6\);\n    scene\.add\(ambientLight\);\n\n    const directionalLight = new THREE\.DirectionalLight\(0xfff5e6, 1\.5\);\n    directionalLight\.position\.set\(5, 10, 7\);\n    scene\.add\(directionalLight\);\n\n    const fillLight = new THREE\.DirectionalLight\(0xa6b8c7, 0\.8\);\n    fillLight\.position\.set\(-5, 3, -5\);\n    scene\.add\(fillLight\);",
    lighting_setup,
    content
)

with open('src/components/Bracelet3D.tsx', 'w') as f:
    f.write(content)
