document.addEventListener('DOMContentLoaded', () => {
    // Load cart from localStorage or initialize empty
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Add to Cart functionality with redirect to cart.html
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const name = button.getAttribute('data-name');
            const price = parseInt(button.getAttribute('data-price'));
            const item = { name, price, quantity: 1 };

            // Check if item already exists in cart
            const existingItem = cart.find(cartItem => cartItem.name === name);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push(item);
            }

            // Save to localStorage and redirect
            localStorage.setItem('cart', JSON.stringify(cart));
            window.location.href = './cart.html';
        });
    });

    // Snapshot generation from 3D models
    const productModels = document.querySelectorAll('.product-model'); // Updated class name

    productModels.forEach((container) => {
        const modelPath = container.getAttribute('data-model');

        // Set up the off-screen scene, camera, and renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / 200, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, preserveDrawingBuffer: true });
        renderer.setSize(container.clientWidth, 200);
        renderer.domElement.style.position = 'absolute'; // Keep it off-screen
        renderer.domElement.style.top = '-9999px'; // Hide it from view
        document.body.appendChild(renderer.domElement); // Temporarily add to DOM

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 1, 1);
        scene.add(directionalLight);

        // Load the 3D model
        const loader = new THREE.GLTFLoader();
        loader.load(
            modelPath,
            (gltf) => {
                const model = gltf.scene;
                scene.add(model);

                // Adjust model position and scale
                model.position.set(0, 0, 0);
                model.scale.set(2, 2, 2); // Adjust scale as needed for visibility

                // Render once and capture snapshot
                camera.position.z = 5; // Adjust this if needed
                renderer.render(scene, camera);

                // Convert the render to an image
                const imgData = renderer.domElement.toDataURL('image/png');
                const img = document.createElement('img');
                img.src = imgData;
                container.appendChild(img);

                // Clean up: remove the off-screen renderer
                document.body.removeChild(renderer.domElement);
            },
            undefined,
            (error) => {
                console.error('Error loading model:', error);
                container.textContent = 'Failed to load model snapshot';
            }
        );
    });
});