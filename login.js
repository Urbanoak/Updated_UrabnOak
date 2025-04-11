document.getElementById("login-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("error-message");

    // Simple client-side validation (for demo purposes)
    if (username === "user" && password === "password") {
        // Store login state (for demo, using localStorage)
        localStorage.setItem("isLoggedIn", "true");
        // Redirect to index2.html
        window.location.href = "./index2.html";
    } else {
        errorMessage.textContent = "Invalid username or password.";
    }
});