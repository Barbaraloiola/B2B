# DocuSmart — protótipo de comprovantes

## Fluxo escolhido
1. No Android, compartilhar imagem ou PDF pelo menu do WhatsApp para DocuSmart (Web Share Target da PWA).
2. O Service Worker recebe o POST multipart e guarda o arquivo em uma fila local de pendências.
3. O usuário revisa nome, valor, data e categoria; a pasta é apenas sugerida.
4. O arquivo só passa para o arquivo local após clicar em **Confirmar arquivamento**.

## Publicação e teste
Publicar esta pasta em HTTPS. Abrir a URL /docusmart/ no Chrome Android, instalar a PWA e depois compartilhar uma imagem/PDF no WhatsApp selecionando DocuSmart. O alvo de compartilhamento depende de suporte do navegador e da instalação da PWA. iOS precisará de integração nativa complementar.

## Limitações
OCR experimental apenas em imagens, via Tesseract.js CDN; PDF é recebido, mas ainda sem extração de texto. O OCR não comprova que uma transferência ocorreu. Armazenamento é apenas IndexedDB local, sem login, nuvem, criptografia, backup ou sincronização. Não usar para documentos sensíveis. Próximas etapas: OCR PDF, deduplicação, Supabase Storage privado, autenticação/RLS, validação no servidor, backup, exclusão e testes Android/iOS.
