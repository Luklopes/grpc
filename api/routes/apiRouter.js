const express = require('express');
let apiRouter = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const endpoint = '/'

const knex = require('knex')({
    client: 'pg',
    connection: process.env.DATABASE_URL,
    debug: true
});

let checkUser = (req, res, next) => {
    let authToken = req.headers['authorization']

    if (!authToken)
        res.status(401).json({ "message": "Token required" });

    let token = authToken.split(" ")[1];
    req.token = token;

    jwt.verify(req.token, process.env.SECRET_KEY, (err, decodeToken) => {
        if (err) {
            res.status(401).json({ "message": "Acesso negado" });
            return
        }

        req.usuarioId = decodeToken.id;
        next();
    });
}

let isAdmin = (req, res, next) => {
    knex
        .select("*")
        .from("usuario")
        .where({ id: req.usuarioId })
        .then(usuarios => {
            if (!usuarios.length) {
                res.status(401).json({ "message": "Acesso negado" });
                return
            }

            let usuario = usuarios[0];
            let roles = usuario.roles.split(";");
            let adminRole = roles.find(i => i === 'ADMIN');

            if (adminRole === 'ADMIN') {
                next()
                return;
            } else {
                res.status(401).json({ "message": "Acesso ADM" });
            }
        });
}

apiRouter.post(endpoint + 'seguranca/register', (req, res) => {
    knex('usuario')
        .insert({
            nome: req.body.nome,
            login: req.body.login,
            senha: bcrypt.hashSync(req.body.senha, 8),
            email: req.body.email
        }, ['id'])
        .then((result) => {
            let usuario = result[0]
            res.status(200).json({ "id": usuario.id })
            return
        })
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao registrar usuario - ' + err.message
            })
        })
});

apiRouter.post(endpoint + 'seguranca/login', (req, res) => {
    knex
        .select('*').from('usuario').where({ login: req.body.login })
        .then(usuarios => {
            if (usuarios.length) {
                let usuario = usuarios[0]
                let checkSenha = bcrypt.compareSync(req.body.senha, usuario.senha)
                if (checkSenha) {
                    var tokenJWT = jwt.sign({ id: usuario.id },
                        process.env.SECRET_KEY, {
                        expiresIn: 3600
                    })

                    res.status(200).json({
                        id: usuario.id,
                        login: usuario.login,
                        nome: usuario.nome,
                        roles: usuario.roles,
                        token: tokenJWT
                    })
                    return
                }
            }

            res.status(200).json({ message: 'Login ou senha incorretos' })
        })
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao verificar login - ' + err.message
            })
        })
});

apiRouter.get(endpoint + 'produtos', checkUser, (req, res) => {
    knex.select('*').from('produto').orderBy('id')
        .then(produtos => res.status(200).json(produtos))
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao recuperar produtos - ' + err.message
            })
        })
})

apiRouter.get(endpoint + 'produtos/:id', checkUser, (req, res) => {
    knex.select('*').from('produto').where({ id: req.params.id })
        .then(produtos => {
            if (produtos.length) {
                res.status(200).json(produtos[0]);
            } else {
                res.status(404).json({ message: "Item não localizado" });
            }
        })
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao recuperar produto - ' + err.message
            })
        })
});


apiRouter.delete(endpoint + 'produtos/:id', checkUser, isAdmin, (req, res) => {
    knex.from('produto').where({ id: req.params.id }).del()
        .then(() => res.status(200).json({ message: "item excluido com sucesso" }))
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao excluir produto - ' + err.message
            })
        })
});

apiRouter.post(endpoint + 'produtos', checkUser, isAdmin, (req, res) => {

    if (!req.body.descricao || !req.body.valor || !req.body.marca)
        res.status(500).json({
            message: "descricao, valor, marca obrigatórios"
        })
    else {

        knex.insert({
            descricao: req.body.descricao,
            valor: req.body.valor,
            marca: req.body.marca
        }, ['id']).into('produto')
            .then(result => res.status(201).json(result[0]))
            .catch(err => {
                res.status(500).json({
                    message: 'Erro ao cadastrar produto - ' + err.message
                })
            })
    }
});

apiRouter.put(endpoint + 'produtos/:id', checkUser, isAdmin, (req, res) => {
    knex.select('*').from('produto').where({ id: req.params.id })
        .then(produtos => {
            if (produtos.length) { 
                if (req.body.id)
                    delete req.body.id;

                knex.from('produto').where({ id: req.params.id }).update(req.body)
                    .then(() => res.status(200).json({ message: "produto atualizado" }))
                    .catch(err => {
                        res.status(500).json({
                            message: 'Produto não encontrado - ' + err.message
                        })
                    })
            } else {
                res.status(404).json({ message: "Item não localizado" });
            }
        })
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao recuperar produto - ' + err.message
            })
        });
});




module.exports = apiRouter;