import React, { forwardRef } from 'react';
import {
  CadDrawingData,
  EPSILON,
  SHEET_H,
  SHEET_W,
  fmtNum,
} from '../types/cad';

interface CadDrawingSvgProps {
  data: CadDrawingData;
  hasError: boolean;
}

interface Point2D {
  x: number;
  y: number;
}

function DimText({
  x,
  y,
  children,
  fontSize = 13,
  textAnchor = 'middle',
  transform,
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  fontSize?: number;
  textAnchor?: 'start' | 'middle' | 'end';
  transform?: string;
}) {
  return (
    <text
      x={x}
      y={y}
      fill="black"
      stroke="white"
      strokeWidth={5}
      paintOrder="stroke fill"
      style={{ paintOrder: 'stroke fill' }}
      strokeLinejoin="round"
      strokeLinecap="round"
      fontFamily="Segoe UI, Arial, sans-serif"
      fontWeight={700}
      fontSize={fontSize}
      textAnchor={textAnchor}
      transform={transform}
    >
      {children}
    </text>
  );
}

function Tick({ x, y, size = 5 }: { x: number; y: number; size?: number }) {
  return (
    <line
      x1={x - size}
      y1={y + size}
      x2={x + size}
      y2={y - size}
      stroke="red"
      strokeWidth={1.4}
    />
  );
}

function ArrowHead({
  tipX,
  tipY,
  dirX,
  dirY,
  color = 'red',
  len = 7,
  halfW = 2.6,
}: {
  tipX: number;
  tipY: number;
  dirX: number;
  dirY: number;
  color?: string;
  len?: number;
  halfW?: number;
}) {
  const mag = Math.hypot(dirX, dirY) || 1;
  const ux = dirX / mag;
  const uy = dirY / mag;
  const px = -uy;
  const py = ux;
  const baseX = tipX - ux * len;
  const baseY = tipY - uy * len;
  const p1x = baseX + px * halfW;
  const p1y = baseY + py * halfW;
  const p2x = baseX - px * halfW;
  const p2y = baseY - py * halfW;

  return (
    <polygon
      points={`${tipX.toFixed(2)},${tipY.toFixed(2)} ${p1x.toFixed(2)},${p1y.toFixed(2)} ${p2x.toFixed(2)},${p2y.toFixed(2)}`}
      fill={color}
    />
  );
}

function HorizontalDim({
  x1,
  x2,
  yDim,
  yRef1,
  yRef2,
  label,
  textPlacement = 'center',
  textYOffset = -7,
  fontSize = 13,
}: {
  x1: number;
  x2: number;
  yDim: number;
  yRef1: number;
  yRef2: number;
  label: string;
  textPlacement?: 'center' | 'left-outside' | 'right-outside';
  textYOffset?: number;
  fontSize?: number;
}) {
  const dir = yDim < yRef1 ? -1 : 1;
  let lineX1 = x1;
  let lineX2 = x2;
  if (textPlacement === 'left-outside') lineX1 = x1 - 36;
  if (textPlacement === 'right-outside') lineX2 = x2 + 36;

  let tx = (x1 + x2) / 2;
  let anchor: 'start' | 'middle' | 'end' = 'middle';
  if (textPlacement === 'left-outside') {
    tx = x1 - 12;
    anchor = 'end';
  } else if (textPlacement === 'right-outside') {
    tx = x2 + 12;
    anchor = 'start';
  }

  return (
    <g>
      <line
        x1={x1}
        y1={yRef1 + dir * 4}
        x2={x1}
        y2={yDim + dir * 7}
        stroke="red"
        strokeWidth={1}
      />
      <line
        x1={x2}
        y1={yRef2 + dir * 4}
        x2={x2}
        y2={yDim + dir * 7}
        stroke="red"
        strokeWidth={1}
      />
      <line
        x1={lineX1}
        y1={yDim}
        x2={lineX2}
        y2={yDim}
        stroke="red"
        strokeWidth={1.15}
      />
      <Tick x={x1} y={yDim} size={4.5} />
      <Tick x={x2} y={yDim} size={4.5} />
      <DimText
        x={tx}
        y={yDim + textYOffset}
        fontSize={fontSize}
        textAnchor={anchor}
      >
        {label}
      </DimText>
    </g>
  );
}

function VerticalDim({
  y1,
  y2,
  xDim,
  xRef1,
  xRef2,
  label,
  textSide = 'left',
  leaderY = null,
  fontSize = 13,
  rotated = true,
}: {
  y1: number;
  y2: number;
  xDim: number;
  xRef1: number;
  xRef2: number;
  label: string;
  textSide?: 'left' | 'leader-out';
  leaderY?: number | null;
  fontSize?: number;
  rotated?: boolean;
}) {
  const midY = (y1 + y2) / 2;
  const tx = xDim - 8;

  return (
    <g>
      <line
        x1={xRef1 - 4}
        y1={y1}
        x2={xDim - 7}
        y2={y1}
        stroke="red"
        strokeWidth={1}
      />
      <line
        x1={xRef2 - 4}
        y1={y2}
        x2={xDim - 7}
        y2={y2}
        stroke="red"
        strokeWidth={1}
      />
      <line
        x1={xDim}
        y1={y1}
        x2={xDim}
        y2={y2}
        stroke="red"
        strokeWidth={1.15}
      />
      <Tick x={xDim} y={y1} size={4.5} />
      <Tick x={xDim} y={y2} size={4.5} />

      {textSide === 'leader-out' && leaderY !== null ? (
        <>
          <polyline
            points={`${xDim},${midY} ${xDim - 14},${leaderY} ${xDim - 32},${leaderY}`}
            fill="none"
            stroke="red"
            strokeWidth={0.9}
          />
          <circle cx={xDim} cy={midY} r={2} fill="red" />
          <DimText x={xDim - 36} y={leaderY + 4} fontSize={fontSize} textAnchor="end">
            {label}
          </DimText>
        </>
      ) : rotated ? (
        <DimText
          x={tx}
          y={midY}
          fontSize={fontSize}
          textAnchor="middle"
          transform={`rotate(-90 ${tx} ${midY})`}
        >
          {label}
        </DimText>
      ) : (
        <DimText x={tx} y={midY + 4} fontSize={fontSize} textAnchor="end">
          {label}
        </DimText>
      )}
    </g>
  );
}

function RebaixoDetail({
  secX,
  secY,
  secW,
  secH,
  profVal,
  largVal,
}: {
  secX: number;
  secY: number;
  secW: number;
  secH: number;
  profVal: number;
  largVal: number;
}) {
  const ox = secX + 94;
  const oy = secY + 134;

  const p3 = (u: number, v: number, w: number): Point2D => ({
    x: ox + u * 0.866 + v * 0.866,
    y: oy - u * 0.46 + v * 0.48 - w,
  });

  const pts = (arr: Point2D[]) =>
    arr.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');

  const U = 108;
  const V1 = 34;
  const V2 = 66;
  const VT = 102;
  const H = 26;
  const D = 15;
  const WB = H - D;

  const frontFacePts = [
    p3(0, 0, H),
    p3(0, V1, H),
    p3(0, V1, WB),
    p3(0, V2, WB),
    p3(0, V2, H),
    p3(0, VT, H),
    p3(0, VT, 0),
    p3(0, 0, 0),
  ];

  const frontCurve = (
    vA: number,
    wA: number,
    vC: number,
    wC: number,
    vB: number,
    wB: number
  ) => {
    const A = p3(0, vA, wA);
    const C = p3(0, vC, wC);
    const B = p3(0, vB, wB);
    return `M ${A.x.toFixed(2)},${A.y.toFixed(2)} Q ${C.x.toFixed(2)},${C.y.toFixed(2)} ${B.x.toFixed(2)},${B.y.toFixed(2)}`;
  };

  const grainPaths = [
    frontCurve(0, 18, 12, 16, 20, 20),
    frontCurve(0, 9, 22, 12, 34, 6),
    frontCurve(34, 6, 48, 3, 56, 0),
    frontCurve(52, 11, 56, 5, 62, 0),
    frontCurve(68, 0, 74, 14, 88, 22),
    frontCurve(76, 0, 86, 10, 102, 13),
  ];

  // Profundidade callout geometry
  const profA1 = p3(U, V1, H);
  const profA2 = p3(U + 22, V1, H);
  const profB1 = p3(U, V1, WB);
  const profB2 = p3(U + 22, V1, WB);
  const profDimTop = p3(U + 16, V1, H);
  const profDimBot = p3(U + 16, V1, WB);
  const profLineTopY = profDimTop.y - 34;
  const profTextX = profDimTop.x - 6;
  const profTextY = profDimTop.y - 16;

  const pBoxX = secX + 54;
  const pBoxY = secY + 42;
  const pBoxW = 104;
  const pBoxH = 20;
  const pLeadStartX = pBoxX + pBoxW + 2;
  const pLeadStartY = pBoxY + pBoxH / 2;
  const pLeadMidX = pLeadStartX + 24;
  const pLeadTipX = profDimTop.x - 16;
  const pLeadTipY = profTextY - 3;

  // Largura callout geometry
  const largA1 = p3(U, V1, H);
  const largA2 = p3(U + 36, V1, H);
  const largB1 = p3(U, V2, H);
  const largB2 = p3(U + 36, V2, H);
  const largDimA = p3(U + 29, V1, H);
  const largDimB = p3(U + 29, V2, H);
  const lDirX = largDimB.x - largDimA.x;
  const lDirY = largDimB.y - largDimA.y;
  const largMidX = (largDimA.x + largDimB.x) / 2;
  const largMidY = (largDimA.y + largDimB.y) / 2;
  const largAngleDeg = Math.atan2(lDirY, lDirX) * (180 / Math.PI);
  const largTextX = largMidX + 4;
  const largTextY = largMidY - 5;

  const lBoxX = secX + 404;
  const lBoxY = secY + 58;
  const lBoxW = 74;
  const lBoxH = 20;
  const lLeadStartX = lBoxX - 2;
  const lLeadStartY = lBoxY + lBoxH / 2;
  const lLeadMidX = lLeadStartX - 18;
  const lLeadTipX = largMidX + 18;
  const lLeadTipY = largMidY - 6;

  return (
    <g>
      <rect
        x={secX}
        y={secY}
        width={secW}
        height={secH}
        fill="#ffffff"
        stroke="#000000"
        strokeWidth={1.2}
      />
      <text
        x={secX + 14}
        y={secY + 21}
        fill="#000000"
        fontFamily="Segoe UI, Arial, sans-serif"
        fontSize={12.5}
        fontWeight={700}
        letterSpacing={0.4}
      >
        DETALHE DO REBAIXO
      </text>
      <line
        x1={secX + 14}
        y1={secY + 29}
        x2={secX + secW - 14}
        y2={secY + 29}
        stroke="#cbd5e1"
        strokeWidth={1}
      />

      {/* 1. Aba superior esquerda */}
      <polygon
        points={pts([p3(0, 0, H), p3(U, 0, H), p3(U, V1, H), p3(0, V1, H)])}
        fill="#ffffff"
        stroke="#000000"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* 2. Parede interna do rasgo (AMARELO) */}
      <polygon
        points={pts([p3(0, V1, H), p3(U, V1, H), p3(U, V1, WB), p3(0, V1, WB)])}
        fill="#ffff00"
        stroke="#000000"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      {/* 3. Fundo plano do rasgo (AMARELO) */}
      <polygon
        points={pts([
          p3(0, V1, WB),
          p3(U, V1, WB),
          p3(U, V2, WB),
          p3(0, V2, WB),
        ])}
        fill="#ffff00"
        stroke="#000000"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      {/* 4. Aba superior direita */}
      <polygon
        points={pts([p3(0, V2, H), p3(U, V2, H), p3(U, VT, H), p3(0, VT, H)])}
        fill="#ffffff"
        stroke="#000000"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* 5. Face lateral direita */}
      <polygon
        points={pts([p3(0, VT, H), p3(U, VT, H), p3(U, VT, 0), p3(0, VT, 0)])}
        fill="#ffffff"
        stroke="#000000"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* 6. Face frontal-esquerda em perfil U */}
      <polygon
        points={pts(frontFacePts)}
        fill="#ffffff"
        stroke="#000000"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* 7. Linhas curvas de corte/ruptura */}
      {grainPaths.map((d, idx) => (
        <path
          key={idx}
          d={d}
          fill="none"
          stroke="#000000"
          strokeWidth={0.85}
          strokeLinecap="round"
        />
      ))}

      {/* Cota 1: Profundidade */}
      <line
        x1={profA1.x}
        y1={profA1.y}
        x2={profA2.x}
        y2={profA2.y}
        stroke="red"
        strokeWidth={1}
      />
      <line
        x1={profB1.x}
        y1={profB1.y}
        x2={profB2.x}
        y2={profB2.y}
        stroke="red"
        strokeWidth={1}
      />
      <line
        x1={profDimTop.x}
        y1={profLineTopY}
        x2={profDimBot.x}
        y2={profDimBot.y}
        stroke="red"
        strokeWidth={1.1}
      />
      <ArrowHead tipX={profDimTop.x} tipY={profDimTop.y} dirX={0} dirY={1} len={6.5} halfW={2.4} />
      <ArrowHead tipX={profDimBot.x} tipY={profDimBot.y} dirX={0} dirY={-1} len={6.5} halfW={2.4} />
      <text
        x={profTextX}
        y={profTextY}
        fill="#000000"
        fontFamily="Segoe UI, Arial, sans-serif"
        fontSize={11.5}
        fontWeight={700}
        textAnchor="middle"
        transform={`rotate(-90 ${profTextX} ${profTextY})`}
      >
        {`${fmtNum(profVal)}mm`}
      </text>

      <rect
        x={pBoxX}
        y={pBoxY}
        width={pBoxW}
        height={pBoxH}
        fill="#ffffff"
        stroke="red"
        strokeWidth={1}
      />
      <text
        x={pBoxX + pBoxW / 2}
        y={pBoxY + 14}
        fill="red"
        fontFamily="Segoe UI, Arial, sans-serif"
        fontSize={11}
        fontWeight={700}
        textAnchor="middle"
      >
        PROFUNDIDADE
      </text>
      <polyline
        points={`${pLeadStartX},${pLeadStartY} ${pLeadMidX},${pLeadStartY} ${pLeadTipX},${pLeadTipY}`}
        fill="none"
        stroke="red"
        strokeWidth={1}
      />
      <ArrowHead
        tipX={pLeadTipX}
        tipY={pLeadTipY}
        dirX={pLeadTipX - pLeadMidX}
        dirY={pLeadTipY - pLeadStartY}
        len={7}
        halfW={2.5}
      />

      {/* Cota 2: Largura */}
      <line
        x1={largA1.x}
        y1={largA1.y}
        x2={largA2.x}
        y2={largA2.y}
        stroke="red"
        strokeWidth={1}
      />
      <line
        x1={largB1.x}
        y1={largB1.y}
        x2={largB2.x}
        y2={largB2.y}
        stroke="red"
        strokeWidth={1}
      />
      <line
        x1={largDimA.x}
        y1={largDimA.y}
        x2={largDimB.x}
        y2={largDimB.y}
        stroke="red"
        strokeWidth={1.1}
      />
      <ArrowHead tipX={largDimA.x} tipY={largDimA.y} dirX={-lDirX} dirY={-lDirY} len={6.5} halfW={2.4} />
      <ArrowHead tipX={largDimB.x} tipY={largDimB.y} dirX={lDirX} dirY={lDirY} len={6.5} halfW={2.4} />
      <text
        x={largTextX}
        y={largTextY}
        fill="#000000"
        fontFamily="Segoe UI, Arial, sans-serif"
        fontSize={11.5}
        fontWeight={700}
        textAnchor="middle"
        transform={`rotate(${largAngleDeg.toFixed(2)} ${largTextX} ${largTextY})`}
      >
        {`${fmtNum(largVal)}mm`}
      </text>

      <rect
        x={lBoxX}
        y={lBoxY}
        width={lBoxW}
        height={lBoxH}
        fill="#ffffff"
        stroke="red"
        strokeWidth={1}
      />
      <text
        x={lBoxX + lBoxW / 2}
        y={lBoxY + 14}
        fill="red"
        fontFamily="Segoe UI, Arial, sans-serif"
        fontSize={11}
        fontWeight={700}
        textAnchor="middle"
      >
        LARGURA
      </text>
      <polyline
        points={`${lLeadStartX},${lLeadStartY} ${lLeadMidX},${lLeadStartY} ${lLeadTipX},${lLeadTipY}`}
        fill="none"
        stroke="red"
        strokeWidth={1}
      />
      <ArrowHead
        tipX={lLeadTipX}
        tipY={lLeadTipY}
        dirX={lLeadTipX - lLeadMidX}
        dirY={lLeadTipY - lLeadStartY}
        len={7}
        halfW={2.5}
      />
    </g>
  );
}

export const CadDrawingSvg = forwardRef<SVGSVGElement, CadDrawingSvgProps>(
  function CadDrawingSvg({ data, hasError }, ref) {
    const mL = 48;
    const mT = 28;
    const mR = SHEET_W - 28;
    const mB = SHEET_H - 28;

    const L = Math.max(1, Number.isFinite(data.compTotal) ? data.compTotal : 1220);
    const W = Math.max(1, Number.isFinite(data.larguraTotal) ? data.larguraTotal : 250);
    const T = Math.max(1, Number.isFinite(data.espessura) ? data.espessura : 18);
    const ME = Math.max(0, Number.isFinite(data.margemEsq) ? data.margemEsq : 0);
    const MD = Math.max(0, Number.isFinite(data.margemDir) ? data.margemDir : 0);
    const U = Math.max(0, Number.isFinite(data.compUsinagem) ? data.compUsinagem : 0);
    const df = Math.max(0, Number.isFinite(data.distFundo) ? data.distFundo : 0);
    const lr = Math.max(0.1, Number.isFinite(data.larguraRasgo) ? data.larguraRasgo : 17);
    const pr = Math.max(0.1, Number.isFinite(data.profundidade) ? data.profundidade : 12);

    const secX = mL + 16;
    const secY = mB - 224;
    const secW = 540;
    const secH = 208;

    const drawBoxX = mL + 145;
    const drawBoxY = mT + 125;
    const drawBoxW = mR - 65 - drawBoxX;
    const drawBoxH = secY - 46 - drawBoxY;

    const scale = Math.min(drawBoxW / L, drawBoxH / W);
    const pieceW = L * scale;
    const pieceH = W * scale;

    const pieceX = drawBoxX + (drawBoxW - pieceW) / 2;
    const pieceY = drawBoxY + (drawBoxH - pieceH) / 2;
    const approxRatio = Math.max(1, Math.round((4 / scale) * 10) / 10);

    const ux = pieceX + ME * scale;
    const uw = Math.min(U * scale, Math.max(0, pieceW - ME * scale));
    const uy = pieceY + df * scale;
    const uh = Math.min(lr * scale, Math.max(0, pieceH - df * scale));

    const yDimSub = pieceY - 28;
    const yDimTotal = pieceY - 64;
    const uEnd = ux + uw;
    const mePx = ux - pieceX;
    const mdPx = pieceX + pieceW - uEnd;

    const xDimSub = pieceX - 28;
    const xDimTotal = pieceX - 92;
    const dfPx = uy - pieceY;
    const lrPx = uh;
    const remVal = Math.max(0, W - df - lr);
    const remPx = pieceY + pieceH - (uy + uh);
    const useLeaderRasgo = lrPx < 26;

    const noteX = ux + uw / 2;
    const noteY = uy + uh;
    const calloutY = pieceY + pieceH + 34;
    const isThrough =
      data.pontaAPonta ||
      (ME <= EPSILON && MD <= EPSILON && Math.abs(U - L) <= EPSILON);

    const tbW = 470;
    const tbH = 145;
    const tbX = mR - tbW;
    const tbY = mB - tbH;
    const row1Y = tbY + 48;
    const row2Y = tbY + 96;
    const colSplit1 = tbX + 310;
    const colSplit2 = tbX + 165;

    const titleField = (
      x: number,
      y: number,
      label: string,
      value: string,
      valSize = 13
    ) => (
      <g>
        <text
          x={x + 10}
          y={y + 15}
          fill="#475569"
          fontFamily="Segoe UI, Arial, sans-serif"
          fontSize={9.5}
          fontWeight={700}
          letterSpacing={0.5}
        >
          {label}
        </text>
        <text
          x={x + 10}
          y={y + 36}
          fill="#000000"
          fontFamily="Segoe UI, Arial, sans-serif"
          fontSize={valSize}
          fontWeight={700}
        >
          {value}
        </text>
      </g>
    );

    return (
      <svg
        ref={ref}
        viewBox={`0 0 ${SHEET_W} ${SHEET_H}`}
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full block bg-white"
        role="img"
        aria-label={`Desenho técnico A4 paisagem da peça ${data.partName}`}
      >
        <defs>
          <linearGradient id="woodGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9c7148" />
            <stop offset="30%" stopColor="#855c37" />
            <stop offset="65%" stopColor="#a3774c" />
            <stop offset="100%" stopColor="#7d5430" />
          </linearGradient>
          <pattern
            id="woodGrain"
            width={160}
            height={44}
            patternUnits="userSpaceOnUse"
          >
            <rect width={160} height={44} fill="url(#woodGradient)" />
            <path
              d="M0,8 Q40,5 80,9 T160,8 M0,20 Q50,24 100,19 T160,21 M0,33 Q35,30 90,35 T160,33"
              fill="none"
              stroke="#523418"
              strokeWidth={1.2}
              opacity={0.24}
            />
            <path
              d="M0,14 Q60,12 120,15 T160,14 M0,27 Q45,29 110,26 T160,28 M0,40 Q55,38 115,41 T160,40"
              fill="none"
              stroke="#cfa57a"
              strokeWidth={0.9}
              opacity={0.18}
            />
          </pattern>
        </defs>

        {/* Fundo branco da folha */}
        <rect x={0} y={0} width={SHEET_W} height={SHEET_H} fill="#ffffff" />

        {/* Margem interna e externa ABNT */}
        <rect
          x={mL}
          y={mT}
          width={mR - mL}
          height={mB - mT}
          fill="none"
          stroke="#000000"
          strokeWidth={1.8}
        />
        <rect
          x={16}
          y={16}
          width={SHEET_W - 32}
          height={SHEET_H - 32}
          fill="none"
          stroke="#94a3b8"
          strokeWidth={0.7}
        />

        {/* Título da Vista Superior */}
        <text
          x={mL + 16}
          y={mT + 26}
          fill="#000000"
          fontFamily="Segoe UI, Arial, sans-serif"
          fontSize={15}
          fontWeight={700}
          letterSpacing={0.5}
        >
          VISTA SUPERIOR (PLANTA DE USINAGEM)
        </text>
        <text
          x={mL + 16}
          y={mT + 44}
          fill="#475569"
          fontFamily="Segoe UI, Arial, sans-serif"
          fontSize={11}
          fontWeight={600}
        >
          UNIDADES EM MILÍMETROS
        </text>
        <text
          x={mL + 165}
          y={mT + 44}
          fill="#475569"
          fontFamily="Segoe UI, Arial, sans-serif"
          fontSize={11}
          fontWeight={600}
        >
          {`| ESCALA APROX. 1:${fmtNum(approxRatio)}`}
        </text>

        {/* Peça de Madeira (2D) */}
        <rect
          x={pieceX}
          y={pieceY}
          width={pieceW}
          height={pieceH}
          fill="url(#woodGrain)"
          stroke="#000000"
          strokeWidth={1.6}
        />

        {/* Usinagem (2D) */}
        {uw > 0 && uh > 0 && (
          <g>
            <rect
              x={ux}
              y={uy}
              width={uw}
              height={uh}
              fill="yellow"
              fillOpacity={0.82}
              stroke="#ca8a04"
              strokeWidth={0.8}
            />
            <line
              x1={ux}
              y1={uy + uh / 2}
              x2={ux + uw}
              y2={uy + uh / 2}
              stroke="yellow"
              strokeWidth={3}
            />
          </g>
        )}

        {/* Aviso de erro dimensional na prancha */}
        {hasError && (
          <text
            x={pieceX + pieceW / 2}
            y={pieceY + pieceH + 22}
            fill="red"
            fontFamily="Segoe UI, Arial, sans-serif"
            fontSize={12}
            fontWeight={700}
            textAnchor="middle"
          >
            ⚠ ATENÇÃO: VERIFICAR ERRO DIMENSIONAL NO PAINEL DE CONTROLES
          </text>
        )}

        {/* Cotas Horizontais */}
        <HorizontalDim
          x1={pieceX}
          x2={pieceX + pieceW}
          yDim={yDimTotal}
          yRef1={pieceY}
          yRef2={pieceY}
          label={fmtNum(L)}
          fontSize={13.5}
          textYOffset={-8}
        />

        <HorizontalDim
          x1={ux}
          x2={uEnd}
          yDim={yDimSub}
          yRef1={uy}
          yRef2={uy}
          label={fmtNum(U)}
          fontSize={12.5}
          textPlacement="center"
          textYOffset={-7}
        />

        {ME > EPSILON && (
          <HorizontalDim
            x1={pieceX}
            x2={ux}
            yDim={yDimSub}
            yRef1={pieceY}
            yRef2={uy}
            label={fmtNum(ME)}
            fontSize={12}
            textPlacement={mePx < 30 ? 'left-outside' : 'center'}
            textYOffset={mePx < 30 ? 4 : -7}
          />
        )}

        {MD > EPSILON && (
          <HorizontalDim
            x1={uEnd}
            x2={pieceX + pieceW}
            yDim={yDimSub}
            yRef1={uy}
            yRef2={pieceY}
            label={fmtNum(MD)}
            fontSize={12}
            textPlacement={mdPx < 30 ? 'right-outside' : 'center'}
            textYOffset={mdPx < 30 ? 4 : -7}
          />
        )}

        {/* Cotas Verticais */}
        <VerticalDim
          y1={pieceY}
          y2={pieceY + pieceH}
          xDim={xDimTotal}
          xRef1={pieceX}
          xRef2={pieceX}
          label={fmtNum(W)}
          fontSize={13.5}
          rotated
        />

        {df > 0 && (
          <VerticalDim
            y1={pieceY}
            y2={uy}
            xDim={xDimSub}
            xRef1={pieceX}
            xRef2={ux}
            label={fmtNum(df)}
            fontSize={11.5}
            textSide={dfPx < 22 ? 'leader-out' : 'left'}
            leaderY={dfPx < 22 ? pieceY - 4 : null}
            rotated={dfPx >= 26}
          />
        )}

        <VerticalDim
          y1={uy}
          y2={uy + uh}
          xDim={xDimSub}
          xRef1={ux}
          xRef2={ux}
          label={fmtNum(lr)}
          fontSize={11.5}
          textSide={useLeaderRasgo ? 'leader-out' : 'left'}
          leaderY={useLeaderRasgo ? uy + uh / 2 : null}
          rotated={!useLeaderRasgo}
        />

        {remVal > EPSILON && (
          <VerticalDim
            y1={uy + uh}
            y2={pieceY + pieceH}
            xDim={xDimSub}
            xRef1={ux}
            xRef2={pieceX}
            label={fmtNum(remVal)}
            fontSize={11.5}
            textSide={remPx < 22 ? 'leader-out' : 'left'}
            leaderY={remPx < 22 ? pieceY + pieceH + 6 : null}
            rotated={remPx >= 26}
          />
        )}

        {/* Chamada da usinagem */}
        {uw > 0 && uh > 0 && (
          <g>
            <polyline
              points={`${noteX},${noteY} ${noteX},${calloutY} ${noteX + 20},${calloutY}`}
              fill="none"
              stroke="red"
              strokeWidth={1}
            />
            <circle cx={noteX} cy={noteY} r={2.5} fill="red" />
            <DimText x={noteX + 26} y={calloutY + 4} fontSize={11.5} textAnchor="start">
              {`USINAGEM P/ LED${isThrough ? ' (PASSANTE)' : ''}: ${fmtNum(U)} × ${fmtNum(lr)} (PROF. ${fmtNum(pr)})`}
            </DimText>
          </g>
        )}

        {/* Detalhe do Rebaixo Isométrico */}
        <RebaixoDetail
          secX={secX}
          secY={secY}
          secW={secW}
          secH={secH}
          profVal={pr}
          largVal={lr}
        />

        {/* Carimbo / Title Block */}
        <g>
          <rect
            x={tbX}
            y={tbY}
            width={tbW}
            height={tbH}
            fill="#ffffff"
            stroke="#000000"
            strokeWidth={1.8}
          />
          <line
            x1={tbX}
            y1={row1Y}
            x2={mR}
            y2={row1Y}
            stroke="#000000"
            strokeWidth={1.2}
          />
          <line
            x1={tbX}
            y1={row2Y}
            x2={mR}
            y2={row2Y}
            stroke="#000000"
            strokeWidth={1.2}
          />
          <line
            x1={colSplit1}
            y1={row1Y}
            x2={colSplit1}
            y2={mB}
            stroke="#000000"
            strokeWidth={1.2}
          />
          <line
            x1={colSplit2}
            y1={row2Y}
            x2={colSplit2}
            y2={mB}
            stroke="#000000"
            strokeWidth={1.2}
          />

          {titleField(tbX, tbY, 'NOME DA PEÇA', data.partName.slice(0, 48), 14)}
          {titleField(tbX, row1Y, 'MATERIAL', data.partMaterial.slice(0, 32), 13)}
          {titleField(colSplit1, row1Y, 'ESPESSURA', fmtNum(T), 13)}
          {titleField(
            tbX,
            row2Y,
            'DIMENSÕES (C × L)',
            `${fmtNum(L)} × ${fmtNum(W)}`,
            12.5
          )}
          {titleField(
            colSplit2,
            row2Y,
            'USINAGEM (L × P)',
            `${fmtNum(lr)} × ${fmtNum(pr)}`,
            12.5
          )}
          {titleField(colSplit1, row2Y, 'DATA', data.partDateBr, 12.5)}
        </g>
      </svg>
    );
  }
);
