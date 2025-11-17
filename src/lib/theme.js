
const themeMap = {
  corFundo: '--cor-fundo',
  corFundoCard: '--cor-fundo-card',
  corTextoPrimario: '--cor-texto-primario',
  corTextoSecundario: '--cor-texto-secundario',
  corPrimaria: '--cor-primaria',
  corPrimariaHover: '--cor-primaria-hover',
  corDestrutiva: '--cor-destrutiva',
  corNavbarFundo: '--cor-navbar-fundo',
  corNavbarTexto: '--cor-navbar-texto',
  corFooterFundo: '--cor-footer-fundo',
  corFooterTexto: '--cor-footer-texto',
  fontFamilia: 'font-family',
  fontSizeBase: 'font-size',
  fontSizeH1: '--font-size-h1',
  fontSizeH2: '--font-size-h2',
  fontSizeH3: '--font-size-h3',
};

/**
 * Aplica um objeto de tema às variáveis CSS do documento.
 * @param {object} theme - O objeto de tema (ex: { corPrimaria: '#FF0000' })
 */
export const applyTheme = (theme) => {
  const root = document.documentElement;
  
  Object.keys(theme).forEach(key => {
    const cssVar = themeMap[key];
    if (cssVar) {
      // Se for uma variável de fonte, aplica diretamente
      if (key.startsWith('font')) {
        root.style.setProperty(cssVar, theme[key]);
      } else {
        // Se for cor, aplica no 'style'
        root.style.setProperty(cssVar, theme[key]);
      }
    }
  });
};