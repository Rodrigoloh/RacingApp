export const theme = {
  bg: "#0A0A0A",
  text: "#FFFFFF",
  textDim: "#A0A0A0",
  border: "#3A3A46",

  // Colores UI según tu mockup
  yellowLap: "#FFF45C",
  greenOK: "#00FF66",
  redStop: "#FF3B30",

  sector1: "#00FF6F",
  sector2: "#FF00D0",
  sector3: "#5A5A66",

  tileBody: "#0F1116",
  tileTitle: "#4C5064",
};

export function msFmt3(ms: number) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const ms3 = String(ms % 1000).padStart(3, "0");
  return `${m}:${String(s).padStart(2, "0")}.${ms3}`;
}