 // 初始化場景、相機和渲染器
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 創建地板
const floorGeometry = new THREE.PlaneGeometry(20, 20);
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = Math.PI / 2;
scene.add(floor);

// 創建牆壁函數
function createWall(x, y, z) {
    const wallGeometry = new THREE.BoxGeometry(1, 2, 1);
    const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x8b4513 });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(x, y, z);
    scene.add(wall);
}

// 添加一些牆壁
createWall(-5, 1, 0);
createWall(5, 1, 0);
createWall(0, 1, -5);
createWall(0, 1, 5);

// 設置相機位置和旋轉
camera.position.y = 1;
camera.position.z = 5;
camera.rotation.order = 'YXZ';

// 創建子彈函數
function createBullet() {
    const bulletGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
    bullet.position.set(camera.position.x, camera.position.y, camera.position.z);
    bullet.velocity = new THREE.Vector3(
        -Math.sin(camera.rotation.y) * Math.cos(camera.rotation.x),
        Math.sin(camera.rotation.x),
        -Math.cos(camera.rotation.y) * Math.cos(camera.rotation.x)
    ).normalize().multiplyScalar(0.5); // 設置子彈速度
    bullet.distanceTraveled = 0;
    scene.add(bullet);
    return bullet;
}

// 創建爆炸效果函數
function createExplosion(position) {
    const particleCount = 20;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];

    for (let i = 0; i < particleCount; i++) {
        positions.push((Math.random() - 0.5) * 0.5);
        positions.push((Math.random() - 0.5) * 0.5);
        positions.push((Math.random() - 0.5) * 0.5);
        colors.push(1, 0.5, 0);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({ size: 0.05, vertexColors: true });
    const particles = new THREE.Points(geometry, material);
    particles.position.copy(position);
    scene.add(particles);

    setTimeout(() => {
        scene.remove(particles);
    }, 1000);
}

let bullets = [];

// 處理鍵盤輸入
const keys = {};
document.addEventListener('keydown', (event) => keys[event.code] = true);
document.addEventListener('keyup', (event) => keys[event.code] = false);

function handleInput() {
    const moveSpeed = 0.1;
    const rotateSpeed = 0.02;

    if (keys['ArrowUp']) {
        camera.position.x -= Math.sin(camera.rotation.y) * moveSpeed;
        camera.position.z -= Math.cos(camera.rotation.y) * moveSpeed;
    }
    if (keys['ArrowDown']) {
        camera.position.x += Math.sin(camera.rotation.y) * moveSpeed;
        camera.position.z += Math.cos(camera.rotation.y) * moveSpeed;
    }
    if (keys['ArrowLeft']) {
        camera.rotation.y += rotateSpeed;
    }
    if (keys['ArrowRight']) {
        camera.rotation.y -= rotateSpeed;
    }
    if (keys['Space']) {
        bullets.push(createBullet());
        keys['Space'] = false; // 防止連續發射
    }
}

// 遊戲循環
function animate() {
    requestAnimationFrame(animate);
    
    handleInput(); // 確保在每一幀都處理輸入
    
    // 更新子彈位置
    bullets.forEach((bullet, index) => {
        bullet.position.add(bullet.velocity);
        bullet.distanceTraveled += bullet.velocity.length();
        
        if (bullet.distanceTraveled > 10) { // 子彈飛行20個單位後爆炸
            createExplosion(bullet.position);
            scene.remove(bullet);
            bullets.splice(index, 1);
        }
    });
    
    renderer.render(scene, camera);
}

animate();

// 處理視窗大小變化
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}