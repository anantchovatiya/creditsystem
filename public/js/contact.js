let ebody = document.getElementById("ebody");

function sendmail() {
    window.location = `mailto:anantchovatiya@gmail.com?subject=Feedback&body=${ebody.value}`;
}