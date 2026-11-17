# DocuSmart — organizador de documentos (PWA)

O DocuSmart é um projeto independente dentro de `docusmart/` no repositório B2B. Não compartilha a interface nem os dados do MercadoInteligente.

## Importação
- Compartilhamento de imagens e PDFs pelo WhatsApp por meio do Web Share Target da PWA instalada.
- Seleção de vários arquivos e imagens da galeria.
- Varredura de uma pasta escolhida pelo usuário, incluindo subpastas, nos navegadores que oferecem File System Access API.
- Deduplicação básica por nome, tamanho e data de modificação.

## Classificação e arquivamento
- OCR experimental em imagens com Tesseract.js (português).
- Sugestão de categoria, estabelecimento, valor e data; os campos devem ser revisados.
- Nome de arquivo editável antes do arquivamento e opção de renomear itens já arquivados.
- Extensão original preservada.
- Quando o usuário autoriza acesso de leitura/gravação a uma pasta, uma cópia é gravada em `DocuSmart_Arquivados/Categoria/Estabelecimento/Ano/Mês`.
- Sem uma pasta autorizada, os arquivos ficam no IndexedDB do navegador.

## Limitações importantes
- O navegador não pode examinar silenciosamente toda a galeria ou todas as pastas do Android. O usuário seleciona os arquivos ou concede acesso a uma pasta específica.
- A varredura é iniciada pelo usuário; não é um serviço permanente em segundo plano.
- A disponibilidade de seleção de pastas varia conforme navegador e sistema. Se `showDirectoryPicker` não existir, use a seleção múltipla de arquivos.
- A integração WhatsApp exige publicação HTTPS, instalação da PWA e suporte do navegador ao Web Share Target.
- iOS pode exigir uma integração nativa complementar.
- OCR de PDF ainda não implementado; o PDF é recebido e arquivado, mas os campos precisam ser preenchidos/revisados manualmente.
- A classificação automática é uma sugestão, não uma validação documental.
- Ainda não há conta, sincronização em nuvem, criptografia ponta a ponta ou backup remoto. O IndexedDB é local ao navegador/dispositivo e pode ser apagado pelo sistema.

## Teste
1. Publique `/docusmart/` em HTTPS.
2. Abra no Chrome Android e instale a PWA.
3. Teste o compartilhamento de uma imagem/PDF pelo WhatsApp.
4. Teste seleção múltipla da galeria.
5. Em navegador compatível, selecione uma pasta de teste com cópias de documentos e confira a criação da pasta `DocuSmart_Arquivados`.
6. Teste renomear antes e depois do arquivamento.

Não use documentos confidenciais em produção antes de implementar autenticação, armazenamento protegido, backup e testes de segurança.
