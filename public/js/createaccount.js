function registerAccount() {
    var username = document.getElementById("username").value;
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirmPassword").value;

    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }
    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }


    alert("Account registered successfully");
}

function validateEmail() {
    var email = document.getElementById("email").value;


}