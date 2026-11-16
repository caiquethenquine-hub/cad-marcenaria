export type FourParamKey = 'compTotal' | 'compUsinagem' | 'margemEsq' | 'margemDir';

export type NumericFieldKey =
  | 'compTotal'
  | 'larguraTotal'
  | 'espessura'
  | 'larguraRasgo'
  | 'profundidade'
  | 'distFundo'
  | 'compUsinagem'
  | 'margemEsq'
  | 'margemDir';

export interface CadFormState {
  partName: string;
  partMaterial: string;
  partDate: string; // YYYY-MM-DD
  compTotal: string;
  larguraTotal: string;
  espessura: string;
  larguraRasgo: string;
  profundidade: string;
  distFundo: string;
  pontaAPonta: boolean;
  compUsinagem: string;
  margemEsq: string;
  margemDir: string;
}

export interface CadDrawingData {
  partName: string;
  partMaterial: string;
  partDateBr: string;
  compTotal: number;
  larguraTotal: number;
  espessura: number;
  larguraRasgo: number;
  profundidade: number;
  distFundo: number;
  pontaAPonta: boolean;
  compUsinagem: number;
  margemEsq: number;
  margemDir: number;
}

export interface ValidationResult {
  data: CadDrawingData;
  hasError: boolean;
  message: string;
  errorFields: Set<NumericFieldKey>;
}

export const SHEET_W = 1188;
export const SHEET_H = 840;
export const EPSILON = 0.001;

export const FOUR_PARAM_KEYS: FourParamKey[] = [
  'compTotal',
  'compUsinagem',
  'margemEsq',
  'margemDir',
];

export function getTodayIso(): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function createInitialFormState(): CadFormState {
  return {
    partName: 'Prateleira LED Home - Ref. 8372',
    partMaterial: 'MDF Madeirado',
    partDate: getTodayIso(),
    compTotal: '1220',
    larguraTotal: '250',
    espessura: '18',
    larguraRasgo: '17',
    profundidade: '12',
    distFundo: '40',
    pontaAPonta: false,
    compUsinagem: '1200',
    margemEsq: '10',
    margemDir: '10',
  };
}

export function fmtNum(val: number): string {
  if (!Number.isFinite(val)) return '0';
  const rounded = Math.round(val * 100) / 100;
  return Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(2).replace(/\.?0+$/, '');
}

export function fmtDateBr(isoDate: string): string {
  if (!isoDate || !isoDate.includes('-')) {
    const fallback = getTodayIso().split('-');
    return `${fallback[2]}/${fallback[1]}/${fallback[0]}`;
  }
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

export function parseNum(raw: string): number {
  const trimmed = raw.trim();
  if (!trimmed) return NaN;
  const v = Number(trimmed);
  return Number.isFinite(v) ? v : NaN;
}

export function solveFourthParameter(
  form: CadFormState,
  autoParam: FourParamKey
): CadFormState {
  const L = parseNum(form.compTotal);

  if (form.pontaAPonta) {
    return {
      ...form,
      margemEsq: '0',
      margemDir: '0',
      compUsinagem: Number.isFinite(L) ? fmtNum(L) : form.compUsinagem,
    };
  }

  const U = parseNum(form.compUsinagem);
  const ME = parseNum(form.margemEsq);
  const MD = parseNum(form.margemDir);

  if (
    autoParam === 'compUsinagem' &&
    Number.isFinite(L) &&
    Number.isFinite(ME) &&
    Number.isFinite(MD)
  ) {
    return { ...form, compUsinagem: fmtNum(L - ME - MD) };
  }
  if (
    autoParam === 'margemEsq' &&
    Number.isFinite(L) &&
    Number.isFinite(U) &&
    Number.isFinite(MD)
  ) {
    return { ...form, margemEsq: fmtNum(L - U - MD) };
  }
  if (
    autoParam === 'margemDir' &&
    Number.isFinite(L) &&
    Number.isFinite(U) &&
    Number.isFinite(ME)
  ) {
    return { ...form, margemDir: fmtNum(L - U - ME) };
  }
  if (
    autoParam === 'compTotal' &&
    Number.isFinite(U) &&
    Number.isFinite(ME) &&
    Number.isFinite(MD)
  ) {
    return { ...form, compTotal: fmtNum(ME + U + MD) };
  }

  return form;
}

const NUMERIC_LABELS: Record<NumericFieldKey, string> = {
  compTotal: 'Comprimento Total',
  larguraTotal: 'Largura Total',
  espessura: 'Espessura da Peça',
  larguraRasgo: 'Largura do Rasgo',
  profundidade: 'Profundidade Rebaixo',
  distFundo: 'Distância do Fundo',
  compUsinagem: 'Comprimento da Usinagem',
  margemEsq: 'Margem Esquerda',
  margemDir: 'Margem Direita',
};

export function validateCadState(form: CadFormState): ValidationResult {
  const data: CadDrawingData = {
    partName: form.partName.trim() || 'Sem Nome',
    partMaterial: form.partMaterial.trim() || 'Não especificado',
    partDateBr: fmtDateBr(form.partDate),
    compTotal: parseNum(form.compTotal),
    larguraTotal: parseNum(form.larguraTotal),
    espessura: parseNum(form.espessura),
    larguraRasgo: parseNum(form.larguraRasgo),
    profundidade: parseNum(form.profundidade),
    distFundo: parseNum(form.distFundo),
    pontaAPonta: form.pontaAPonta,
    compUsinagem: parseNum(form.compUsinagem),
    margemEsq: parseNum(form.margemEsq),
    margemDir: parseNum(form.margemDir),
  };

  const errors: string[] = [];
  const errorFields = new Set<NumericFieldKey>();

  const numericKeys: NumericFieldKey[] = [
    'compTotal',
    'larguraTotal',
    'espessura',
    'larguraRasgo',
    'profundidade',
    'distFundo',
    'compUsinagem',
    'margemEsq',
    'margemDir',
  ];

  numericKeys.forEach((k) => {
    if (!Number.isFinite(data[k])) {
      errors.push(`Preencha um valor numérico válido para "${NUMERIC_LABELS[k]}".`);
      errorFields.add(k);
    }
  });

  if (errors.length === 0) {
    if (data.compTotal <= 0) {
      errors.push('O Comprimento Total deve ser maior que zero.');
      errorFields.add('compTotal');
    }
    if (data.larguraTotal <= 0) {
      errors.push('A Largura Total deve ser maior que zero.');
      errorFields.add('larguraTotal');
    }
    if (data.espessura <= 0) {
      errors.push('A Espessura deve ser maior que zero.');
      errorFields.add('espessura');
    }

    if (
      data.margemEsq < 0 ||
      data.margemDir < 0 ||
      data.compUsinagem < 0 ||
      data.margemEsq + data.compUsinagem + data.margemDir > data.compTotal + EPSILON
    ) {
      errors.push(
        'Erro dimensional: A soma das margens e usinagem ultrapassa o comprimento da peça!'
      );
      errorFields.add('compTotal');
      errorFields.add('compUsinagem');
      errorFields.add('margemEsq');
      errorFields.add('margemDir');
    }

    if (data.distFundo < 0 || data.larguraRasgo <= 0) {
      errors.push('A largura do rasgo deve ser > 0 e a distância do fundo ≥ 0.');
      errorFields.add('larguraRasgo');
      if (data.distFundo < 0) errorFields.add('distFundo');
    } else if (data.distFundo + data.larguraRasgo > data.larguraTotal + EPSILON) {
      errors.push(
        'Erro dimensional na largura: Distância do fundo + Largura do rasgo ultrapassa a Largura Total da peça!'
      );
      errorFields.add('distFundo');
      errorFields.add('larguraRasgo');
      errorFields.add('larguraTotal');
    }

    if (data.profundidade <= 0) {
      errors.push('A profundidade do rebaixo deve ser maior que zero.');
      errorFields.add('profundidade');
    } else if (data.profundidade >= data.espessura) {
      errors.push(
        'Atenção: A profundidade do rebaixo atinge ou ultrapassa a espessura da peça!'
      );
      errorFields.add('profundidade');
    }
  }

  const hasError = errors.length > 0;
  const message = hasError
    ? errors[0]
    : data.pontaAPonta
      ? `Geometria válida: Usinagem passante (${fmtNum(data.compTotal)})`
      : `Geometria válida: ${fmtNum(data.margemEsq)} + ${fmtNum(data.compUsinagem)} + ${fmtNum(data.margemDir)} = ${fmtNum(data.compTotal)}`;

  return { data, hasError, message, errorFields };
}
