/**
 * Lógica principal do Gerador de QR Code
 * Refatorada para Live Preview e interação por botões (Swatches).
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inputs e Containers
    const qrInput = document.getElementById('qr-input');
    const qrcodeContainer = document.getElementById('qrcode-container');
    const downloadPngBtn = document.getElementById('download-png-btn');
    const downloadSvgBtn = document.getElementById('download-svg-btn');
    const logoFile = document.getElementById('logo-file');
    const btnCustomLogo = document.getElementById('btn-custom-logo');
    const customColorBtn = document.getElementById('custom-color-btn');
    const hiddenColorInput = document.getElementById('hidden-color-input');

    // Estado da Aplicação
    let currentText = qrInput.value || "https://exemplo.com";
    let currentColor = "#000000"; // Cor inicial
    let currentFormat = "square"; // Padrão inicial
    let currentLogoType = "none";
    let currentCustomLogoData = null;

    // Inicialização da biblioteca qr-code-styling
    const qrCode = new QRCodeStyling({
        width: 250,
        height: 250,
        type: "canvas",
        imageOptions: {
            crossOrigin: "anonymous",
            margin: 5,
            imageSize: 0.3
        }
    });

    /**
     * Função central para atualizar o QR Code no Live Preview
     */
    const updateQRCode = () => {
        // Logo
        let logoUrl = "";
        if (currentLogoType === 'scan-me') {
            const scanMeSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><rect width="60" height="60" rx="12" fill="#ffffff" stroke="${currentColor}" stroke-width="4"/><text x="30" y="26" font-family="sans-serif" font-weight="bold" font-size="14" fill="${currentColor}" text-anchor="middle" dominant-baseline="middle">SCAN</text><text x="30" y="42" font-family="sans-serif" font-weight="bold" font-size="14" fill="${currentColor}" text-anchor="middle" dominant-baseline="middle">ME</text></svg>`;
            logoUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(scanMeSVG);
        } else if (currentLogoType === 'custom' && currentCustomLogoData) {
            logoUrl = currentCustomLogoData;
        }

        // Padrões das bordas casando com os pontos
        let cornersType = "square";
        let cornersDotType = "square";
        
        if (currentFormat === "dots" || currentFormat === "rounded" || currentFormat === "classy") {
            cornersType = "extra-rounded";
            cornersDotType = "dot";
        }

        // Atualização reativa da lib
        qrCode.update({
            data: currentText,
            dotsOptions: { color: currentColor, type: currentFormat },
            cornersSquareOptions: { color: currentColor, type: cornersType },
            cornersDotOptions: { color: currentColor, type: cornersDotType },
            backgroundOptions: { color: "#ffffff" },
            image: logoUrl
        });

        // Atualizar no DOM
        qrcodeContainer.innerHTML = '';
        qrCode.append(qrcodeContainer);
    };

    // Render Inicial
    updateQRCode();

    // Eventos de Input de Texto (Live Preview)
    qrInput.addEventListener('input', (e) => {
        // Se ficar vazio, preenche com texto padrão pra não quebrar a lib
        currentText = e.target.value.trim() || "https://exemplo.com.br";
        updateQRCode();
    });

    // Eventos de Escolha de Formato (Pattern)
    const patternButtons = document.querySelectorAll('#pattern-grid .option-btn');
    patternButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            patternButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFormat = btn.dataset.type;
            updateQRCode();
        });
    });

    // Eventos de Escolha de Cor (Swatches pré-definidos)
    const colorButtons = document.querySelectorAll('.color-btn:not(#custom-color-btn)');
    colorButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            colorButtons.forEach(b => b.classList.remove('active'));
            customColorBtn.classList.remove('active');
            
            btn.classList.add('active');
            currentColor = btn.dataset.color;
            updateQRCode();
        });
    });

    // Eventos do Custom Color (Abre painel RGB/Conta gotas nativo do sistema)
    customColorBtn.addEventListener('click', () => {
        hiddenColorInput.click();
    });

    hiddenColorInput.addEventListener('input', (e) => {
        const selectedColor = e.target.value;
        
        colorButtons.forEach(b => b.classList.remove('active'));
        
        // Mantém o design visual original do botão de customização
        customColorBtn.classList.add('active');
        
        currentColor = selectedColor;
        updateQRCode();
    });

    // Eventos de Escolha de Logo
    const logoButtons = document.querySelectorAll('#logo-grid .option-btn');
    logoButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.id === 'btn-custom-logo') {
                // Abre o seletor de arquivos, mas não muda a cor de ativo ainda
                logoFile.click();
                return;
            }
            
            logoButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLogoType = btn.dataset.logo;
            updateQRCode();
        });
    });

    // Upload de Custom Logo
    logoFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                currentCustomLogoData = evt.target.result;
                currentLogoType = "custom";
                
                // Agora sim muda a UI para o botão "+" ativo
                logoButtons.forEach(b => b.classList.remove('active'));
                btnCustomLogo.classList.add('active');
                
                updateQRCode();
            };
            reader.readAsDataURL(file);
        }
    });

    // Eventos de Download
    downloadPngBtn.addEventListener('click', () => {
        qrCode.download({ name: "qrcode_dinamico", extension: "png" });
    });

    downloadSvgBtn.addEventListener('click', () => {
        qrCode.download({ name: "qrcode_vetorial", extension: "svg" });
    });

    // Comportamento dos Botões de Destino da Esquerda
    const destButtons = document.querySelectorAll('.dest-btn');
    const urlInputContainer = document.getElementById('url-input-container');
    const vcardContainer = document.getElementById('vcard-container');
    const panelTitle = document.getElementById('panel-title');
    const btnGenerateVcard = document.getElementById('btn-generate-vcard');
    
    let isVcardMode = false;

    destButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            destButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const dataType = btn.dataset.type;
            const prefix = btn.dataset.prefix;
            
            if (dataType === 'vcard') {
                isVcardMode = true;
                urlInputContainer.classList.add('hidden');
                vcardContainer.classList.remove('hidden');
                panelTitle.innerText = "Informações do Cartão de Visita";
            } else {
                isVcardMode = false;
                urlInputContainer.classList.remove('hidden');
                vcardContainer.classList.add('hidden');
                panelTitle.innerText = "Insira sua URL";
                
                if (prefix) {
                    qrInput.value = prefix; // Altera o input visualmente
                    currentText = prefix;   // Atualiza o estado da aplicação
                    updateQRCode();         // Recalcula o QR Code em tempo real
                }
                
                // Foca no input para facilitar que o usuário complete a URL
                qrInput.focus();
            }
        });
    });

    // Lógica de Geração do vCard
    btnGenerateVcard.addEventListener('click', () => {
        const nome = document.getElementById('vcard-nome').value || '';
        const tel = document.getElementById('vcard-tel').value || '';
        const email = document.getElementById('vcard-email').value || '';
        const empresa = document.getElementById('vcard-empresa').value || '';
        const cargo = document.getElementById('vcard-cargo').value || '';
        const telComercial = document.getElementById('vcard-tel-comercial').value || '';
        const fax = document.getElementById('vcard-fax').value || '';
        const rua = document.getElementById('vcard-rua').value || '';
        const cidade = document.getElementById('vcard-cidade').value || '';
        const estado = document.getElementById('vcard-estado').value || '';
        const pais = document.getElementById('vcard-pais').value || '';
        const cep = document.getElementById('vcard-cep').value || '';
        const site = document.getElementById('vcard-site').value || '';

        // Montagem da string vCard (Versão 3.0)
        let vcardStr = "BEGIN:VCARD\nVERSION:3.0\n";
        if (nome) vcardStr += `FN:${nome}\n`;
        if (empresa) vcardStr += `ORG:${empresa}\n`;
        if (cargo) vcardStr += `TITLE:${cargo}\n`;
        if (tel) vcardStr += `TEL;TYPE=CELL:${tel}\n`;
        if (telComercial) vcardStr += `TEL;TYPE=WORK,VOICE:${telComercial}\n`;
        if (fax) vcardStr += `TEL;TYPE=WORK,FAX:${fax}\n`;
        if (email) vcardStr += `EMAIL;TYPE=WORK,INTERNET:${email}\n`;
        if (site) vcardStr += `URL:${site}\n`;
        
        // Endereço formatado: PO Box;Ext Adr;Street;Locality;Region;Postal Code;Country
        if (rua || cidade || estado || cep || pais) {
            vcardStr += `ADR;TYPE=WORK:;;${rua};${cidade};${estado};${cep};${pais}\n`;
        }
        
        vcardStr += "END:VCARD";
        
        currentText = vcardStr;
        updateQRCode();
        
        // Feedback visual no botão
        const btnOriginalText = btnGenerateVcard.innerHTML;
        btnGenerateVcard.innerHTML = "GERADO COM SUCESSO!";
        btnGenerateVcard.style.backgroundColor = "var(--primary-blue)";
        btnGenerateVcard.style.color = "white";
        
        setTimeout(() => {
            btnGenerateVcard.innerHTML = btnOriginalText;
            btnGenerateVcard.style.backgroundColor = "";
            btnGenerateVcard.style.color = "";
        }, 2000);
    });
});
