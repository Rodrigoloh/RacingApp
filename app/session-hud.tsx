import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, Pressable, Dimensions, Platform } from "react-native";
import { theme, msFmt3 } from "../src/ui/theme";
import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import TimingEngine from "../src/timing/TimingEngine";
import { initDB, findNearestTrack } from "../src/db/db";

// Responsive helpers
const { width: W, height: H } = Dimensions.get("window");
const isLandscape = W > H;
const scale = (n: number) => Math.round(n * (Math.min(W, H) / 390)); // base 390dp


export default function SessionHUD() {
  const [vals, setVals] = useState({
    trackName: "TRACK",
    date: "",
    time: "",
    driver: "DRIVER",
    rpm: 0,
    rpmMax: 20000,
    lapsCount: 0,
    trackCond: "DRY",
    deviceOK: true,
    sats: 0,
    speedKmh: 0,
    gear: 1,
    lastLapMs: 0,
    bestLapMs: 0,
    currentLapMs: 0,
    timeDiffMs: 0,
    currentSectorMs: 0,
    sectorProgress: [0, 0, 0] as number[],
  });

  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const engineRef = useRef<TimingEngine>();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      initDB();

      const fg = await Location.requestForegroundPermissionsAsync();
      if (!isMounted || fg.status !== "granted") return;

      const first = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      if (!isMounted) return;
      const lat = first.coords.latitude;
      const lng = first.coords.longitude;

      const nearby = findNearestTrack(lat, lng, 600);
      const engine = new TimingEngine({ minLapMs: 20000, gateCooldownMs: 1500 });
      engineRef.current = engine;

      engine.on((e) => {
        if (!isMounted) return;
        if (e.type === "phase") {
          if (e.payload.phase === "LEARNING") {
            setVals(v => ({ ...v, trackName: "LEARNING..." }));
          }
        }
        if (e.type === "tick") {
          setVals(v => ({ ...v, currentLapMs: e.payload.elapsedMs }));
        }
        if (e.type === "sector") {
          setVals(v => ({ ...v, currentSectorMs: e.payload.ms }));
        }
        if (e.type === "lap") {
          setVals(v => ({
            ...v,
            lastLapMs: e.payload.lap.totalMs,
            bestLapMs: v.bestLapMs === 0 ? e.payload.lap.totalMs : Math.min(v.bestLapMs, e.payload.lap.totalMs),
            lapsCount: v.lapsCount + 1
          }));
        }
      });

      if (nearby) {
        engine.setTrack(nearby);
        setVals(v => ({ ...v, trackName: nearby.name }));
      } else {
        engine.startLearning();
      }

      const sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 250, distanceInterval: 1 },
        (loc) => {
          const p = { lat: loc.coords.latitude, lng: loc.coords.longitude };
          engine.updatePosition(p);
          const speedKmh = (loc.coords.speed ?? 0) * 3.6;
          const sats = (loc.coords as any).satelliteNumber ?? vSafe(v => v.sats);
          setVals(v => ({ ...v, speedKmh, sats }));
        }
      );
      watchRef.current = sub;
    })();

    return () => {
      isMounted = false;
      try { watchRef.current?.remove(); } catch {}
    };
  }, []);

  function vSafe<T>(sel: (v: typeof vals) => T): T {
    // helper para usar valores previos en callbacks
    return sel(vals);
  }

  return (
    <SafeAreaView style={s.root}>
      {/* Barra de RPM + número grande de RPM a la derecha */}
      <View style={s.rpmRow}>
        <RpmBar rpm={vals.rpm} rpmMax={vals.rpmMax} />
        <View style={s.rpmNumWrap}>
          <Text style={s.rpmBig}>{vals.rpm.toLocaleString()}</Text>
          <Text style={s.rpmSmall}>RPM</Text>
        </View>
      </View>

      {/* Encabezado de pista/fecha/hora/driver + fila superior de status */}
      <View style={s.headerBlock}>
        <View style={s.headerLeft}>
          <Text style={s.trackLine}>
            {vals.trackName}  /  01
          </Text>
          <Text style={s.subLine}>
            {vals.date}        {vals.time}
          </Text>
          <Text style={s.driverLine}>{vals.driver}</Text>
        </View>

        {/* Fila superior de tiles: LAPS/TRACK | SPEED | DEVICE/SATS | STOP/PAUSE */}
        <View style={s.topTilesRow}>
          <Tile titleRow>
            <View style={s.lapsTrackRow}>
              <View style={s.lapsCol}>
                <Text style={s.tileCaption} numberOfLines={1}>LAPS</Text>
                <Text style={s.tileValueXL}>{String(vals.lapsCount).padStart(2,"0")}</Text>
              </View>
              <View style={s.trackCol}>
                <Text style={s.tileCaption} numberOfLines={1}>TRACK</Text>
                <Text style={s.tileValueXL}>{vals.trackCond}</Text>
              </View>
            </View>
          </Tile>

          <Tile>
            <Text style={s.speedBig}>{Math.round(vals.speedKmh)}</Text>
            <Text style={s.speedUnit}>KM/h</Text>
          </Tile>

          <Tile greenOutline>
            <View style={s.deviceRow}>
              <View>
                <Text style={s.tileCaption} numberOfLines={1}>DEVICE</Text>
                <Text style={[s.okText, {color: theme.greenOK}]}>{vals.deviceOK? "OK":"WARN"}</Text>
              </View>
              <View>
                <Text style={s.tileCaption} numberOfLines={1}>SATS</Text>
                <Text style={s.tileValueXL}>{vals.sats}</Text>
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
          <TimeBlock title="LAST LAP:" value={msFmt3(vals.lastLapMs)} yellow />
          <TimeBlock title="BEST LAP:" value={msFmt3(vals.bestLapMs)} />
        </View>

        {/* Centro: GEAR (cuadro grande) */}
        <View style={s.centerCol}>
          <Tile>
            <Text style={s.gearLabel}>GEAR</Text>
            <Text style={s.gearBig}>{vals.gear}</Text>
          </Tile>
        </View>

        {/* Derecha: CURRENT LAP + TIME DIFF + CURRENT SECTOR */}
        <View style={s.rightCol}>
          <TimeBlock title="CURRENT LAP:" value={msFmt3(vals.currentLapMs)} />
          <View style={s.rightBottomRow}>
            <Tile>
              <Text style={[
                s.diffBig,
                { color: vals.timeDiffMs < 0 ? theme.greenOK : "#FF4D4D" }
              ]}>
                {(vals.timeDiffMs < 0 ? "" : "+") + (Math.abs(vals.timeDiffMs)/1000).toFixed(2)}
              </Text>
              <Text style={s.diffCaption}>TIME DIFF</Text>
            </Tile>
            <Tile greenFill>
              <Text style={s.currSectorCaption}>CURRENT SECTOR</Text>
              <Text style={s.currSectorBig}>{msFmt3(vals.currentSectorMs)}</Text>
            </Tile>
          </View>
        </View>
      </View>

      {/* Barras de sector al pie: S1 verde, S2 magenta, S3 gris */}
      <View style={s.sectorsRow}>
        <SectorBar label="SECTOR 1" color={theme.sector1} progress={vals.sectorProgress[0]} />
        <SectorBar label="SECTOR 2" color={theme.sector2} progress={vals.sectorProgress[1]} />
        <SectorBar label="SECTOR 3" color={theme.sector3} progress={vals.sectorProgress[2]} dim />
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
  root: { flex:1, backgroundColor: theme.bg, paddingHorizontal: isLandscape ? 14 : 10, paddingTop: isLandscape ? 8 : 16, paddingBottom: 10 },

  rpmRow: { flexDirection:"row", alignItems:"flex-end", justifyContent:"space-between" },
  rpmBar: { flex:1, height: scale(56), backgroundColor: "#0D0D10", borderRadius: 8, paddingHorizontal: 10, paddingTop: 6, flexDirection:"row", gap: Math.max(2, Math.round(W/200)), alignItems:"flex-end", position:"relative" },
  rpmSeg: { width: Math.max(6, Math.round(W/60/3)), height: scale(36), borderRadius: 2 },
  rpmTicks: { position:"absolute", bottom:-18, left:8, right:8, flexDirection:"row", justifyContent:"space-between" },
  tickText: { color:"#9BA0A8", fontSize: 12 },

  rpmNumWrap: { width: W * 0.25, alignItems:"flex-end", paddingRight: 6 },
  rpmBig: { color: theme.text, fontSize: scale(48), fontWeight:"800" },
  rpmSmall: { color: theme.textDim, fontSize: 12, marginTop:-6 },

  headerBlock: { marginTop: 10 },
  headerLeft: { marginBottom: 8 },
  trackLine: { color:"#A6A9BB", fontSize: 26, fontWeight:"700" },
  subLine:   { color:"#8C8F9A", fontSize: 20, fontWeight:"700", marginTop: 2 },
  driverLine:{ color:"#A7A7A7", fontSize: 34, fontWeight:"700", marginTop: 2 },

  topTilesRow: { flexDirection:"row", flexWrap: isLandscape ? "nowrap" : "wrap", gap: 12, marginTop: 8, alignItems:"stretch" },
  lapsTrackRow: { flexDirection:"row", padding: 12, gap: 18, justifyContent:"space-between" },
  lapsCol: { alignItems:"flex-start" },
  trackCol: { alignItems:"flex-end", flex:1 },
  deviceRow: { flexDirection:"row", alignItems:"center", justifyContent:"space-between", gap: 18, paddingHorizontal: 12, paddingVertical: 8 },

  tile: { flex:1, backgroundColor: theme.tileBody, borderRadius: 16, borderWidth: 2, borderColor: theme.border, padding: 10, minHeight: 80, justifyContent:"center", minWidth: isLandscape ? undefined : W * 0.45 },
  tileGreenOutline: { borderColor: theme.greenOK },
  tileGreenFill: { backgroundColor: theme.greenOK, borderColor: theme.greenOK },

  tileCaption: { color: theme.text, fontSize: 14, letterSpacing: 1, opacity: 0.9 },
  tileValueXL: { color: theme.text, fontSize: scale(36), fontWeight:"800" },
  okText: { fontSize: 36, fontWeight:"800" },

  stopBtn: { paddingHorizontal: scale(16), paddingVertical: scale(10), borderRadius: 16, borderWidth: 3, borderColor: theme.redStop, alignItems:"center", justifyContent:"center", minWidth: W * 0.22 },
  stopText: { color: theme.redStop, fontSize: scale(36), fontWeight:"900" },
  stopTextSmall: { color: theme.redStop, fontSize: scale(24), fontWeight:"900", marginTop:-6 },

  midRow: { flexDirection: isLandscape ? "row" : "column", gap: 14, marginTop: 14, flex: 1, justifyContent: "space-between" },

  leftCol: { flex:1, gap: 12 },
  centerCol: { flex: isLandscape ? 0.9 : 1, alignItems:"center", justifyContent:"center" },
  rightCol: { flex:1, gap: 12 },
  rightBottomRow: { flexDirection:"row", gap: 12 },

  timeBlock: { backgroundColor: theme.tileBody, borderRadius: 18, overflow:"hidden", borderWidth: 2, borderColor: theme.border },
  timeTitle: { backgroundColor: theme.tileTitle, paddingHorizontal: 18, paddingVertical: 8 },
  timeTitleText: { color: theme.text, fontSize: 20, fontWeight:"700", letterSpacing: 1 },
  timeValue: { paddingHorizontal: 18, paddingVertical: 18, backgroundColor: "#0C0E12" },
  timeValueText: { color: theme.text, fontSize: scale(54), fontWeight:"800" },

  speedBig: { color: theme.text, fontSize: scale(42), fontWeight:"800", textAlign:"center" },
  speedUnit: { color: theme.textDim, fontSize: 16, textAlign:"center", marginTop: -6 },

  gearLabel: { color: theme.textDim, fontSize: 18, marginBottom: -2, textAlign:"center" },
  gearBig: { color: theme.text, fontSize: scale(90), fontWeight:"900", textAlign:"center" },

  diffBig: { fontSize: scale(36), fontWeight:"800" },
  diffCaption: { color: theme.textDim, marginTop: 2 },

  currSectorCaption: { color:"#0B0B0B", fontSize: 14, fontWeight:"700" },
  currSectorBig: { color:"#0B0B0B", fontSize: scale(36), fontWeight:"900" },

  sectorsRow: { flexDirection:"row", alignItems:"center", gap: 12, marginTop: 10 },
  sectorWrap: { flex:1 },
  sectorLabel: { color:"#A6A9BB", fontSize: scale(22), fontWeight:"700", textAlign:"center", marginBottom: 6 },
  sectorTrack: { height: scale(18), borderRadius: scale(9), backgroundColor: "#3D3F4A" },
  sectorFill: { height: scale(18), borderRadius: scale(9) },
});