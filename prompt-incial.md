# Prompt para Claude Code — epag POS Checkout Mock

## Contexto do Projeto

Construa um **mock funcional de Checkout para Point of Sale (POS)** da epag, usando **HTML, CSS e JavaScript puro** (sem frameworks). O objetivo é demonstrar como um terminal POS pode integrar o checkout da epag para que clientes paguem com métodos de pagamento locais do seu país na América Latina.

Este é um protótipo interativo para validação — não faz chamadas reais à API, mas simula todo o fluxo com dados mockados conforme a documentação oficial da epag.

---

## Design de Referência (Figma)

Siga fielmente o design do Figma: `https://www.figma.com/design/i86SGO7SlhdLkHwmusR5Z9/epag-POS?m=dev`

### Estrutura visual do checkout (extraída do Figma):

O checkout é um painel/card com fundo branco e cantos arredondados (~16px), com as seguintes seções:

1. **Seção "Country"** — título "Country" (bold, ~24px) + subtítulo "Select the payment method country:"
2. **Grid de países** — 6 botões em grid 3x2, cada um com a bandeira do país e nome abaixo:
   - Brazil, Mexico, Colombia, Peru, Ecuador, Chile
   - Cada botão: card com borda arredondada (~12px), borda sutil cinza, hover com destaque, estado selecionado com borda azul/primária
3. **Seção "Payment Methods"** — título "Payment Methods" (bold) + subtítulo "Select the payment method:"
4. **Lista de métodos de pagamento** — radio buttons empilhados, cada um mostrando:
   - Radio button + nome do método (à esquerda)
   - Ícones das bandeiras aceitas (à direita)
   - Os métodos mudam conforme o país selecionado
5. **Footer** — "Powered by epag | Terms Politics"

### Paleta de cores e tipografia:
- Background do card: `#FFFFFF`
- Background da página: `#F5F5F5` ou gradiente sutil
- Cor primária (borda ativa, botões): `#1A73E8` (azul epag)
- Texto principal: `#1A1A1A`
- Texto secundário: `#666666`
- Bordas: `#E0E0E0`
- Font: `'Inter', 'Segoe UI', sans-serif` para o corpo; use uma fonte display para o logo

---

## Documentação da API epag (para mock dos dados)

**Base URL (sandbox):** `https://api-sandbox.epag.io`
**Docs:** `https://developer-hml.epag.com/`

### Países suportados e métodos de pagamento por país:

#### 🇧🇷 Brazil (BR / BRL)
- **PIX** (`POST /pix/simple`) — gera QR Code + código "copia e cola"
- **Boleto** (`POST /boleto/simple`) — gera código de barras
- **Credit Card** (`POST /card/simple` method: CREDITCARD) — Mastercard, Visa, Elo, Cielo, Amex, Discover, JCB
- **Debit Card** (`POST /card/simple` method: DEBITCARD) — mesmas bandeiras
- **PicPay** (`POST /picpay/simple`) — gera QR Code

#### 🇲🇽 Mexico (MX / MXN)
- **Credit Card** — Mastercard, Visa, Amex
- **Debit Card** — Mastercard, Visa
- **OXXO** (`POST /paycash/simple`) — gera referência para pagamento em loja
- **SPEI** (transferência bancária)

#### 🇨🇴 Colombia (CO / COP)
- **Credit Card** — Mastercard, Visa, Amex
- **Debit Card** — Mastercard, Visa
- **PSE** (transferência bancária)
- **Efecty/Baloto** (pagamento em dinheiro)

#### 🇵🇪 Peru (PE / PEN)
- **Credit Card** — Mastercard, Visa, Amex
- **Debit Card** — Mastercard, Visa
- **PagoEfectivo** (pagamento em agência)
- **Bank Transfer**

#### 🇪🇨 Ecuador (EC / USD)
- **Credit Card** — Mastercard, Visa
- **Debit Card** — Mastercard, Visa
- **Bank Transfer**

#### 🇨🇱 Chile (CL / CLP)
- **Credit Card** — Mastercard, Visa, Amex
- **Debit Card** — Mastercard, Visa
- **Bank Transfer** (Khipu/WebPay)

### Estrutura do request de pagamento (referência para os mocks):

```json
{
  "contract_id": "MY_CONTRACT_ID",
  "reference_id": "MY_REFERENCE_ID",
  "notification_url": "https://my.notification.url/callback/",
  "payment": {
    "amount": 123.45,
    "currency": "BRL",
    "country": "BR",
    "method": "PIX"
  },
  "person": {
    "full_name": "Alice Sonnentag",
    "email": "alice@email.com",
    "tax_id": "39784045087"
  }
}
```

### Estrutura do response PIX (para mock):
```json
{
  "transaction_status": "PROCESSING",
  "payment_token": "uuid-here",
  "pix_qr_code": "BASE64_QR_CODE_IMAGE",
  "pix_code": "00020101021226600016BR.COM.PAGSEGURO...",
  "totals": {
    "amount": 123.45,
    "currency": "BRL"
  }
}
```

---

## Requisitos Técnicos

### Estrutura de arquivos:
```
epag-pos-checkout/
├── index.html          # HTML principal
├── css/
│   └── styles.css      # Estilos
├── js/
│   ├── app.js          # Lógica principal / orquestrador
│   ├── countries.js    # Dados dos países e métodos de pagamento
│   ├── mock-api.js     # Simulação de respostas da API (com delays)
│   └── checkout-ui.js  # Renderização e interações do checkout
└── assets/
    └── (use SVG inline ou emoji flags para as bandeiras)
```

### Fluxo completo do checkout (telas/etapas):

**Tela 1 — Seleção de País:**
- Grid 3x2 com os 6 países
- Cada card mostra bandeira (usar SVG/emoji) + nome
- Ao clicar, destaca o país selecionado com borda azul e transição suave
- Automaticamente mostra os métodos de pagamento disponíveis

**Tela 2 — Seleção de Método de Pagamento:**
- Lista de radio buttons com os métodos do país selecionado
- À direita de cada método, mostrar ícones das bandeiras aceitas
- Ao selecionar um método, habilitar o botão "Continue"

**Tela 3 — Formulário de Pagamento (varia por método):**

- **PIX (Brazil):**
  - Mostra QR Code mockado (gerar via canvas ou usar placeholder SVG)
  - Mostra código "copia e cola" com botão de copiar
  - Timer de expiração (countdown de 30 minutos)
  - Botões: "Copiar código" e "Já realizei o pagamento"

- **Credit Card / Debit Card (todos os países):**
  - Formulário com: Card Number, Cardholder Name, Expiry Date (MM/YY), CVV
  - Máscaras de input (card number em grupos de 4)
  - Detecção da bandeira pelo número digitado (Visa: 4xxx, Mastercard: 5xxx, Amex: 3xxx)
  - Campo de parcelas (installments) para credit card — 1x a 12x
  - Campos do pagador: Full Name, Email, Tax ID (CPF/CNPJ para BR, RUT para CL, etc.)
  - Botão "Pay BRL 123.45"

- **Boleto (Brazil):**
  - Exibe código de barras mockado (texto longo)
  - Botão "Copiar código" e "Baixar Boleto" (mock)
  - Data de vencimento (3 dias úteis)

- **PicPay (Brazil):**
  - QR Code mockado
  - Instruções: "Abra o app PicPay e escaneie o QR Code"

- **OXXO (Mexico):**
  - Referência de pagamento (número)
  - Instruções: "Vá até um OXXO e informe esta referência"
  - Valor e prazo

- **Bank Transfer (Chile/Colombia/Peru/Ecuador):**
  - Instruções com dados bancários mockados
  - Referência da transação

- **PSE (Colombia) / SPEI (Mexico):**
  - Simulação de redirect para banco (mostrar tela de "redirecionando...")

**Tela 4 — Confirmação:**
- Status: "Processing...", depois transiciona para "Payment Confirmed ✓"
- Animação de loading → check verde
- Detalhes: método usado, valor, referência
- Botão "New Payment"

### Comportamentos e UX:

1. **Transições suaves** — usar CSS transitions/animations entre telas (slide, fade)
2. **Responsivo** — funcionar em telas de POS (tipicamente ~800x480 a 1024x768) e desktop
3. **Validação de formulários** — validar campos obrigatórios, formato de card, CPF
4. **Feedback visual** — loading states, hover effects, estados de erro
5. **Mock API com delay** — simular latência de 1-2 segundos nas "chamadas" à API
6. **Header com logo epag** — usar texto "epag" estilizado + badge "POS"
7. **Valor da compra** — exibir sempre visível no topo: "Total: BRL 123.45" (configurável)
8. **Idioma** — manter em inglês (como no Figma), mas labels de campos podem ser localizados

### Qualidade do código:

- Código limpo, bem comentado
- Separação de responsabilidades (dados / UI / lógica)
- CSS com variáveis customizáveis (cores, fontes, border-radius)
- Sem dependências externas (vanilla JS puro)
- QR Code: gerar via canvas com padrão visual simples ou usar SVG placeholder estilizado
- Acessibilidade básica: labels, focus states, contraste adequado

---

## Exemplo de interação completa (happy path):

1. Usuário abre o checkout → vê grid de países
2. Clica em "Brazil" → card fica selecionado, métodos do Brasil aparecem abaixo
3. Seleciona "PIX" → clica "Continue"
4. Vê QR Code + código PIX copia e cola + timer
5. Clica "Já realizei o pagamento"
6. Vê loading "Processing payment..." (2 segundos)
7. Vê tela de sucesso "Payment Confirmed ✓" com detalhes
8. Pode clicar "New Payment" para recomeçar

---

## Instruções Finais

- Comece implementando a estrutura HTML + CSS do card principal
- Depois implemente a lógica JS para troca de telas
- Por último, implemente os formulários específicos de cada método
- Garanta que o mock funciona completamente offline (sem chamadas externas)
- O resultado final deve ser um arquivo `index.html` que funcione standalone (pode referenciar CSS/JS separados)
- Priorize fidelidade ao design do Figma e polimento visual