import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { theme, msFmt3 } from "../src/ui/theme";

/** Sustituye estos valores por tu estado real (TimingEngine, sensores, etc.) */
const d = {
  trackName: "TRACK NAME",
  date: "01/2025",
  time: "00:00",
  driver: "DRIVER NAME",

  rpm: 18900,
  rpmMax: 20000,

  lapsCount: 5,
  trackCond: "DRY",
  deviceOK: true,
  sats: 12,

  speedKmh: 75,
  gear: 1,

  lastLapMs: 69123,
  bestLapMs: 68123,
  currentLapMs: 68123,
  timeDiffMs: -12312,
  currentSectorMs: 83123,

  sectorProgress: [0.82, 0.74, 0.18], // 0..1
};

export default function SessionHUD() {
  return (
    <SafeAreaView style={s.root}>
      {/* Barra de RPM + número grande de RPM a la derecha */}
      <View style={s.rpmRow}>
        <RpmBar rpm={d.rpm} rpmMax={d.rpmMax} />
        <View style={s.rpmNumWrap}>
          <Text style={s.rpmBig}>{d.rpm.toLocaleString()}</Text>
          <Text style={s.rpmSmall}>RPM</Text>
        </View>
      </View>

      {/* Encabezado de pista/fecha/hora/driver + fila superior de status */}
      <View style={s.headerBlock}>
        <View style={s.headerLeft}>
          <Text style={s.trackLine}>
            {d.trackName}  /  01
          </Text>
          <Text style={s.subLine}>
            {d.date}        {d.time}
          </Text>
          <Text style={s.driverLine}>{d.driver}</Text>
        </View>

        {/* Fila superior de tiles: LAPS/TRACK | SPEED | DEVICE/SATS | STOP/PAUSE */}
        <View style={s.topTilesRow}>
          <Tile titleRow>
            <View style={s.lapsTrackRow}>
              <View style={s.lapsCol}>
                <Text style={s.tileCaption}>LAPS</Text>
                <Text style={s.tileValueXL}>{String(d.lapsCount).padStart(2,"0")}</Text>
              </View>
              <View style={s.trackCol}>
                <Text style={s.tileCaption}>TRACK</Text>
                <Text style={s.tileValueXL}>{d.trackCond}</Text>
              </View>
            </View>
          </Tile>

          <Tile>
            <Text style={s.speedBig}>{d.speedKmh}</Text>
            <Text style={s.speedUnit}>KM/h</Text>
          </Tile>

          <Tile greenOutline>
            <View style={s.deviceRow}>
              <View>
                <Text style={s.tileCaption}>DEVICE</Text>
                <Text style={[s.okText, {color: theme.greenOK}]}>{d.deviceOK? "OK":"WARN"}</Text>
              </View>
              <View>
                <Text style={s.tileCaption}>SATS</Text>
                <Text style={s.tileValueXL}>{d.sats}</Text>
              </View>
            </View>
          </Tile>

          <Pressable style={s.stopBtn} onPress={()=>{/* terminar/pausar */}}>
            <Text style={s.stopText}>STOP</Text>
            <Text style={s.stopTextSmall}>PAUSE</Text>
          </Pressable>
        </View>
      </View>

      {/* Cuerpo: izquierda LAST/BEST | centro GEAR | derecha CURRENT LAP + TIME DIFF + CURRENT SECTOR */}
      <View style={s.midRow}>
        {/* Izquierda: LAST / BEST */}
        <View style={s.leftCol}>
          <TimeBlock title="LAST LAP:" value={msFmt3(d.lastLapMs)} yellow />
          <TimeBlock title="BEST LAP:" value={msFmt3(d.bestLapMs)} />
        </View>

        {/* Centro: GEAR (cuadro grande) */}
        <View style={s.centerCol}>
          <Tile>
            <Text style={s.gearLabel}>GEAR</Text>
            <Text style={s.gearBig}>{d.gear}</Text>
          </Tile>
        </View>

        {/* Derecha: CURRENT LAP + TIME DIFF + CURRENT SECTOR */}
        <View style={s.rightCol}>
          <TimeBlock title="CURRENT LAP:" value={msFmt3(d.currentLapMs)} />
          <View style={s.rightBottomRow}>
            <Tile>
              <Text style={[
                s.diffBig,
                { color: d.timeDiffMs < 0 ? theme.greenOK : "#FF4D4D" }
              ]}>
                {(d.timeDiffMs < 0 ? "" : "+") + (Math.abs(d.timeDiffMs)/1000).toFixed(2)}
              </Text>
              <Text style={s.diffCaption}>TIME DIFF</Text>
            </Tile>
            <Tile greenFill>
              <Text style={s.currSectorCaption}>CURRENT SECTOR</Text>
              <Text style={s.currSectorBig}>{msFmt3(d.currentSectorMs)}</Text>
            </Tile>
          </View>
        </View>
      </View>

      {/* Barras de sector al pie: S1 verde, S2 magenta, S3 gris */}
      <View style={s.sectorsRow}>
        <SectorBar label="SECTOR 1" color={theme.sector1} progress={d.sectorProgress[0]} />
        <SectorBar label="SECTOR 2" color={theme.sector2} progress={d.sectorProgress[1]} />
        <SectorBar label="SECTOR 3" color={theme.sector3} progress={d.sectorProgress[2]} dim />
      </View>
    </SafeAreaView>
  );
}

/* --- Componentes --- */

function RpmBar({ rpm, rpmMax }:{ rpm:number; rpmMax:number }) {
  const segs = 32;
  const filled = Math.round((rpm / rpmMax) * segs);
  return (
    <View style={s.rpmBar}>
      {Array.from({length:segs}).map((_,i)=>{
        const active = i < filled;
        const high = i > segs * 0.78;
        return <View
          key={i}
          style={[
            s.rpmSeg,
            { backgroundColor: active ? (high ? "#B9BCC5" : "#83F5FF") : "#5E5F66" }
          ]}
        />;
      })}
      <View style={s.rpmTicks}>
        {Array.from({length:16}).map((_,i)=><Text key={i} style={s.tickText}>{i}</Text>)}
      </View>
    </View>
  );
}

function Tile({
  children,
  titleRow,
  greenOutline,
  greenFill,
}:{
  children?: any;
  titleRow?: boolean;
  greenOutline?: boolean;
  greenFill?: boolean;
}) {
  return (
    <View style={[
      s.tile,
      greenOutline && s.tileGreenOutline,
      greenFill && s.tileGreenFill,
      titleRow && { padding: 0 }
    ]}>
      {children}
    </View>
  );
}

function TimeBlock({ title, value, yellow }:{ title:string; value:string; yellow?:boolean }) {
  return (
    <View style={s.timeBlock}>
      <View style={s.timeTitle}><Text style={s.timeTitleText}>{title}</Text></View>
      <View style={s.timeValue}>
        <Text style={[s.timeValueText, yellow && { color: theme.yellowLap }]}>{value}</Text>
      </View>
    </View>
  );
}

function SectorBar({ label, color, progress, dim }:{
  label: string; color: string; progress: number; dim?: boolean;
}) {
  return (
    <View style={s.sectorWrap}>
      <Text style={[s.sectorLabel, dim && {opacity:0.6}]}>{label}</Text>
      <View style={[s.sectorTrack, dim && {opacity:0.6}]}>
        <View style={[s.sectorFill, { width: `${Math.max(0,Math.min(1,progress))*100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

/* --- Estilos --- */

const s = StyleSheet.create({
  root: { flex:1, backgroundColor: theme.bg, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 10 },

  rpmRow: { flexDirection:"row", alignItems:"flex-end" },
  rpmBar: { flex:1, height: 56, backgroundColor: "#0D0D10", borderRadius: 8, paddingHorizontal: 10, paddingTop: 6, flexDirection:"row", gap:4, alignItems:"flex-end", position:"relative" },
  rpmSeg: { width: 8, height: 36, borderRadius: 2 },
  rpmTicks: { position:"absolute", bottom:-18, left:8, right:8, flexDirection:"row", justifyContent:"space-between" },
  tickText: { color:"#9BA0A8", fontSize: 12 },

  rpmNumWrap: { width: 160, alignItems:"flex-end", paddingRight: 6 },
  rpmBig: { color: theme.text, fontSize: 54, fontWeight:"800" },
  rpmSmall: { color: theme.textDim, fontSize: 12, marginTop:-6 },

  headerBlock: { marginTop: 10 },
  headerLeft: { marginBottom: 8 },
  trackLine: { color:"#A6A9BB", fontSize: 26, fontWeight:"700" },
  subLine:   { color:"#8C8F9A", fontSize: 20, fontWeight:"700", marginTop: 2 },
  driverLine:{ color:"#A7A7A7", fontSize: 34, fontWeight:"700", marginTop: 2 },

  topTilesRow: { flexDirection:"row", gap: 12, marginTop: 8, alignItems:"stretch" },
  lapsTrackRow: { flexDirection:"row", padding: 12, gap: 18, justifyContent:"space-between" },
  lapsCol: { alignItems:"flex-start" },
  trackCol: { alignItems:"flex-end", flex:1 },
  deviceRow: { flexDirection:"row", alignItems:"center", justifyContent:"space-between", gap: 18, paddingHorizontal: 12, paddingVertical: 8 },

  tile: { flex:1, backgroundColor: theme.tileBody, borderRadius: 16, borderWidth: 2, borderColor: theme.border, padding: 10, minHeight: 80, justifyContent:"center" },
  tileGreenOutline: { borderColor: theme.greenOK },
  tileGreenFill: { backgroundColor: theme.greenOK, borderColor: theme.greenOK },

  tileCaption: { color: theme.text, fontSize: 14, letterSpacing: 1, opacity: 0.9 },
  tileValueXL: { color: theme.text, fontSize: 36, fontWeight:"800" },
  okText: { fontSize: 36, fontWeight:"800" },

  stopBtn: { paddingHorizontal: 22, paddingVertical: 14, borderRadius: 16, borderWidth: 3, borderColor: theme.redStop, alignItems:"center", justifyContent:"center", minWidth: 150 },
  stopText: { color: theme.redStop, fontSize: 36, fontWeight:"900" },
  stopTextSmall: { color: theme.redStop, fontSize: 24, fontWeight:"900", marginTop:-6 },

  midRow: { flexDirection:"row", gap: 14, marginTop: 14, flex: 1 },

  leftCol: { flex:1, gap: 12 },
  centerCol: { width: 260 },
  rightCol: { flex:1, gap: 12 },
  rightBottomRow: { flexDirection:"row", gap: 12 },

  timeBlock: { backgroundColor: theme.tileBody, borderRadius: 18, overflow:"hidden", borderWidth: 2, borderColor: theme.border },
  timeTitle: { backgroundColor: theme.tileTitle, paddingHorizontal: 18, paddingVertical: 8 },
  timeTitleText: { color: theme.text, fontSize: 20, fontWeight:"700", letterSpacing: 1 },
  timeValue: { paddingHorizontal: 18, paddingVertical: 18, backgroundColor: "#0C0E12" },
  timeValueText: { color: theme.text, fontSize: 54, fontWeight:"800" },

  speedBig: { color: theme.text, fontSize: 54, fontWeight:"800", textAlign:"center" },
  speedUnit: { color: theme.textDim, fontSize: 16, textAlign:"center", marginTop: -6 },

  gearLabel: { color: theme.textDim, fontSize: 18, marginBottom: -2, textAlign:"center" },
  gearBig: { color: theme.text, fontSize: 96, fontWeight:"900", textAlign:"center" },

  diffBig: { fontSize: 36, fontWeight:"800" },
  diffCaption: { color: theme.textDim, marginTop: 2 },

  currSectorCaption: { color:"#0B0B0B", fontSize: 14, fontWeight:"700" },
  currSectorBig: { color:"#0B0B0B", fontSize: 36, fontWeight:"900" },

  sectorsRow: { flexDirection:"row", alignItems:"center", gap: 12, marginTop: 10 },
  sectorWrap: { flex:1 },
  sectorLabel: { color:"#A6A9BB", fontSize: 22, fontWeight:"700", textAlign:"center", marginBottom: 6 },
  sectorTrack: { height: 18, borderRadius: 9, backgroundColor: "#3D3F4A" },
  sectorFill: { height: 18, borderRadius: 9 },
});