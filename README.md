
# 🏠 API - ONG Apoio Pleno (Sistema de Gestão Solidária)

![Status](https://img.shields.io/badge/Status-Concluído-green)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![Express](https://img.shields.io/badge/Express-Framework-lightgrey)
![SQLite](https://img.shields.io/badge/SQLite-Database-blue)

A **ONG Apoio Pleno** tem como missão primária o atendimento a pessoas em situação de vulnerabilidade socioeconômica, atuando como um Banco de Empréstimo Solidário de equipamentos médicos/ortopédicos e gerenciando doações.

Esta API RESTful foi desenvolvida para digitalizar, contabilizar e monitorar os processos operacionais da instituição, garantindo controle rigoroso sobre estoques, rastreabilidade e gestão humanizada.

---

## 🛠️ Tecnologias Utilizadas

O back-end foi construído utilizando as seguintes tecnologias e padrões de mercado:

<p align="left">
    <img height="65" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/node_js.png"title="Nodejs"
    />
    <img height="65" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/express.png"title="Express"
    />
    <img height="65" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/sqlite.png"title="SQLite/SQLite3"
    />
    <img height="65" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/postman.png"title="Postman"
    />
</p>

* **Node.js & Express:** Servidor e gerenciamento de rotas.
* **SQLite3:** Banco de dados relacional leve e embutido (arquitetura sem servidor externo).
* **Arquitetura MVC Adaptada:** Separação entre rotas, controllers, configurações e banco de dados.
* **Nodemon:** Monitoramento e reinício automático do servidor em ambiente de desenvolvimento.
* **Postman:** Testes na configuração e funcionamento da API de forma prática e profissional.

---

## 📁 Estrutura da Arquitetura do Projeto

A aplicação segue uma arquitetura modular para facilitar a manutenção e escalabilidade:

---

```text
ONG_APOIO_PLENO/
│
├── .vscode/
├── node_modules/
│
├── public/
│   ├── uploads/               # Fotos dos beneficiários
│   └── LogoApoioPleno.png
│
├── src/
│   │
│   ├── config/
│   │   ├── database.js        # Conexão SQLite
│   │   └── multer.js          # Configuração upload
│   │
│   ├── controllers/          # Regras de negócio
│   │   ├── beneficiariosController.js
│   │   ├── dashboardController.js
│   │   ├── doacoesController.js
│   │   ├── emprestimosController.js
│   │   ├── entregasController.js
│   │   ├── equipamentosController.js
│   │   ├── manutencoesController.js
│   │   └── usuariosController.js
│   │
│   ├── database/
│   │   ├── database.db        # Banco SQLite
│   │   └── init_db.js         # Script criação tabelas
│   │
│   ├── routes/
│   │   ├── beneficiarios.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── doacoes.routes.js
│   │   ├── emprestimos.routes.js
│   │   ├── entregas.routes.js
│   │   ├── equipamentos.routes.js
│   │   ├── manutencoes.routes.js
│   │   ├── usuarios.routes.js
│   │   └── index.js
│   │
│   └── server.js              # Inicialização API
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md

```
## ▶️ Como Rodar o Projeto

**1. Pré-requisitos**

Certifique-se de ter o Node.js instalado na sua máquina.

**2º Clone este repositório:**

```bash
git clone https://github.com/paulohenriquemoreira/ONG_Apoio_Pleno_API
cd ONG_Apoio_Pleno_API
```

**3º Instalar as dependências:**

```bash
npm install
```

**4. Configurar as Variáveis de Ambiente:**

Crie um arquivo chamado .env na raiz do projeto, baseando-se no arquivo .env.example

```bash
cp .env.example .env
```

**5º Inicie o servidor:**

```bash
npm run dev
```

> A API estará rodando em: `http://localhost:3000`

-----

## 🔗 Principais Endpoints da API:

A API possui rotas estruturadas para as 7 entidades principais do projeto. Todas as requisições e respostas utilizam o formato JSON.

| Entidade       | Rota Base               | Métodos HTTP Suportados | Descrição |
|----------------|-------------------------|--------------------------|------------|
| Beneficiários  | `/api/beneficiarios`    | GET, POST, PUT, DELETE  | Gestão das pessoas atendidas pela ONG. |
| Equipamentos   | `/api/equipamentos`     | GET, POST, PUT, DELETE  | Controle de estoque e status (disponível, manutenção, etc). |
| Empréstimos    | `/api/emprestimos`      | GET, POST, PUT, DELETE  | Rastreabilidade do empréstimo solidário. |
| Manutenções| `/api/manutencoes`      | GET,POST,PUT,DELETE  | Controle e gestão de manutenção |
|Doações        | `/api/doacoes`          | GET, POST  | Entrada e saída de mantimentos/equipamentos doados. |
| Entregas    | `/api/entregas`      | GET, POST  | Histórico e controle de entregas de doações. |
| Dashboard    | `/api/dashboard`      | GET | Retorna os indicadores e métricas gerais do dashboard. |
| Usuários       | `/api/usuarios/login`   | POST                     | Autenticação de Administrador. |

-----

## 🗄️ Estrutura do Banco de Dados

### 👤 Tabela: usuarios

| Campo | Tipo    |
| ----- | ------- |
| id    | Chave Primária (PK)|
| nome  | Nome do Usuário|
| email | E-mail do Usuário|
| senha | Senha do Usuário|


**Usuário padrão criado automaticamente:**
```
Email: admin@ong.com.br
Senha: 123456
```

-----

### 👥 Tabela: beneficiarios

| Campo           | Tipo    |
| --------------- | ------- |
| id              | Chave Primária (PK)|
| nome            | Nome do beneficiário|
| documento       | Documento do beneficiário|
| email           | E-mail do beneficiário|
| telefone        | Telefone do beneficiário|
| endereco        | Endereço do beneficiário|
| foto            | Foto do beneficiário|
| data_nascimento | Data Nascimento do beneficiário|
| data_cadastro   | Data que foi cadastrado!

-----

### 🦽 Tabela: equipamentos

| Campo          | Tipo    |
| -------------- | ------- |
| id             | Chave Primária (PK)|
| nome           | Nome do equipamento|
| descricao      | Descrição do equipamento|
| categoria      | Categoria do equipamento|
| numero_serie   | Nº Série do equipamento|
| status         | Status do equipamento|
| data_aquisicao | Data de aquisição|
| observacoes    | Observações do equipamento|

-----

### 📄 Tabela: emprestimos

| Campo           | Tipo    |
| --------------- | ------- |
| id              | Chave Primária (PK)|
| beneficiario_id | Chave Estrangeira para beneficiarios(id)|
| equipamento_id  | Chave Estrangeira para equipamentos(id)|
| data_inicio     | Data do Início do Empréstimo|
| data_fim        | Data do Fim do Empréstimo|
| data_devolucao  | Data da devolução do equipamento|
| status          | Status do empréstimo|
| observacoes     | Observações do empréstimo|
| data_cadastro   | Data que foi cadastrado   |


-----

### 🎁 Tabela: doacoes

| Campo          | Tipo    |
| -------------- | ------- |
| id             |Chave Primária (PK)|
| doador         | Nome do doador|
| categoria      | Categoria da doação|
| item           | Item da doação  |
| quantidade     | Quantidade da doação |
| unidade_medida | Unidade ou medida da doação   |
| data_doacao    | Data em que foi doado    |
| observacoes    | Observações sobre a doação    |

-----


### 🚚 Tabela: entregas

| Campo           | Tipo    |
| --------------- | ------- |
| id              | Chave Primária (PK)|
| beneficiario_id | Chave Estrangeira para beneficiarios(id)|
| item            | Item que foi entregue  |
| categoria       | Categoria da entrega |
| quantidade      | Quantidade na entrega |
| data_entrega    | Data em que foi entregue   |
| observacoes     | Observação da entrega    |


-----

### 🔧 Tabela: manutencoes

| Campo          | Tipo    |
| -------------- | ------- |
| id             | Chave Primária (PK)|
| equipamento_id | Chave Estrangeira para equipamentos(id)|
| data_inicio    | Data do início da manutenção    |
| data_fim       | Data da finalização da manutenção    |
| tipo           | Tipo de manutenção    |
| descricao      | Descrição da manutenção a ser feita    |
| custo          | Custo da manutenção   |
| responsavel    | Responsável pela manutenção   |
| observacoes    | Observação da manutenção   |
| status         | Status do andamento da manutenção    |
| data_cadastro  | data que foi cadastrada a manutenção    |


-----


### 📌 Funcionalidades Principais

    ✅ Cadastro de beneficiários com foto

    ✅ Controle de empréstimos solidários

    ✅ Gestão de estoque de equipamentos

    ✅ Registro de doações recebidas

    ✅ Controle de entregas para famílias

    ✅ Histórico de manutenção de equipamentos

    ✅ Usuário administrador inicial

-----

## 🔐 Segurança Implementada

- Uso de variáveis de ambiente (.env)
- Separação entre lógica e rotas
- Banco local protegido
- Estrutura preparada para JWT
- Estrutura preparada para criptografia bcrypt

-----

## 👨‍💻 Desenvolvido por

**Paulo Henrique Moreira** - 2026  
*Projeto desenvolvido para fins educacionais - Formação Full Stack.*