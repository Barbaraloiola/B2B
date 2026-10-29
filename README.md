# MercadoInteligente — v0.2

Protótipo responsivo para navegador e celular (PWA), evoluído a partir do HTML inicial do repositório.

## O que funciona nesta etapa
- Lista de compras com produto, marca, quantidade, unidade e preço esperado.
- Marcar/desmarcar e remover itens.
- Registro manual de compra com mercado, data e preços unitários.
- Histórico, total gasto, gastos por mercado e ranking de produtos.
- Pré-visualização local de imagem de cupom fiscal.
- Salvamento local no navegador.
- Base opcional para autenticação e sincronização entre dispositivos via Supabase.
- Manifest e service worker para instalação/cache básico em navegadores compatíveis.

## Teste rápido
1. Abra o app servido por um servidor web (não use `file://` para testar PWA).
2. Adicione alguns produtos, informando preços esperados.
3. Marque os itens comprados e clique em **Registrar compra dos marcados**.
4. Informe mercado, data e preços finais.
5. Confira Histórico e Painel. Os dados ficam no armazenamento local do navegador até configurar a nuvem.

## Ativar sincronização em nuvem (Supabase)
A sincronização entre dispositivos não funciona até configurar o seu próprio projeto Supabase.

1. Crie um projeto em https://supabase.com/.
2. Abra o SQL Editor e execute o conteúdo de `supabase/schema.sql`.
3. Copie `config.example.js` para `config.js`.
4. Em Supabase → Project Settings / API, preencha `supabaseUrl` e a chave pública anon/publishable em `config.js`.
5. Habilite a confirmação de e-mail ou configure a autenticação de acordo com sua preferência.
6. Publique os arquivos em hospedagem com HTTPS.
7. Abra o app, clique em **Conectar nuvem** e crie uma conta.
8. Entre na mesma conta em outro dispositivo para carregar os dados salvos na nuvem.

**Segurança:** não inclua a chave `service_role` no frontend. A tabela tem Row Level Security e políticas que restringem cada registro ao usuário autenticado.

### Nota sobre sincronização
Esta primeira versão guarda o estado da lista e histórico como um documento JSON por usuário. É uma base simples para protótipo; antes de uso multiusuário avançado, recomendamos normalizar itens/compras em tabelas próprias e tratar conflitos/offline com mais rigor. A nuvem não está ativa enquanto as credenciais não forem configuradas.

## Ainda não implementado
- OCR/IA para extrair produtos reais do cupom e validar o total.
- Estimativa de tributos por produto.
- Preços atuais de supermercados e integração com encartes/ofertas.
- Leitura de código de barras real.
- Comparação de preço por região e normalização de marcas/unidades.

Essas funções não são simuladas com dados inventados. O app informa quando um recurso ainda não está disponível.

## Arquivos
- `index.html`: interface responsiva.
- `app.js`: lógica da lista, histórico, painel, autenticação e sync.
- `config.example.js`: modelo de configuração pública.
- `supabase/schema.sql`: tabela e políticas de segurança.
- `manifest.webmanifest` e `sw.js`: base PWA.
