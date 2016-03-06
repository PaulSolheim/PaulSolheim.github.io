(function () {
    'use strict';
    // globale variabler
    var renderer;
    var scene;
    var camera;
    var cameraControl;

    function createRenderer() {
        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(0x000000, 1.0);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
    }

    function createCamera() {
        camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1, 1000);
        camera.position.x = 90;
        camera.position.y = 32;
        camera.position.z = 32;
        camera.lookAt(scene.position);

        cameraControl = new THREE.OrbitControls(camera);
    }

    function createLight() {
        var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(100, 10, -50);
        directionalLight.name = 'directional';
        scene.add(directionalLight);
        
        var ambientLight = new THREE.AmbientLight(0x111111);
        scene.add(ambientLight);
    }

    function createEarthMaterial() {


        var earthMaterial = new THREE.MeshPhongMaterial();
        earthMaterial.map = earthTexture;

        return earthMaterial;
    }

    function createEarth() {
        // create geometry
        var sphereGeometry = new THREE.SphereGeometry(15, 30, 30);
        
        // load textures
        var earthTexture = new THREE.Texture();
        var loader = new THREE.ImageLoader();
        loader.load('../images/earthmap2k.jpg', function (image) {
            earthTexture.image = image;
            earthTexture.needsUpdate = true;
        });
        
        var normalTexture = new THREE.Texture();
        var loader = new THREE.ImageLoader();
        loader.load('../images/earth_normalmap_flat2k.jpg', function (image) {
            normalTexture.image = image;
            normalTexture.needsUpdate = true;
        });
        
        var specularTexture = new THREE.Texture();
        var loader = new THREE.ImageLoader();
        loader.load('../images/earthspec2k.jpg', function (image) {
            specularTexture.image = image;
            specularTexture.needsUpdate = true;
        });
        
        // create materials
        var earthMaterial = new THREE.MeshPhongMaterial();
        earthMaterial.map = earthTexture;
        
        earthMaterial.normalMap = normalTexture;
        earthMaterial.normalScale = new THREE.Vector2(0.7, 0.7);
        
        earthMaterial.specularMap = specularTexture;
        earthMaterial.specular = new THREE.Color(0x262626);
        
        var earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
        earthMesh.name = 'earth';
        scene.add(earthMesh);
    }
    
    function createClouds() {
        var sphereGeometry = new THREE.SphereGeometry(15.1, 30, 30);
        
        var cloudsTexture = new THREE.Texture();
        var loader = new THREE.ImageLoader();
        loader.load('../images/fair_clouds_1k.png', function(image) {
            cloudsTexture.image = image;
            cloudsTexture.needsUpdate = true;
        });
        
        var cloudsMaterial = new THREE.MeshPhongMaterial();
        cloudsMaterial.map = cloudsTexture;
        cloudsMaterial.transparent = true;
        
        var cloudsMesh = new THREE.Mesh(sphereGeometry, cloudsMaterial);
        cloudsMesh.name = 'clouds';
        scene.add(cloudsMesh);
    }
    
    function createStarfield() {
        // Create the geometry sphere
        var envGeometry = new THREE.SphereGeometry(90, 32, 32);
        
        // create the material, using a texture of starfield
        var envTexture = new THREE.Texture();
        var loader = new THREE.ImageLoader();
        loader.load('../images/galaxy_starfield.png', function(image) {
            envTexture.image = image;
            envTexture.needsUpdate = true;
        });
        
        var envMaterial = new THREE.MeshBasicMaterial();
        envMaterial.map = envTexture;
        envMaterial.side = THREE.BackSide;
        
        var mesh = new THREE.Mesh(envGeometry, envMaterial);
        scene.add(mesh);
    }

    //init() gets executed once
    function init() {

        scene = new THREE.Scene();

        createRenderer();
        createCamera();
        createLight();

        createEarth();
        createClouds();
        createStarfield();

        document.body.appendChild(renderer.domElement);

        //render() gets called at the end of init
        //as it loops forever
        render();
    }

    function render() {

        cameraControl.update();
        
        scene.getObjectByName('earth').rotation.y += 0.0005;
        scene.getObjectByName('clouds').rotation.y += 0.0007;

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    init();

})();