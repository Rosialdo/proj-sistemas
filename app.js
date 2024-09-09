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

// Configurar o multer para armazenamento de arquivos com múltiplos uploads
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

// Rota para upload de ambos os arquivos
app.post('/upload', upload.fields([{ name: 'csvfile', maxCount: 1 }, { name: 'txtfile', maxCount: 1 }]), (req, res) => {
    if (req.files['csvfile']) {
        fs.renameSync(req.files['csvfile'][0].path, './data/funcionarios.csv'); // Renomeia o arquivo CSV para o nome padrão
    }
    if (req.files['txtfile']) {
        fs.renameSync(req.files['txtfile'][0].path, './data/egressos.txt'); // Renomeia o arquivo TXT para o nome padrão
    }
    res.redirect('/resultado'); // Redireciona para a página de resultados
});

// Rota para mostrar resultados
app.get('/resultado', (req, res) => {
    verificarFuncionarios((result) => {
        res.render('resultado', { funcionarios: result });
    });
});

// Rota para a página principal
app.get('/', (req, res) => {
    res.render('index'); // Renderiza a nova página index com o formulário combinado
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
