function mountForm(index) {
    console.log("entrou")
    let id = index
    console.log("id", id)
    window.location = '/products/' + index
}

let header = (jwtToken) => {
    let headersList = {
        "Accept": "*/*",
        "Authorization": `Bearer ${jwtToken}`,
        "Content-Type": "application/json"
    }
    return headersList;
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
//------------------------------------------------Redirect MENU----------------------------------------------------------------------------//
function redirectMenu(value) {
    let val = value
    console.log("val", val)
    switch (val) {
        case 1:
            window.location = '/app'
            break
        case 2:
            window.location = '/app'
            break
        case 3:
            window.location = '/products'
            break
        default:
    }
}

//------------------------------------------------Delete----------------------------------------------------------------------------//
function deleteItem(index) {
    let id = index
    let confirmation = this.confirmAction('excluir');

    if (confirmation) {
        event.preventDefault();

        jwtToken = validateJwt();
        let headersList = header(jwtToken)

        fetch(`/api/produtos/${id}`, {
            method: "DELETE",
            body: `{\"id\": \"${id}\"}`,
            headers: headersList
        }).then(response => {
            return response.json();
        }).then(data => {
            if (data.message == 'Acesso ADM') {
                admDiv();
            } else {
                console.log(document.getElementById("permission-error"));
                setTimeout(() => { window.location = '/app' }, 2300);
                document.location.reload(true);
            }
        }).catch(err => console.log(err));


    }
}

function confirmAction(type) {
    return confirm(`Deseja realmente ${type}?`);
}

//----------------------------------------------------------------------------------------------------------------------------//


function init() {

    let jwtToken = localStorage.getItem('jwt');

    if (!jwtToken) {
        document.getElementById("permission-error").style.display = "inline";
        setTimeout(() => { window.location = '/' }, 2300);

    } else {

        let headersList = {
            "Accept": "*/*",
            "Authorization": "Bearer " + `${jwtToken}`
        }

        let redirect = document.getElementById('cadastros')
        redirect.addEventListener("click", function() {
            console.log("eitaaa")
            window.location = '/products'
        }, false);


        fetch('/api/produtos', {
                method: "GET",
                headers: headersList
            }).then(res => res.json())
            .then((produtos => {
                produtos.forEach(element => {
                    let newLine = `<tr>
                    <input type="hidden" name="order" value="${element.id}">
                    <td>${element.id}</td>
                    <td>${element.descricao}</td>
                    <td>${element.marca}</td>
                    <td>${element.valor}</td>
                    <td>
                        <i onClick="mountForm(${element.id})" id ="change" class="bi bi-pencil edit-icon" title="Editar"></i>
                        <i onClick="deleteItem(${element.id})" id = "delete" class="bi bi-trash trash-icon" title="Excluir"></i>
                    </td>
                </tr>
                `
                    $(table).find('tbody').append(newLine);
                });
            }));
    }

    //------------------------------------------------MENU----------------------------------------------------------------------------//

    var menuWrapper = $('.menu');
    var menuButton = $('.menu .menubutton');
    var menuItems = $('.menu ul li a');
    var listItem = $('.menu ul li');

    var tekstSpeed = 350;
    var sizeSpeed = 300;


    // isso alternará todos os itens do menu ao mesmo tempo
    toggleAll = function() {
        if (!menuWrapper.hasClass('toggled')) {
            //  escolhe o elemento mais longo em largura e dimensiona o div em torno dele para esse tamanho
            var width = 0;
            menuItems.each(function() {
                var thisWidth = $(this).width();
                if (thisWidth > width) {
                    width = thisWidth;
                }
            });
            width = width + 100;
        } else {
            var width = 100;
        }
        menuWrapper.animate({ width: width }, sizeSpeed);

        //  alterna os itens que ainda não foram alternados e remove a classe clicktoggled dos itens já alternados.
        menuItems
            .not($('.menu ul li a.clicktoggled'))
            .animate({ opacity: 'toggle' }, tekstSpeed);
        menuWrapper.toggleClass('toggled');
        menuItems.removeClass('clicktoggled');
        listItem.removeClass('listActive');
    }

    // quando os ícones são clicados, um será aberto, o outro será fechado.
    singleClicked = function() {
        if (!menuWrapper.hasClass('toggled')) {

            //    faz com que o wrapper tenha a mesma largura do novo item clicado.
            if (!$('a', $(this)).hasClass('clicktoggled')) {
                var newLength = $('a', $(this)).width();
                var newWidth = newLength + 100;
            } else {
                var newWidth = 100;
            }
            menuWrapper.animate({ width: newWidth }, sizeSpeed);

            //  quando clicado, ele alternará o item da lista clicado e fechará o já alternado.
            $('a', $(this))
                .animate({ opacity: 'toggle' }, tekstSpeed)
                .toggleClass('clicktoggled');
            $('a.clicktoggled', listItem.not(this)).each(function() {
                $(this)
                    .removeClass('clicktoggled')
                    .animate({ opacity: 'toggle' }, tekstSpeed);
            });
            $((this))
                .toggleClass('listActive');
            listItem.not(this).each(function() {
                $(this)
                    .removeClass('listActive')
            });
        }
    }


    //  ativar funções
    setTimeout(function() { toggleAll(); }, 1000);
    menuButton.click(toggleAll);
    listItem.click(singleClicked);
    $(document).keyup(function(e) {
        if (e.keyCode == 27) { // escape key maps to keycode `27`
            if (menuWrapper.hasClass('toggled')) {
                toggleAll();
            }
        }
    });
    $('.content').click(function() {
        if (menuWrapper.hasClass('toggled')) {
            toggleAll();
        }
    });
}
//-----------------------------------------------------------------------------------------------------------------------------//


document.onload = init();