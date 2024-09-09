const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const multer = require('multer');
const path = require('path');
const app = express();
const PORT = 3000;

// Configurar o Express para servir arquivos estáticos e usar views
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

// Configurar o multer para armazenamento de arquivos
const upload = multer({ dest: 'data/' });

// Função para ler o arquivo de egressos
function lerEgressos() {
    const egressos = fs.readFileSync('./data/egressos.txt', 'utf8').split('\n');
    const egressosLower = egressos.map((egresso) => egresso.trim().toLowerCase());
    console.log('Egressos carregados:', egressosLower);
    return egressosLower;
}

// Função para ler o CSV, converter para JSON e buscar nomes
function verificarFuncionarios(callback) {
    const egressos = lerEgressos();
    const funcionarios = [];
    const csvFilePath = './data/funcionarios.csv';

    if (fs.existsSync(csvFilePath)) {
        const jsonData = [];

        fs.createReadStream(csvFilePath)
            .pipe(csv({
                separator: '|',
            }))
            .on('data', (row) => {
                jsonData.push(row); // Adiciona cada linha do CSV ao array JSON
            })
            .on('end', () => {
                jsonData.forEach((row) => {
                    const nomeCompleto = row['NOME']?.toLowerCase();
                    if (nomeCompleto && egressos.includes(nomeCompleto)) {
                        funcionarios.push(row);
                    }
                });
                callback(funcionarios); // Retorna os funcionários correspondentes
            });
    } else {
        console.log('Arquivo de funcionários não encontrado.');
        callback([]);
    }
}

// Rota para upload do arquivo CSV
app.get('/upload_csv', (req, res) => {
    res.render('upload_csv');
});

// Rota para upload do arquivo TXT
app.get('/upload_txt', (req, res) => {
    res.render('upload_txt');
});

// Rota para processamento do upload do CSV
app.post('/upload_csv', upload.single('csvfile'), (req, res) => {
    fs.renameSync(req.file.path, './data/funcionarios.csv'); // Renomeia o arquivo para o nome padrão
    res.redirect('/upload_txt'); // Redireciona para a página de upload do arquivo TXT
});

// Rota para processamento do upload do TXT
app.post('/upload_txt', upload.single('txtfile'), (req, res) => {
    fs.renameSync(req.file.path, './data/egressos.txt'); // Renomeia o arquivo para o nome padrão
    res.redirect('/'); // Redireciona para a página principal
});

// Rota para a página principal
app.get('/', (req, res) => {
    verificarFuncionarios((result) => {
        res.render('index', { funcionarios: result });
    });
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
