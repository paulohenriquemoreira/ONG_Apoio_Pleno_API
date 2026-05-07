# 🏠 API - ONG Apoio Pleno (Sistema de Gestão Solidária)

![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow)
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
* **Padrão MSC:** Arquitetura dividida em *Models*, *Services* e *Controllers* para separação de responsabilidades.
* **Nodemon:** Monitoramento e reinício automático do servidor em ambiente de desenvolvimento.
* **Postman:** Testes na configuração e funcionamento da API de forma prática e profissional.

---

## 📂 Estrutura de Pastas

A aplicação segue uma arquitetura modular para facilitar a manutenção e escalabilidade:

```text
ong-apoio-pleno/
├── public/                 # Arquivos estáticos (ex: logos e imagens)
├── src/                    # Código-fonte principal da aplicação
│   ├── config/             # Configurações globais (ex: conexão com banco)
│   ├── controllers/        # Lógica de controle das requisições (req, res)
│   ├── database/           # Banco de dados local e scripts de criação de tabelas
│   ├── routes/             # Definição dos endpoints da API (GET, POST, PUT, DELETE)
│   └── server.js           # Ponto de entrada e inicialização do servidor
├── .env.example            # Exemplo das variáveis de ambiente necessárias
└── package.json            # Dependências e scripts do projeto

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

A API possui rotas estruturadas para as 5 entidades principais do projeto. Todas as requisições e respostas utilizam o formato JSON.

| Entidade       | Rota Base               | Métodos HTTP Suportados | Descrição |
|----------------|-------------------------|--------------------------|------------|
| Beneficiários  | `/api/beneficiarios`    | GET, POST, PUT, DELETE  | Gestão das pessoas atendidas pela ONG. |
| Equipamentos   | `/api/equipamentos`     | GET, POST, PUT, DELETE  | Controle de estoque e status (disponível, manutenção, etc). |
| Empréstimos    | `/api/emprestimos`      | GET, POST, PUT, DELETE  | Rastreabilidade do empréstimo solidário. |
| Doações        | `/api/doacoes`          | GET, POST, PUT, DELETE  | Entrada e saída de mantimentos/equipamentos doados. |
| Manutenções    | `/api/manutencoes`      | GET, POST, PUT, DELETE  | Histórico e controle de reparos dos equipamentos. |

-----


