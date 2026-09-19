export const analysisThemeVars={
  '--analysis-ink':'#0b1a31',
  '--analysis-panel-start':'rgba(235,245,252,.42)',
  '--analysis-panel-end':'rgba(194,215,231,.25)',
  '--analysis-progress-start':'#244562',
  '--analysis-progress-end':'#ffffff',
};

export function analysisThemeClass(base){
  return `${base} analysis-theme`.trim();
}
