# Verificador de Egressos da UFRR

## Descrição do Projeto

Este projeto é uma aplicação web que permite verificar egressos da UFRR que trabalham na prefeitura, utilizando arquivos CSV e TXT fornecidos pelo usuário. A aplicação processa os dados dos funcionários, calcula a média salarial e exibe informações detalhadas em uma tabela e gráficos interativos.

## Funcionalidades

- **Upload de Arquivos:** A aplicação aceita arquivos CSV e TXT para processar os dados dos funcionários.
- **Visualização de Resultados:** Exibe uma tabela com os egressos da UFRR encontrados, mostrando nome, vínculo e cargo.
- **Gráficos Interativos:** Apresenta gráficos que mostram os vínculos e cargos mais comuns entre os funcionários.

## Requisitos

- Node.js
- NPM (Node Package Manager)

## Como Executar o Projeto

### Passo 1: Clonar o Repositório

Primeiro, clone o repositório para o seu ambiente local:

```
git clone <URL-do-repositorio>
cd <nome-do-repositorio>
```

### Passo 2: Instalar as Dependências

Instale as dependências do projeto utilizando o NPM:

```
npm install
```

### Passo 3: Executar o Servidor

Inicie o servidor da aplicação com o comando:

```
node app.js
```

O servidor estará rodando em http://localhost:3000.

### Passo 4: Utilizar a Aplicação

- **Acessar a Página Principal:** Navegue até http://localhost:3000.

- **Upload de Arquivos:** Faça o upload dos arquivos CSV (ou XLSX) e TXT utilizando o formulário na página principal.

- **Visualizar Resultados:** Após o upload, você será redirecionado para a página de resultados que mostra os egressos encontrados.

- **Visualizar Gráficos:** Na página de resultados, clique no botão "Ver Gráficos" para acessar gráficos interativos com informações sobre vínculos e cargos.

## Estrutura do Projeto

- **app.js:** Arquivo principal do servidor Node.js que gerencia rotas e lógica de processamento de dados.

- **views/index.html:** Página inicial para o upload dos arquivos.

- **views/resultado.html:** Página que exibe a tabela de resultados com os egressos.

- **views/graficos.html:** Página que apresenta os gráficos interativos sobre vínculos e cargos.

- **public/:** Diretório para arquivos estáticos, como CSS e imagens.

## Notas

- Certifique-se de que os arquivos CSV estejam formatados corretamente com o delimitador | para um processamento adequado. 

- A aplicação suporta arquivos XLSX convertendo-os automaticamente para CSV.

## Tecnologias Utilizadas

- **Node.js:** Ambiente de execução JavaScript para o servidor.

- **Express:** Framework web para Node.js.

- **Multer:** Middleware para upload de arquivos.

- **Chart.js:** Biblioteca JavaScript para criação de gráficos interativos.

- **Bootstrap:** Framework CSS para estilização das páginas.
