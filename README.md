# MercadoInteligente — v0.3

Aplicativo responsivo para navegador e celular. Esta branch evolui o protótipo sem alterar a branch principal.

## Arquitetura

- **Frontend/PWA:** interface e lógica da lista, compras e painel.
- **Banco principal — Supabase (PostgreSQL + Auth):** fonte principal dos dados e sincronização entre dispositivos autenticados.
- **Backup — Google Drive:** arquivo JSON na conta Google autorizada, independente do banco principal.
- **Armazenamento local:** cache de trabalho do navegador; não substitui a nuvem quando Supabase estiver configurado.

Fluxo esperado: alterações no app → armazenamento local → Supabase. Depois de uma sincronização Supabase bem-sucedida, o app tenta atualizar o backup do Drive se o usuário tiver autorizado o Google e o token ainda estiver válido. Também é possível fazer backup manual e restaurar um arquivo.

## Configurar o Supabase

1. Crie um projeto em https://supabase.com/.
2. Execute `supabase/schema.sql` no SQL Editor.
3. Em `config.js`, preencha `supabaseUrl` e `supabaseAnonKey` com os dados públicos do projeto.
4. Configure autenticação por e-mail no Supabase.
5. Publique o app por HTTPS.

Use apenas a chave pública anon/publishable no navegador. Nunca exponha a chave `service_role`.

## Configurar Google Drive

1. Acesse https://console.cloud.google.com/ e crie/selecione um projeto.
2. Ative a **Google Drive API**.
3. Configure a tela de consentimento OAuth. Durante os testes, adicione sua conta Google como usuária de teste.
4. Crie um **OAuth Client ID** do tipo **Web application**. Cadastre o domínio publicado em *Authorized JavaScript origins* e o endereço local de desenvolvimento, se for usá-lo.
5. Copie o Client ID para `googleClientId` em `config.js`. O Client ID é público; não coloque client secret nem refresh token no frontend.
6. Abra o MercadoInteligente, clique em **Conectar nuvem** e, na janela de conta, use **Conectar Google Drive**.
7. Após a autorização, clique em **Fazer backup agora** para criar/atualizar `MercadoInteligente-backup.json`.
8. Para recuperação, clique em **Restaurar do Drive** e confirme a substituição dos dados atuais.

O app solicita o escopo OAuth `drive.file`, limitado a arquivos que o aplicativo cria ou abre. O token de acesso fica apenas em memória. Ao recarregar a página ou quando o token expirar, pode ser necessário conectar o Drive novamente. O backup automático é uma tentativa no navegador após sincronizações bem-sucedidas do Supabase; não é um serviço de backup contínuo em segundo plano.

## Teste rápido

1. Configure Supabase e Google OAuth.
2. Publique ou execute o app em servidor local compatível; não use `file://`.
3. Crie uma conta, registre itens e compras.
4. Conecte o Drive e faça backup manual.
5. Confirme no Drive o arquivo `MercadoInteligente-backup.json`.
6. Teste a restauração primeiro com dados não essenciais.

## Limitações conhecidas

- O banco Supabase não estará ativo até configurar seu projeto e suas chaves.
- O Google Drive é backup, não mecanismo de sincronização.
- A estrutura Supabase atual guarda lista e histórico em um JSON por usuário; conflitos de edição simultânea/offline e histórico de versões avançado ainda precisam de evolução.
- Restaurar substitui lista e histórico atuais. Faça um backup antes.
- Imagens de cupons não são incluídas no backup nesta versão; a imagem é apenas pré-visualizada localmente.
- OCR/IA, cálculo tributário, preços atuais de supermercados e ofertas reais ainda não estão implementados.

## Arquivos

- `index.html`: interface responsiva.
- `app.js`: lista, histórico, autenticação e sincronização.
- `drive-backup.js`: OAuth Google, backup e restauração.
- `config.js`: configuração pública local.
- `config.example.js`: exemplo de configuração.
- `supabase/schema.sql`: tabela e políticas de segurança.
- `manifest.webmanifest` e `sw.js`: base PWA.
