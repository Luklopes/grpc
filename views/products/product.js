
let header = (jwtToken) => {
    let headersList = {
        "Accept": "*/*",
        "Authorization": `Bearer ${jwtToken}`,
        "Content-Type": "application/json"
    }
    return headersList;
}

var req = new XMLHttpRequest();
req.open('GET', document.location, false);
req.send(null);
var headers = req.getAllResponseHeaders().toLowerCase();
var arr = headers.trim().split(/[\r\n]+/);
var headerMap = {};

arr.forEach(function (line) {
    var parts = line.split(': ');
    var header = parts.shift();
    var value = parts.join(': ');
    headerMap[header] = value;
});

if (headerMap.id) {
    jwtToken = validateJwt();
    let headersList = header(jwtToken)

    fetch(`/api/produtos/${headerMap.id}`, {
        method: "GET",
        headers: headersList
    }).then(response => {
        return response.json();
    }).then(data => {
        if (data.message == 'Item não localizado') {
            document.getElementById("permission-error").innerHTML = "Produto não localizado";
            document.getElementById("permission-error").style.display = "inline";
        } else {
            document.getElementById('productDescription').value = data.descricao;
            document.getElementById('productBrand').value = data.marca;
            document.getElementById('productValue').value = data.valor;

            buttom = document.getElementById('submitButton')
            buttom.innerHTML = 'Alterar produto';
            buttom.style.width = "30%";

        }
    }).catch(err => console.log(err));

    document.getElementById("login").setAttribute("onsubmit", `alterProduct(${headerMap.id})`);
}

function createProduct() {
    event.preventDefault();

    ({ productName, productBrand, productValue } = getValues());

    jwtToken = validateJwt();
    let headersList = header(jwtToken)

    fetch("/api/produtos", {
        method: "POST",
        body: `{\"descricao\": \"${productName}\", \"marca\": \"${productBrand}\", \"valor\": \"${productValue}\"}`,
        headers: headersList
    }).then(response => {
        return response.json();
    }).then(data => {
        if (data.message == 'Acesso ADM') {
            admDiv();
        } else {
            console.log(document.getElementById("permission-error"));
            document.getElementById("sucess-register").innerHTML = "Produto cadastrado com sucesso!";
            document.getElementById("sucess-register").style.display = "inline";
            setTimeout(() => { window.location = '/app' }, 2300);
        }
    }).catch(err => console.log(err));
}

function validateJwt() {
    var jwtToken = localStorage.getItem('jwt');
    if (!jwtToken) {
        document.getElementById("permission-error").innerHTML = "Seu acesso expirou, favor logar novamente! Você será redirecionado.";
        document.getElementById("permission-error").style.display = "inline";
        setTimeout(() => { window.location = '/' }, 2300);
    } else {
        return jwtToken;
    }
}

function getValues() {
    let productName = document.getElementById('productDescription').value;
    let productBrand = document.getElementById('productBrand').value;
    let productValue = document.getElementById('productValue').value;

    return { productName, productBrand, productValue }
}

function admDiv() {
    document.getElementById("permission-error").innerHTML = "Você não pode executar esta operação!";
    document.getElementById("permission-error").style.display = "inline";
}


function alterProduct(id) {
    event.preventDefault();

    jwtToken = validateJwt();
    headersList = header(jwtToken);

    ({ productName, productBrand, productValue } = getValues());

    fetch(`/api/produtos/${id}`, {
        method: "PUT",
        body: `{\"descricao\": \"${productName}\", \"marca\": \"${productBrand}\", \"valor\": \"${productValue}\"}`,
        headers: headersList
    }).then(response => {
        return response.json();
    }).then(data => {
        if (data.message == 'Acesso ADM') {
            admDiv();
        } else {
            document.getElementById("sucess-register").innerHTML = "Produto alterado com sucesso!";
            document.getElementById("sucess-register").style.display = "inline";
            setTimeout(() => { window.location = '/app' }, 2300);
        }
    }).catch(err => console.log(err));

}
