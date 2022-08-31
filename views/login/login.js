function validateUser() {
    event.preventDefault();
    let user = document.getElementById('inputUser').value;
    let password = document.getElementById('inputPassword').value;
   
    let headersList = {
        "Accept": "*/*",
        "Content-Type": "application/json"
    }

    fetch("/api/seguranca/login", {
        method: "POST",
        body: `{\"login\": \"${user}\", \"senha\": \"${password}\"}`,
        headers: headersList
    }).then(response => {        
        return response.json();
    }).then(data => {
        if (!data.token){
            document.getElementById("login-error").style.display = "inline";
            console.log(data);
        } else {
            localStorage.setItem('jwt', data.token);
            window.location = '/app';
        }
    }).catch(err => console.log(err));

}



