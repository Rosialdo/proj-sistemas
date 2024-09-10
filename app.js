const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const multer = require('multer');
const path = require('path');
const xlsx = require('xlsx');
const app = express();
const PORT = 3000;

// Configurar o Express para servir arquivos estáticos e usar views
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

const upload = multer({ dest: path.join(__dirname, 'data') });

// Função para ler o arquivo de egressos
function lerEgressos() {
    const egressosPath = path.join(__dirname, 'data', 'egressos.txt');
    if (fs.existsSync(egressosPath)) {
        const egressos = fs.readFileSync(egressosPath, 'utf8').split('\n');
        const egressosLower = egressos.map((egresso) => egresso.trim().toLowerCase());
        console.log('Egressos carregados:', egressosLower);
        return egressosLower;
    } else {
        console.log('Arquivo de egressos não encontrado.');
        return [];
    }
}

// Função para converter XLSX para CSV com delimitador '|'
function converterXlsxParaCsv(xlsxFilePath, csvFilePath) {
    try {
        const workbook = xlsx.readFile(xlsxFilePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const csvData = xlsx.utils.sheet_to_csv(sheet, { FS: '|' });
        fs.writeFileSync(csvFilePath, csvData);
        console.log(`Arquivo XLSX convertido para CSV: ${csvFilePath}`);
    } catch (error) {
        console.error('Erro ao converter XLSX para CSV:', error);
    }
}

// Função para ler dados de CSV e converter para JSON
function lerArquivoFuncionarios(callback) {
    const egressos = lerEgressos();
    const funcionarios = [];
    const csvFilePath = path.join(__dirname, 'data', 'funcionarios.csv');

    if (fs.existsSync(csvFilePath)) {
        console.log('Lendo arquivo CSV:', csvFilePath);
        fs.createReadStream(csvFilePath)
            .pipe(csv({ separator: '|' }))
            .on('data', (row) => {
                funcionarios.push(row);
            })
            .on('end', () => processarFuncionarios(funcionarios, egressos, callback));
    } else {
        console.log('Arquivo de funcionários não encontrado:', csvFilePath);
        callback([]);
    }
}

// Função para processar funcionários e preparar dados para gráficos e resultados
// Função para processar funcionários e preparar dados para gráficos e resultados
function processarFuncionarios(data, egressos, callback) {
    const funcionarios = data.filter(row => egressos.includes(row['NOME']?.toLowerCase()));
    const salarios = funcionarios.map(f => parseFloat(f['BRUTO'].replace(',', '.')) || 0);
    const mediaSalarial = (salarios.reduce((a, b) => a + b, 0) / salarios.length).toFixed(2);

    // Contando vínculos e cargos
    const vinculos = {};
    const cargos = {};
    funcionarios.forEach(f => {
        vinculos[f['VINCULO']] = (vinculos[f['VINCULO']] || 0) + 1;
        cargos[f['CARGO']] = (cargos[f['CARGO']] || 0) + 1;
    });

    // Selecionar os 4 vínculos mais comuns
    const vinculosMaisComuns = Object.entries(vinculos)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4);

    // Selecionar os 4 cargos mais comuns
    const cargosMaisComuns = Object.entries(cargos)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4);

    callback({ funcionarios, mediaSalarial, vinculos: vinculosMaisComuns, cargos: cargosMaisComuns });
}


// Rota para upload de ambos os arquivos
app.post('/upload', upload.fields([{ name: 'csvfile', maxCount: 1 }, { name: 'txtfile', maxCount: 1 }]), (req, res) => {
    const csvFilePath = path.join(__dirname, 'data', 'funcionarios.csv');
    if (req.files['csvfile']) {
        const filePath = req.files['csvfile'][0].path;
        if (filePath.endsWith('.csv')) {
            fs.renameSync(filePath, csvFilePath);
            console.log('Arquivo CSV renomeado para', csvFilePath);
        } else if (filePath.endsWith('.xlsx')) {
            converterXlsxParaCsv(filePath, csvFilePath);
        }
    }

    if (req.files['txtfile']) {
        const txtFilePath = req.files['txtfile'][0].path;
        const txtFinalPath = path.join(__dirname, 'data', 'egressos.txt');
        fs.renameSync(txtFilePath, txtFinalPath);
        console.log('Arquivo TXT renomeado para', txtFinalPath);
    }

    res.redirect('/resultado'); // Redireciona para a página de resultados
});

// Rota para mostrar resultados
app.get('/resultado', (req, res) => {
    lerArquivoFuncionarios((result) => {
        res.render('resultado', { funcionarios: result.funcionarios, mediaSalarial: result.mediaSalarial });
    });
});

// Rota para mostrar gráficos
app.get('/graficos', (req, res) => {
    lerArquivoFuncionarios((result) => {
        res.render('graficos', { 
            mediaSalarial: result.mediaSalarial, 
            vinculos: result.vinculos, 
            cargos: result.cargos 
        });
    });
});

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
