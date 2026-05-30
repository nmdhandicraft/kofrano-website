// KOFRANO 3D Travel Experience — WebGL Engine (Three.js & GSAP)
let heroScene, heroCamera, heroRenderer, heroModel;
let configScene, configCamera, configRenderer, configModel, configControls;
let techScene, techCamera, techRenderer, techModel;

// Color maps with premium material properties
const colorsMap = {
    black: { hex: 0x0f0f0f, metalness: 0.15, roughness: 0.45, name: "Matte Black" },
    silver: { hex: 0xc4c4c4, metalness: 0.9, roughness: 0.15, name: "Titanium Silver" },
    navy: { hex: 0x172230, metalness: 0.2, roughness: 0.4, name: "Deep Navy" },
    champagne: { hex: 0xd7b98d, metalness: 0.6, roughness: 0.25, name: "Champagne Gold" },
    banana: { hex: 0xeac250, metalness: 0.25, roughness: 0.35, name: "Banana Gold" }
};

let activeColor = "black";

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    initHeroScene();
    initConfigScene();
    initTechScene();
    
    // Add window resize listener
    window.addEventListener("resize", onWindowResize);
    
    // Listen for color swatch clicks
    document.querySelectorAll(".swatch-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const swatch = e.currentTarget;
            document.querySelectorAll(".swatch-btn").forEach(b => b.classList.remove("active"));
            swatch.classList.add("active");
            activeColor = swatch.getAttribute("data-color");
            updateModelColor(activeColor);
        });
    });
});

/* =========================================================================
   1. HERO SCENE (floating, rotating cinematic hero suitcase)
   ========================================================================= */
function initHeroScene() {
    const container = document.getElementById("hero-canvas-container");
    if (!container) return;

    // Scene setup
    heroScene = new THREE.Scene();
    heroScene.fog = new THREE.FogExp2(0x030303, 0.04);

    // Camera
    heroCamera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    heroCamera.position.set(0, 2, 25);

    // Renderer
    heroRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    heroRenderer.setSize(container.clientWidth, container.clientHeight);
    heroRenderer.shadowMap.enabled = true;
    heroRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    heroRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    heroRenderer.toneMappingExposure = 1.2;
    container.appendChild(heroRenderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    heroScene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
    mainLight.position.set(5, 8, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.bias = -0.0001;
    heroScene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0xC6A26B, 1.8); // Gold rim light
    rimLight.position.set(-6, 3, -6);
    heroScene.add(rimLight);

    const softFillLight = new THREE.PointLight(0xffffff, 1.5, 15);
    softFillLight.position.set(2, -2, 3);
    heroScene.add(softFillLight);

    // Particle Background
    createParticles(heroScene);

    // Load Model
    const loader = new THREE.GLTFLoader();
    loader.load("assets/models/NMD-305.glb", 
        (gltf) => {
            heroModel = gltf.scene;
            console.log(heroModel);
            
                    
            // Adjust position and rotation
            heroModel.position.set(0, 0, 0);

heroModel.rotation.set(0,0,0);

heroModel.scale.set(1,1,1);
            // Center model
const box = new THREE.Box3().setFromObject(heroModel);
const center = box.getCenter(new THREE.Vector3());
heroModel.position.sub(center);
            // Shadow mapping and material tuning
            heroModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    // Apply premium properties
                    if (child.material) {
                        child.material.envMapIntensity = 1.5;
                        if (child.material.name.toLowerCase().includes("orange") || child.name.toLowerCase().includes("orange")) {
                            child.material.color.setHex(0xC6A26B); // Soft gold details
                            child.material.roughness = 0.3;
                        }
                    }
                }
            });

            heroScene.add(heroModel);
            
            // Enter animation using GSAP
            gsap.from(heroModel.position, {
                y: -1.5,
                duration: 2.5,
                ease: "power3.out"
            });
            gsap.from(heroModel.rotation, {
                y: -Math.PI * 1.5,
                duration: 3,
                ease: "power2.out"
            });
            gsap.to(".hero-title", { opacity: 1, y: 0, duration: 1.5, delay: 0.5, ease: "power3.out" });
            gsap.to(".hero-subtitle", { opacity: 1, y: 0, duration: 1.5, delay: 0.8, ease: "power3.out" });
            gsap.to("#hero .btn-primary", { opacity: 1, y: 0, duration: 1.5, delay: 1.1, ease: "power3.out" });
        },
        undefined,
        (error) => console.error("Error loading Hero model:", error)
    );

    // Mouse interactive movement
    let mouseX = 0;
    let mouseY = 0;
    window.addEventListener("mousemove", (e) => {
        mouseX = (e.clientX / window.innerWidth) - 0.5;
        mouseY = (e.clientY / window.innerHeight) - 0.5;
    });

    // Animation Loop
    let clock = new THREE.Clock();
    function animateHero() {
        requestAnimationFrame(animateHero);
        
        const elapsedTime = clock.getElapsedTime();
        
        if (heroModel) {
            // Gentle floating
            heroModel.position.y = 0.2 + Math.sin(elapsedTime * 0.8) * 0.12;
            
            // Continuous rotation
            heroModel.rotation.y += 0.003;
            
            // Mouse interactive parallax
            heroCamera.position.x += (mouseX * 1.5 - heroCamera.position.x) * 0.05;
            heroCamera.position.y += (-mouseY * 1.5 - heroCamera.position.y) * 0.05;
            heroCamera.lookAt(new THREE.Vector3(0, 0, 0));
        }
        
        // Rotate particles
        heroScene.traverse((child) => {
            if (child.isPoints) {
                child.rotation.y = elapsedTime * 0.02;
                child.rotation.x = elapsedTime * 0.01;
            }
        });

        heroRenderer.render(heroScene, heroCamera);
    }
    animateHero();
}

function createParticles(scene) {
    const particleCount = 120;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 12;
        positions[i+1] = (Math.random() - 0.5) * 8;
        positions[i+2] = (Math.random() - 0.5) * 10;
    }
    
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    
    // Tiny circular glowing textures
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, "rgba(255, 255, 255, 1)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
        size: 0.06,
        map: texture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.6,
        color: 0xC6A26B // Warm gold tint
    });
    
    const points = new THREE.Points(geometry, material);
    scene.add(points);
}


/* =========================================================================
   2. CONFIGURATOR SCENE (interactive swatches, size changes, full zoom)
   ========================================================================= */
function initConfigScene() {
    const container = document.getElementById("config-canvas-container");
    if (!container) return;

    // Scene
    configScene = new THREE.Scene();

    // Camera
    configCamera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
    configCamera.position.set(0, 0, 5.5);

    // Renderer
    configRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    configRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    configRenderer.setSize(container.clientWidth, container.clientHeight);
    configRenderer.shadowMap.enabled = true;
    configRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    configRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    configRenderer.toneMappingExposure = 1.3;
    container.appendChild(configRenderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    configScene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(8, 10, 8);
    keyLight.castShadow = true;
    keyLight.shadow.bias = -0.0001;
    configScene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 1.2);
    fillLight.position.set(-8, 5, 5);
    configScene.add(fillLight);

    const topSoft = new THREE.DirectionalLight(0xffffff, 1.0);
    topSoft.position.set(0, 10, -5);
    configScene.add(topSoft);

    // Floor Reflection & Shadow Plane
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.2 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.2;
    floor.receiveShadow = true;
    configScene.add(floor);

    // Orbit Controls
    configControls = new THREE.OrbitControls(configCamera, configRenderer.domElement);
    configControls.enableDamping = true;
    configControls.dampingFactor = 0.05;
    configControls.minDistance = 3.5;
    configControls.maxDistance = 8;
    configControls.maxPolarAngle = Math.PI / 2 + 0.1; // Don't go below floor
    configControls.enablePan = false;

    // Load Model
    const loader = new THREE.GLTFLoader();
    loader.load("assets/models/NMD-305.glb", 
        (gltf) => {
            configModel = gltf.scene;
            
            // Center model
            const box = new THREE.Box3().setFromObject(configModel);
            const center = box.getCenter(new THREE.Vector3());
            configModel.position.sub(center);
            configModel.position.y = -0.2; // Align to floor
            configModel.scale.set(1.4, 1.4, 1.4);

            configModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    if (child.material) {
                        child.material.envMapIntensity = 1.8;
                    }
                }
            });

            configScene.add(configModel);
            updateModelColor(activeColor); // Initial color setup
        },
        undefined,
        (error) => console.error("Error loading Config model:", error)
    );

    // Size Switcher Interactions
    document.querySelectorAll(".size-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const sizeBtn = e.currentTarget;
            document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
            sizeBtn.classList.add("active");
            
            const size = sizeBtn.getAttribute("data-size");
            const price = sizeBtn.getAttribute("data-price");
            const strike = sizeBtn.getAttribute("data-strike");
            
            // Update UI prices
            document.getElementById("current-price").textContent = "€" + price;
            document.getElementById("strike-price").textContent = "€" + strike;
            
            // Scale model dynamically in Three.js
            if (configModel) {
                let targetScale = 1.4;
                let targetY = -0.2;
                if (size === "checkin") {
                    targetScale = 1.65;
                    targetY = -0.3;
                } else if (size === "trunk") {
                    targetScale = 1.9;
                    targetY = -0.4;
                }
                
                gsap.to(configModel.scale, {
                    x: targetScale,
                    y: targetScale,
                    z: targetScale,
                    duration: 0.8,
                    ease: "back.out(1.2)"
                });
                gsap.to(configModel.position, {
                    y: targetY,
                    duration: 0.8,
                    ease: "power2.out"
                });
            }
        });
    });

    // Animation Loop
    function animateConfig() {
        requestAnimationFrame(animateConfig);
        configControls.update();
        configRenderer.render(configScene, configCamera);
    }
    animateConfig();
}

// Traverse and paint the shell material based on color definitions
function updateModelColor(colorName) {
    if (!configModel) return;
    
    const props = colorsMap[colorName];
    
    configModel.traverse((child) => {
        if (child.isMesh && child.material) {
            const matName = child.material.name.toLowerCase();
            const meshName = child.name.toLowerCase();
            
            // We want to color only the main body outer shell.
            // Typically, handles, locks, wheels, and frame accents should remain black/metallic/gold.
            // Let's exclude components containing wheel, tire, axle, handle, lock, bolt, zipper, logo, rubber.
            const isAccessory = meshName.includes("wheel") || matName.includes("wheel") ||
                               meshName.includes("tire") || matName.includes("tire") ||
                               meshName.includes("handle") || matName.includes("handle") ||
                               meshName.includes("lock") || matName.includes("lock") ||
                               meshName.includes("zipper") || matName.includes("zipper") ||
                               meshName.includes("logo") || meshName.includes("rubber") || 
                               matName.includes("metal") || matName.includes("aluminum");
            
            if (!isAccessory && (matName.includes("body") || matName.includes("shell") || matName.includes("case") || matName.includes("plastic") || matName.includes("material") || matName.includes("polycarbonate") || child.material.color.r < 0.2)) {
                // Clone material to avoid cross-model pollution
                if (!child.material._originalCloned) {
                    child.material = child.material.clone();
                    child.material._originalCloned = true;
                }
                
                // Animate color transition using GSAP
                const colorTarget = new THREE.Color(props.hex);
                gsap.to(child.material.color, {
                    r: colorTarget.r,
                    g: colorTarget.g,
                    b: colorTarget.b,
                    duration: 0.6,
                    ease: "power1.out"
                });
                
                // Tune properties to simulate material (matte vs. chrome metal etc.)
                gsap.to(child.material, {
                    metalness: props.metalness,
                    roughness: props.roughness,
                    duration: 0.6
                });
            }
        }
    });
}


/* =========================================================================
   3. TECHNOLOGY SCENE (GSAP ScrollTrigger mathematical exploded view)
   ========================================================================= */
function initTechScene() {
    const container = document.getElementById("tech-canvas-container");
    if (!container) return;

    // Scene
    techScene = new THREE.Scene();

    // Camera
    techCamera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
    techCamera.position.set(0, 0, 5.0);

    // Renderer
    techRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    techRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    techRenderer.setSize(container.clientWidth, container.clientHeight);
    techRenderer.shadowMap.enabled = true;
    techRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(techRenderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    techScene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 2.5);
    key.position.set(5, 5, 8);
    techScene.add(key);

    const fill = new THREE.DirectionalLight(0xC6A26B, 1.5); // Champagne glow
    fill.position.set(-6, -2, -5);
    techScene.add(fill);

    // Store references to separate components for explosion
    const originalPositions = new Map();
    const wheels = [];
    let shellFront = null;
    let shellBack = null;

    // Load Model
    const loader = new THREE.GLTFLoader();
    loader.load("assets/models/NMD-305.glb", 
        (gltf) => {
            techModel = gltf.scene;
            
            // Center model
            const box = new THREE.Box3().setFromObject(techModel);
            const center = box.getCenter(new THREE.Vector3());
            techModel.position.sub(center);
            techModel.scale.set(1.4, 1.4, 1.4);
            
            // Paint body to active color, apply gold to handles
            techModel.traverse((child) => {
                if (child.isMesh) {
                    if (child.material) {
                        child.material = child.material.clone();
                        // Color body shell matte black/gold
                        if (child.name.toLowerCase().includes("orange") || child.material.name.toLowerCase().includes("orange")) {
                            child.material.color.setHex(0xC6A26B); // Brand Gold
                        } else if (child.name.toLowerCase().includes("body") || child.name.toLowerCase().includes("shell")) {
                            child.material.color.setHex(0x0f0f0f); // Matte black body
                            child.material.roughness = 0.45;
                        }
                    }

                    // Save local coordinates relative to the model group
                    originalPositions.set(child, child.position.clone());

                    // Sort parts for GSAP exploded view
                    const name = child.name.toLowerCase();
                    if (name.includes("wheel") || name.includes("caster")) {
                        wheels.push(child);
                    }
                }
            });

            techScene.add(techModel);
            setupScrollAnimations(techModel, originalPositions, wheels);
        },
        undefined,
        (error) => console.error("Error loading Tech model:", error)
    );

    // Animation Loop
    function animateTech() {
        requestAnimationFrame(animateTech);
        techRenderer.render(techScene, techCamera);
    }
    animateTech();
}

function setupScrollAnimations(model, originalPositions, wheels) {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    
    // Register scroll trigger
    gsap.registerPlugin(ScrollTrigger);

    // Create a master scroll timeline for the suitcase animation
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "#technology",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
            pin: ".tech-sticky-viewer"
        }
    });

    // 1. Initial entering & rotating
    tl.to(model.rotation, {
        y: Math.PI * 1.5,
        x: 0.1,
        ease: "none"
    });

    // 2. Exploded view animation: shift meshes outwards from center
    // Let's explode the parts as we scroll over the shell tech card
    const meshes = Array.from(originalPositions.keys());
    
    // Calculate the bounding box and model center to find direction vectors
    const modelBox = new THREE.Box3().setFromObject(model);
    const modelCenter = modelBox.getCenter(new THREE.Vector3());

    meshes.forEach((mesh) => {
        // Calculate vector from center to local mesh position
        const meshWorldBox = new THREE.Box3().setFromObject(mesh);
        const meshCenter = meshWorldBox.getCenter(new THREE.Vector3());
        
        // Direction vector from model center to mesh center
        const direction = new THREE.Vector3().subVectors(meshCenter, modelCenter);
        direction.y = 0; // Don't shift vertically too much, just horizontally
        direction.normalize();
        
        // Check if it is a main body part
        const name = mesh.name.toLowerCase();
        let scaleFactor = 0.8;
        if (name.includes("front") || name.includes("door")) {
            direction.z = 1.0; // Push front shell directly forward
            direction.x = 0;
            scaleFactor = 1.4;
        } else if (name.includes("back") || name.includes("rear")) {
            direction.z = -1.0; // Push back shell directly backward
            direction.x = 0;
            scaleFactor = 1.4;
        } else if (name.includes("wheel")) {
            direction.set(0, -1.0, 0); // Pull wheels downwards
            scaleFactor = 0.5;
        }
        
        const origPos = originalPositions.get(mesh);
        const targetX = origPos.x + direction.x * scaleFactor;
        const targetY = origPos.y + direction.y * scaleFactor;
        const targetZ = origPos.z + direction.z * scaleFactor;

        // Add to timeline
        tl.to(mesh.position, {
            x: targetX,
            y: targetY,
            z: targetZ,
            ease: "power1.inOut"
        }, "<"); // Run concurrently
    });

    // 3. Spin wheels as we scroll near the motion system card
    wheels.forEach(wheel => {
        tl.to(wheel.rotation, {
            x: Math.PI * 16, // Fast spins
            ease: "none"
        }, "<");
    });

    // Bring everything back to normal state as it exits
    tl.to(model.rotation, {
        y: Math.PI * 2.5,
        x: 0,
        ease: "none"
    });

    meshes.forEach((mesh) => {
        const origPos = originalPositions.get(mesh);
        tl.to(mesh.position, {
            x: origPos.x,
            y: origPos.y,
            z: origPos.z,
            ease: "power1.inOut"
        }, "<");
    });
}


/* =========================================================================
   4. UTILS & HELPERS
   ========================================================================= */
function onWindowResize() {
    // Hero Scene Resize
    const heroContainer = document.getElementById("hero-canvas-container");
    if (heroContainer && heroCamera && heroRenderer) {
        heroCamera.aspect = heroContainer.clientWidth / heroContainer.clientHeight;
        heroCamera.updateProjectionMatrix();
        heroRenderer.setSize(heroContainer.clientWidth, heroContainer.clientHeight);
    }

    // Config Scene Resize
    const configContainer = document.getElementById("config-canvas-container");
    if (configContainer && configCamera && configRenderer) {
        configCamera.aspect = configContainer.clientWidth / configContainer.clientHeight;
        configCamera.updateProjectionMatrix();
        configRenderer.setSize(configContainer.clientWidth, configContainer.clientHeight);
    }

    // Tech Scene Resize
    const techContainer = document.getElementById("tech-canvas-container");
    if (techContainer && techCamera && techRenderer) {
        techCamera.aspect = techContainer.clientWidth / techContainer.clientHeight;
        techCamera.updateProjectionMatrix();
        techRenderer.setSize(techContainer.clientWidth, techContainer.clientHeight);
    }
}
