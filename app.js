const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const router = require('./routes/index');

const app = express();

// Configurações de view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para parser JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração do Multer para upload
const upload = multer({ dest: 'uploads/' });

// Rotas
app.use('/', router);

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
