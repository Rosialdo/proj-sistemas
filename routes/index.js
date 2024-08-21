const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

// Página inicial
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Rota para upload do CSV e redirecionar para a próxima página
router.post('/upload-csv', upload.single('csvFile'), (req, res) => {
    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Salvar conteúdo CSV em JSON
    const jsonData = csvToJson(fileContent);
    console.log('Conteúdo JSON:', jsonData);  // Adicione esta linha

    fs.writeFileSync(path.join(__dirname, '../data/servidores.json'), JSON.stringify(jsonData));

    // Redirecionar para a tela de upload do TXT
    res.redirect('/upload-txt');
});

// Página para upload do arquivo TXT
router.get('/upload-txt', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/upload-txt.html'));
});

// Rota para upload do TXT e verificar nomes
router.post('/compare-names', upload.single('txtFile'), (req, res) => {
    const txtFilePath = req.file.path;
    const txtContent = fs.readFileSync(txtFilePath, 'utf8').split('\n').map(name => name.trim());

    const servidores = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/servidores.json')));

    const result = compareNames(txtContent, servidores);

    res.render('result', { result });
});

// Função para converter CSV para JSON
function csvToJson(csv) {
    const lines = csv.split('\n');
    const headers = lines[0].split(',');
    const data = lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((header, index) => {
            obj[header.trim()] = values[index].trim();
        });
        return obj;
    });
    return data;
}

// Função para comparar nomes
function compareNames(txtNames, servidores) {
    const matched = [];

    txtNames.forEach(name => {
        const found = servidores.some(servidor => {
            const servidorNome = servidor['Nome'];

            if (servidorNome) {  // Verifica se o campo 'Nome' existe
                return servidorNome.toLowerCase().includes(name.toLowerCase());
            } else {
                console.log('Nome não encontrado no servidor:', servidor);  // Log para depuração
                return false;
            }
        });

        if (found) {
            matched.push(name);
        }
    });

    return {
        total: txtNames.length,
        found: matched.length,
        matched
    };
}


module.exports = router;
