(function () {
  function extrairChave(texto) {
    const t = String(texto || '').replace(/[\s.\-]/g, '');
    const m = t.match(/(?:[?&]p=|chNFe=)(\d{44})/i) || t.match(/(\d{44})/);
    return m ? m[1] : null;
  }

  function chaveValida(c) {
    if (!/^\d{44}$/.test(c)) return false;
    let peso = 2, soma = 0;
    for (let i = 42; i >= 0; i--) {
      soma += Number(c[i]) * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }
    const r = soma % 11;
    return (r < 2 ? 0 : 11 - r) === Number(c[43]);
  }

  function iniciar() {
    const drop = document.querySelector('label.drop');
    if (!drop || document.getElementById('btn-camera-ao-vivo')) return;

    const btn = document.createElement('button');
    btn.id = 'btn-camera-ao-vivo';
    btn.type = 'button';
    btn.className = 'btn primary';
    btn.style.marginTop = '10px';
    btn.textContent = '📷 Ler QR Code com a câmera';
    drop.insertAdjacentElement('afterend', btn);

    const box = document.createElement('div');
    box.className = 'hidden';
    box.innerHTML =
      '<video id="cam-video" playsinline muted style="width:100%;max-height:340px;object-fit:contain;border-radius:12px;background:#000;margin-top:10px"></video>' +
      '<div class="actions"><button type="button" id="cam-parar" class="btn quiet">Parar câmera</button></div>' +
      '<p id="cam-msg" class="muted" aria-live="polite">Aponte para o QR Code do cupom e mantenha firme.</p>';
    btn.insertAdjacentElement('afterend', box);

    const video = box.querySelector('#cam-video');
    const msg = box.querySelector('#cam-msg');
    let stream = null;
    let ativo = false;
    let frame = 0;
    let lendo = false;

    function parar() {
      ativo = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      if (stream) stream.getTracks().forEach(track => track.stop());
      stream = null;
      video.pause();
      video.srcObject = null;
      box.classList.add('hidden');
      btn.disabled = false;
    }

    function preencher(texto) {
      const qr = document.getElementById('receipt-qr');
      const key = document.getElementById('receipt-key');
      const status = document.getElementById('receipt-status');
      if (qr) {
        qr.value = texto;
        qr.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const chave = extrairChave(texto);
      if (chave && key) {
        key.value = chave;
        key.dispatchEvent(new Event('input', { bubbles: true }));
        key.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (status) {
        status.textContent = !chave
          ? 'QR lido, mas não parece conter a chave de uma nota fiscal.'
          : chaveValida(chave)
            ? 'QR Code lido e chave de acesso válida. Agora confira os dados do cupom.'
            : 'QR lido, mas o dígito de controle da chave não confere. Tente novamente.';
      }
    }

    btn.addEventListener('click', async () => {
      if (!window.isSecureContext || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('A câmera exige uma conexão segura HTTPS. Abra o aplicativo pelo endereço https://barbaraloiola.github.io/B2B/.');
        return;
      }
      if (ativo) return;
      btn.disabled = true;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
        video.srcObject = stream;
        box.classList.remove('hidden');
        await video.play();
      } catch (e) {
        if (stream) stream.getTracks().forEach(track => track.stop());
        stream = null;
        btn.disabled = false;
        const motivos = {
          NotAllowedError: 'Permissão negada. Nas configurações do navegador, permita o acesso à câmera para este site.',
          NotFoundError: 'Nenhuma câmera foi encontrada neste dispositivo.',
          NotReadableError: 'A câmera está em uso por outro aplicativo. Feche-o e tente novamente.',
          OverconstrainedError: 'A câmera não aceitou a configuração solicitada. Tente novamente.'
        };
        alert(motivos[e.name] || ('Não foi possível abrir a câmera: ' + (e.message || e.name)));
        return;
      }

      ativo = true;
      msg.textContent = 'Câmera ativa. Enquadre o QR Code; a leitura será automática.';
      let detector = null;
      if ('BarcodeDetector' in window) {
        try { detector = new BarcodeDetector({ formats: ['qr_code'] }); } catch (e) {}
      }
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      const laco = async () => {
        if (!ativo) return;
        if (!lendo && video.readyState >= 2 && video.videoWidth > 0) {
          lendo = true;
          let texto = null;
          try {
            if (detector) {
              const resultados = await detector.detect(video);
              if (resultados.length) texto = resultados[0].rawValue;
            }
            if (!texto && window.jsQR) {
              const escala = Math.min(1, 960 / video.videoWidth);
              canvas.width = Math.round(video.videoWidth * escala);
              canvas.height = Math.round(video.videoHeight * escala);
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imagem = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const resultado = window.jsQR(imagem.data, imagem.width, imagem.height, { inversionAttempts: 'attemptBoth' });
              if (resultado) texto = resultado.data;
            }
          } catch (e) {
            msg.textContent = 'Não foi possível ler este quadro. Mantenha o QR Code bem iluminado e enquadrado.';
          } finally {
            lendo = false;
          }
          if (texto) {
            parar();
            preencher(texto);
            return;
          }
        }
        if (ativo) frame = requestAnimationFrame(laco);
      };
      laco();
    });

    box.querySelector('#cam-parar').addEventListener('click', parar);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && ativo) parar();
    });
    window.addEventListener('pagehide', parar);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();