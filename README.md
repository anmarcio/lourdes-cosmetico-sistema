# Lourdes Cosmético e Utilidades — Sistema Integrado

Projeto Integrador II — DRP01 Turma 003.

## Objetivo
Sistema web responsivo para centralizar produtos, estoque, vendas, clientes e fornecedores, com vitrine virtual e direcionamento para atendimento via WhatsApp.

## Stack inicial
- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- Banco: PostgreSQL
- API: REST + OpenAPI/Swagger (etapa seguinte)
- Infra local: Docker Compose
- Versionamento: Git + GitHub
- Testes: Vitest/Supertest (etapa seguinte)
- Nuvem: preparada para deploy em serviço gerenciado (etapa seguinte)

## Módulos
1. Dashboard
2. Produtos
3. Estoque — entradas/saídas e alerta de estoque mínimo
4. Vendas
5. Clientes
6. Fornecedores
7. Vitrine virtual
8. Atendimento via WhatsApp
9. Relatórios

## Começar
### 1. Banco local
```bash
docker compose up -d db
```

### 2. Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 3. Frontend
Em outro terminal:
```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173
API: http://localhost:3000
Health: http://localhost:3000/api/health

## Git
```bash
git init
git add .
git commit -m "chore: inicia estrutura do sistema Lourdes"
git branch -M main
git remote add origin SEU_REPOSITORIO_GITHUB
git push -u origin main
```

Para novas funcionalidades:
```bash
git checkout -b feature/produtos
# trabalhar, testar
git add .
git commit -m "feat: adiciona cadastro de produtos"
git push -u origin feature/produtos
```

## Roadmap acadêmico
A estrutura acompanha o plano: primeiro frontend e base executável; depois banco/estoque; em seguida vendas/relatórios; por fim API/nuvem, vitrine, acessibilidade e testes.
