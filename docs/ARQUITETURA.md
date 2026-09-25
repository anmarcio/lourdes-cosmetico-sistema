# Arquitetura inicial

```text
[ Navegador / Celular ]
          |
       React
          |
       REST API
          |
      Express/Node
          |
      PostgreSQL
          |
       Nuvem
```

## Decisões
- React + TypeScript: interface componentizada e responsiva.
- Node.js + Express: backend JavaScript/TypeScript e REST.
- PostgreSQL: banco relacional para integrar produtos, estoque, vendas, clientes e fornecedores.
- Docker: ambiente local reproduzível para o banco.
- Git/GitHub: histórico, branches, revisão e colaboração.
- Nuvem: publicação do backend e banco gerenciado após validação local.

## Próximas integrações
1. Autenticação e perfis.
2. CRUD completo.
3. Transações de estoque.
4. Venda baixa automaticamente o estoque.
5. Relatórios por período.
6. Vitrine pública.
7. Link de atendimento WhatsApp.
8. OpenAPI/Swagger.
9. Testes unitários, integração, usabilidade e acessibilidade.
10. CI/CD e deploy em nuvem.
