import re

with open('src/components/Bracelet3D.tsx', 'r') as f:
    content = f.read()

# 1. Capture prev positions before clearing
old_clear = '''    // Clear old meshes
    while (beadsGroup.children.length > 0) {
      const obj = beadsGroup.children[0];
      beadsGroup.remove(obj);
    }'''

new_clear = '''    const prevPositions = new Map();
    beadsGroup.children.forEach(child => {
      if (child.userData.id) prevPositions.set(child.userData.id, child.position.clone());
    });

    // Clear old meshes
    while (beadsGroup.children.length > 0) {
      const obj = beadsGroup.children[0];
      beadsGroup.remove(obj);
    }'''

content = content.replace(old_clear, new_clear)

# 2. Update the beadGroup creation
old_beadGroup = '''      // Group container to support selection indicators or scale hover
      const beadGroup = new THREE.Group();
      beadGroup.position.set(x, y, z);
      mesh.position.set(0, 0, 0); // local center
      beadGroup.add(mesh);'''

new_beadGroup = '''      // Group container to support selection indicators or scale hover
      const beadGroup = new THREE.Group();
      
      const prevPos = prevPositions.get(b.id);
      if (prevPos) {
          beadGroup.position.copy(prevPos);
      } else {
          // Magnetic Kinetic fly-in from above
          beadGroup.position.set(x, y + 8, z); 
      }
      
      mesh.position.set(0, 0, 0); // local center
      beadGroup.add(mesh);'''

content = content.replace(old_beadGroup, new_beadGroup)

# 3. Update the userData
old_userData = '''      beadGroup.userData = { beadIndex: idx, name: b.name };
      beadsGroup.add(beadGroup);
    });'''

new_userData = '''      let targetX = x;
      let targetZ = z;
      if (isExploded) {
          // Cinematic Exploded View - pull beads outward along their radial vectors
          targetX = (baseRadius + 2.0) * Math.cos(angle);
          targetZ = (baseRadius + 2.0) * Math.sin(angle);
      }
      
      beadGroup.userData = { 
          id: b.id, 
          beadIndex: idx, 
          name: b.name, 
          targetPos: new THREE.Vector3(targetX, y, targetZ) 
      };
      beadsGroup.add(beadGroup);
    });'''

content = content.replace(old_userData, new_userData)

# 4. Add lerp in animate loop
old_animate = '''      // Smooth slow studio auto-rotation
      if (autoRotate && beadsGroupRef.current) {
        beadsGroupRef.current.rotation.y += 0.003;
      }

      renderer.render(scene, camera);'''

new_animate = '''      // Smooth slow studio auto-rotation
      if (autoRotate && beadsGroupRef.current) {
        beadsGroupRef.current.rotation.y += 0.003;
      }
      
      // Magnetic Kinetic Lerping
      if (beadsGroupRef.current) {
          beadsGroupRef.current.children.forEach(child => {
             if (child.userData.targetPos) {
                 child.position.lerp(child.userData.targetPos, 0.08); // Butter smooth spring
             }
          });
      }

      renderer.render(scene, camera);'''

content = content.replace(old_animate, new_animate)

with open('src/components/Bracelet3D.tsx', 'w') as f:
    f.write(content)
