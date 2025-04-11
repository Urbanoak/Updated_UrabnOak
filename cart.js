document.addEventListener('DOMContentLoaded', () => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTitle = document.querySelector('.cart-title');
    const cartEmi = document.querySelector('.cart-emi');
    const subtotalElement = document.querySelector('.cart-subtotal');
    const shippingElement = document.querySelector('.cart-shipping');
    const totalElement = document.querySelector('.cart-total');
    const emiSummary = document.querySelector('.cart-emi-summary');
    const checkoutBtn = document.querySelector('.checkout-btn');
    const payrollSection = document.querySelector('.payroll-section');
    const paymentForm = document.getElementById('payment-form');

    function calculateEMI(total) {
        const interest = total * 0.01; // 1% interest
        const totalWithInterest = total + interest;
        const monthlyEMI = totalWithInterest / 12;
        return monthlyEMI.toFixed(2);
    }

    function updateCart() {
        cartItemsContainer.innerHTML = '';

        cart.forEach((item, index) => {
            const div = document.createElement('div');
            div.classList.add('cart-item');
            div.innerHTML = `
                <img src="${item.image || 'https://via.placeholder.com/100'}" alt="${item.name}" />
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p>${item.description || 'No description available'}</p>
                </div>
                <div class="cart-item-controls">
                    <div class="cost-quantity">
                        <span class="cost">$${item.price.toFixed(2)}</span>
                        <input type="number" value="${item.quantity}" min="1" data-index="${index}" />
                    </div>
                    <button data-index="${index}">Remove</button>
                </div>
            `;
            cartItemsContainer.appendChild(div);
        });

        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const shipping = subtotal > 100 ? 0 : 1;
        const total = subtotal + shipping;
        const emi = calculateEMI(total);

        cartTitle.textContent = `Your Bag Total is $${total.toFixed(2)}`;
        cartEmi.textContent = `EMI Option: $${emi}/month for 12 months (1% interest)`;
        subtotalElement.textContent = `Subtotal: $${subtotal.toFixed(2)}`;
        shippingElement.textContent = `Shipping: $${shipping.toFixed(2)}`;
        totalElement.textContent = `Total: $${total.toFixed(2)}`;
        emiSummary.textContent = `EMI: $${emi}/month for 12 months`;

        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Update quantity
    cartItemsContainer.addEventListener('change', (e) => {
        if (e.target.tagName === 'INPUT') {
            const index = parseInt(e.target.getAttribute('data-index'));
            const newQuantity = parseInt(e.target.value);
            if (newQuantity >= 1) {
                cart[index].quantity = newQuantity;
                updateCart();
            }
        }
    });

    // Remove item
    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const index = parseInt(e.target.getAttribute('data-index'));
            cart.splice(index, 1);
            updateCart();
        }
    });

    // Show payroll section
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        document.querySelector('.cart-section').style.display = 'none';
        payrollSection.style.display = 'block';
    });

    // Handle payment form submission
    paymentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const address = document.getElementById('address').value;
        const card = document.getElementById('card').value;
        const expiry = document.getElementById('expiry').value;
        const cvv = document.getElementById('cvv').value;

        // Basic validation
        if (name && email && address && card && expiry && cvv) {
            alert(`Payment successful!\nTotal: ${totalElement.textContent}\nShipping to: ${address}`);
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            window.location.href = './store.html';
        } else {
            alert('Please fill in all fields.');
        }
    });

    // Initial cart render
    updateCart();
});