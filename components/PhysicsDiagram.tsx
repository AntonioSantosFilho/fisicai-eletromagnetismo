import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Svg, {
  Circle,
  Ellipse,
  G,
  Line,
  Path,
  Polygon,
  Rect,
  Text as SvgText,
} from "react-native-svg";

import { fontFamily, ui } from "@/components/StudyUI";
import { colors } from "@/constants";
import type { DiagramaFisico } from "@/hooks/useConteudoTeorico";

const ink = colors.text;
const blue = colors.primary;
const orange = "#946000";

function Arrow({
  x1,
  y1,
  x2,
  y2,
  color = blue,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
}) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const points = `${x2},${y2} ${x2 - 10 * Math.cos(angle - 0.42)},${y2 - 10 * Math.sin(angle - 0.42)} ${x2 - 10 * Math.cos(angle + 0.42)},${y2 - 10 * Math.sin(angle + 0.42)}`;
  return (
    <G>
      <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2.5} />
      <Polygon points={points} fill={color} />
    </G>
  );
}

function MagneticForce({ negative }: { negative: boolean }) {
  return (
    <>
      {[40, 110, 180, 250, 300].flatMap((x) =>
        [35, 85, 135].map((y) => (
          <G key={`${x}-${y}`} stroke="#A8BED0" strokeWidth={1.5}>
            <Line x1={x - 4} y1={y - 4} x2={x + 4} y2={y + 4} />
            <Line x1={x - 4} y1={y + 4} x2={x + 4} y2={y - 4} />
          </G>
        )),
      )}
      <Arrow x1={95} y1={85} x2={230} y2={85} />
      <Arrow x1={95} y1={85} x2={95} y2={negative ? 150 : 20} color={orange} />
      <Circle
        cx={95}
        cy={85}
        r={20}
        fill={negative ? colors.brandYellow : blue}
      />
      <SvgText
        x={95}
        y={92}
        fill={negative ? ink : "#FFF"}
        textAnchor="middle"
        fontSize={24}
      >
        {negative ? "−" : "+"}
      </SvgText>
      <SvgText x={206} y={72} fontSize={16} fill={blue}>
        v
      </SvgText>
      <SvgText x={109} y={negative ? 151 : 29} fontSize={16} fill={orange}>
        Fₘ
      </SvgText>
      <SvgText x={160} y={182} textAnchor="middle" fontSize={13} fill={ink}>
        × campo B entrando na tela
      </SvgText>
    </>
  );
}

function Coulomb({ opposite }: { opposite: boolean }) {
  return (
    <>
      <Line
        x1={82}
        y1={75}
        x2={238}
        y2={75}
        stroke="#A8BED0"
        strokeDasharray="4 4"
      />
      <SvgText x={160} y={51} textAnchor="middle" fontSize={15} fill={ink}>
        distância d
      </SvgText>
      <Circle cx={80} cy={75} r={25} fill={blue} />
      <Circle
        cx={240}
        cy={75}
        r={25}
        fill={opposite ? colors.brandYellow : blue}
      />
      <SvgText x={80} y={83} textAnchor="middle" fontSize={27} fill="#FFF">
        +
      </SvgText>
      <SvgText
        x={240}
        y={83}
        textAnchor="middle"
        fontSize={27}
        fill={opposite ? ink : "#FFF"}
      >
        {opposite ? "−" : "+"}
      </SvgText>
      <Arrow
        x1={80}
        y1={129}
        x2={opposite ? 135 : 25}
        y2={129}
        color={orange}
      />
      <Arrow
        x1={240}
        y1={129}
        x2={opposite ? 185 : 295}
        y2={129}
        color={orange}
      />
      <SvgText x={80} y={157} textAnchor="middle" fontSize={14} fill={orange}>
        F elétrica
      </SvgText>
      <SvgText x={240} y={157} textAnchor="middle" fontSize={14} fill={orange}>
        F elétrica
      </SvgText>
    </>
  );
}

function Induction({ withdrawing }: { withdrawing: boolean }) {
  return (
    <>
      <Rect
        x={24}
        y={64}
        width={43}
        height={39}
        fill={colors.brandYellow}
        rx={3}
      />
      <Rect x={67} y={64} width={43} height={39} fill={blue} rx={3} />
      <SvgText x={45} y={90} textAnchor="middle" fontSize={20} fill={ink}>
        S
      </SvgText>
      <SvgText x={89} y={90} textAnchor="middle" fontSize={20} fill="#FFF">
        N
      </SvgText>
      <Arrow
        x1={withdrawing ? 115 : 25}
        y1={133}
        x2={withdrawing ? 25 : 115}
        y2={133}
        color={ink}
      />
      <SvgText x={69} y={158} textAnchor="middle" fontSize={12} fill={ink}>
        movimento do ímã
      </SvgText>
      <Arrow x1={126} y1={84} x2={180} y2={84} />
      <SvgText x={156} y={108} textAnchor="middle" fontSize={11} fill={blue}>
        B externo
      </SvgText>
      {[214, 224, 234, 244].map((x) => (
        <Ellipse
          key={x}
          cx={x}
          cy={90}
          rx={12}
          ry={36}
          fill="none"
          stroke={orange}
          strokeWidth={2.4}
        />
      ))}
      <Arrow
        x1={229}
        y1={34}
        x2={withdrawing ? 289 : 169}
        y2={34}
        color={orange}
      />
      <SvgText x={229} y={16} textAnchor="middle" fontSize={13} fill={orange}>
        B induzido
      </SvgText>
      <SvgText
        x={193}
        y={95}
        textAnchor="middle"
        fontSize={15}
        fontWeight="bold"
        fill={orange}
      >
        {withdrawing ? "S" : "N"}
      </SvgText>
      <SvgText x={229} y={158} textAnchor="middle" fontSize={12} fill={ink}>
        bobina fechada
      </SvgText>
    </>
  );
}

function Wave({ shorter }: { shorter: boolean }) {
  const wavelength = shorter ? 64 : 128;
  const points = Array.from({ length: 141 }, (_, index) => {
    const x = 20 + index * 2;
    return `${index ? "L" : "M"}${x},${88 - 34 * Math.sin(((x - 20) * Math.PI * 2) / wavelength)}`;
  }).join(" ");
  const firstPeak = 20 + wavelength / 4;
  const secondPeak = firstPeak + wavelength;
  return (
    <>
      <Line x1={20} y1={88} x2={305} y2={88} stroke="#A8BED0" />
      <Arrow x1={20} y1={135} x2={20} y2={22} />
      <SvgText x={29} y={25} fontSize={15} fill={blue}>
        E
      </SvgText>
      <Path d={points} fill="none" stroke={blue} strokeWidth={2.5} />
      <Line
        x1={firstPeak}
        y1={54}
        x2={firstPeak}
        y2={143}
        stroke="#A8BED0"
        strokeDasharray="3 4"
      />
      <Line
        x1={secondPeak}
        y1={54}
        x2={secondPeak}
        y2={143}
        stroke="#A8BED0"
        strokeDasharray="3 4"
      />
      <Arrow x1={firstPeak} y1={143} x2={secondPeak} y2={143} color={orange} />
      <Arrow x1={secondPeak} y1={143} x2={firstPeak} y2={143} color={orange} />
      <SvgText
        x={(firstPeak + secondPeak) / 2}
        y={168}
        textAnchor="middle"
        fontSize={17}
        fill={orange}
      >
        λ
      </SvgText>
      <Arrow x1={253} y1={160} x2={302} y2={160} />
      <SvgText x={277} y={147} textAnchor="middle" fontSize={15} fill={blue}>
        c
      </SvgText>
    </>
  );
}

export default function PhysicsDiagram({ kind }: { kind: DiagramaFisico }) {
  const [variant, setVariant] = useState(0);
  const settings = {
    "forca-magnetica": {
      options: ["Carga positiva", "Carga negativa"],
      title: "O sinal da carga muda a direção",
      descriptions: [
        "Com a velocidade para a direita e B entrando na tela, a força sobre a carga positiva aponta para cima.",
        "Mantendo a mesma velocidade e o mesmo campo, a força sobre a carga negativa aponta para baixo.",
      ],
    },
    coulomb: {
      options: ["Mesmo sinal", "Sinais opostos"],
      title: "Atração ou repulsão?",
      descriptions: [
        "Cargas de mesmo sinal se repelem. As duas forças têm o mesmo módulo e sentidos opostos.",
        "Cargas de sinais opostos se atraem. As duas forças têm o mesmo módulo e sentidos opostos.",
      ],
    },
    inducao: {
      options: ["Aproximar ímã", "Afastar ímã"],
      title: "O que a lei de Lenz indica?",
      descriptions: [
        "Ao aproximar o polo norte, o fluxo externo aumenta. A bobina cria um campo induzido oposto à variação; sua face próxima atua como norte e repele o ímã.",
        "Ao afastar o polo norte, o fluxo externo diminui. A bobina cria um campo induzido que tende a manter esse fluxo; sua face próxima atua como sul e atrai o ímã.",
      ],
    },
    onda: {
      options: ["Maior λ", "Menor λ"],
      title: "Comprimento de onda e frequência",
      descriptions: [
        "A distância entre duas cristas é o comprimento de onda λ. Para a mesma velocidade c, um comprimento maior corresponde a uma frequência menor.",
        "Para a mesma velocidade c, reduzir o comprimento de onda aumenta a frequência. O desenho mostra um dos campos da onda se propagando para a direita.",
      ],
    },
  }[kind];
  return (
    <View
      style={[
        ui.card,
        {
          gap: 15,
          padding: 16,
          borderTopWidth: 3,
          borderTopColor: colors.brandBlue,
        },
      ]}
    >
      <Text
        style={{
          fontFamily,
          fontSize: 17,
          fontWeight: "700",
          color: colors.text,
        }}
      >
        {settings.title}
      </Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {settings.options.map((option, index) => (
          <Pressable
            key={option}
            testID={`diagram-option-${index}`}
            accessibilityRole="button"
            accessibilityState={{ selected: variant === index }}
            accessibilityLabel={option}
            onPress={() => setVariant(index)}
            style={{
              flex: 1,
              minHeight: 44,
              paddingHorizontal: 8,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 6,
              borderWidth: 1,
              borderColor: variant === index ? colors.primary : colors.border,
              backgroundColor: variant === index ? colors.primaryLight : "#FFF",
            }}
          >
            <Text
              style={{
                fontFamily,
                fontSize: 13,
                fontWeight: "600",
                color: colors.primary,
                textAlign: "center",
              }}
            >
              {option}
            </Text>
          </Pressable>
        ))}
      </View>
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={settings.descriptions[variant]}
      >
        <Svg
          width="100%"
          height={190}
          viewBox="0 0 320 190"
          accessible={false}
          aria-hidden
        >
          {kind === "forca-magnetica" ? (
            <MagneticForce negative={variant === 1} />
          ) : kind === "coulomb" ? (
            <Coulomb opposite={variant === 1} />
          ) : kind === "inducao" ? (
            <Induction withdrawing={variant === 1} />
          ) : (
            <Wave shorter={variant === 1} />
          )}
        </Svg>
      </View>
      <Text
        accessibilityLiveRegion="polite"
        style={[ui.body, { fontSize: 14, lineHeight: 22 }]}
      >
        {settings.descriptions[variant]}
      </Text>
      <Text style={{ fontFamily, fontSize: 12, color: colors.textMuted }}>
        Esquema didático, sem escala.
      </Text>
    </View>
  );
}
