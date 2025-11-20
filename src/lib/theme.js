const themeMap = {
  // Cores Gerais
  corFundo: '--background', 
  corFundoCard: '--card',
  corTextoPrimario: '--foreground',
  corTextoSecundario: '--muted-foreground', // Texto adicional
  corPrimaria: '--primary',
  corBorda: '--border',

  // Cabeçalho
  headerBg: '--header-bg',
  headerText: '--header-text',
  headerLogoSize: '--header-logo-size',

  // Barra Lateral/Inferior
  sidebarBg: '--sidebar-bg',
  sidebarText: '--sidebar-text',
  sidebarActive: '--sidebar-active',
  
  // Tipografia
  fontFamilia: 'font-family',
};

const hexToHSL = (hex) => {
  return hex; 
};

export const applyTheme = (theme) => {
  const root = document.documentElement;
  
  Object.keys(theme).forEach(key => {
    const cssVar = themeMap[key];
    if (cssVar) {
      root.style.setProperty(cssVar, theme[key]);
    }
  });
};