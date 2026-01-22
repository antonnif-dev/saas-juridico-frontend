// Mapeia as chaves do banco de dados para as variáveis CSS EXATAS do seu index.css
const themeMap = {
  // Cores Principais
  corPrimaria: '--cor-primaria',
  corFundo: '--cor-fundo',
  corFundoCard: '--cor-fundo-card',
  corTextoPrimario: '--cor-texto-primario',
  corTextoSecundario: '--cor-texto-secundario',
  corBorda: '--cor-borda',

  // Componentes Específicos
  corNavbarFundo: '--cor-navbar-fundo',
  corNavbarTexto: '--cor-navbar-texto',
  corFooterFundo: '--cor-footer-fundo',
  corFooterTexto: '--cor-footer-texto',
  corFooterAtivo: '--cor-footer-ativo',

  // Tipografia
  fontFamilia: '--font-familia', // Note que no seu CSS você usa uma variável para a fonte
  fontSizeBase: '--font-size-base',
  fontSizeH1: '--font-size-h1',
  fontSizeH2: '--font-size-h2',
  fontSizeH3: '--font-size-h3',
  //headerLogoSize: '--header-logo-size', // Para controlar logo via CSS no futuro
};

/**
 * Aplica um objeto de tema às variáveis CSS do documento.
 */
export const applyTheme = (theme) => {
  if (!theme) return;

  const root = document.documentElement;

  Object.keys(theme).forEach(key => {
    const cssVar = themeMap[key];
    if (cssVar && theme[key]) {
      root.style.setProperty(cssVar, theme[key]);
    }
  });
};