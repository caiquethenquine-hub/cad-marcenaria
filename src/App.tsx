import { useMemo, useRef, useState } from 'react';
import { CadDrawingSvg } from './components/CadDrawingSvg';
import { ControlsSidebar } from './components/ControlsSidebar';
import {
  CadFormState,
  FOUR_PARAM_KEYS,
  FourParamKey,
  NumericFieldKey,
  createInitialFormState,
  fmtNum,
  parseNum,
  solveFourthParameter,
  validateCadState,
} from './types/cad';
import { exportCadDrawingToPdf } from './utils/pdfExport';

function isFourParamKey(key: NumericFieldKey): key is FourParamKey {
  return (FOUR_PARAM_KEYS as string[]).includes(key);
}

export default function App() {
  const [form, setForm] = useState<CadFormState>(() => createInitialFormState());
  const [autoParam, setAutoParam] = useState<FourParamKey>('compUsinagem');
  const [editHistory, setEditHistory] = useState<FourParamKey[]>([
    'compTotal',
    'margemEsq',
    'margemDir',
    'compUsinagem',
  ]);
  const [savedMargins, setSavedMargins] = useState<{ me: number; md: number }>({
    me: 10,
    md: 10,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const validation = useMemo(() => validateCadState(form), [form]);
  const { data, hasError } = validation;

  const handleTextChange = (
    key: 'partName' | 'partMaterial' | 'partDate',
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNumericChange = (key: NumericFieldKey, value: string) => {
    if (!isFourParamKey(key)) {
      setForm((prev) => ({ ...prev, [key]: value }));
      return;
    }

    if (form.pontaAPonta) {
      setForm((prev) => solveFourthParameter({ ...prev, [key]: value }, autoParam));
      return;
    }

    let nextAuto = autoParam;
    let nextHistory = editHistory;

    if (key === autoParam) {
      const candidate = editHistory.find((k) => k !== key);
      if (candidate) {
        nextAuto = candidate;
        setAutoParam(candidate);
      }
    }

    nextHistory = [
      nextAuto,
      ...nextHistory.filter((k) => k !== nextAuto && k !== key),
      ...(key !== nextAuto ? [key] : []),
    ];
    setEditHistory(nextHistory);

    setForm((prev) =>
      solveFourthParameter({ ...prev, [key]: value }, nextAuto)
    );
  };

  const handleAutoSelect = (target: FourParamKey) => {
    if (form.pontaAPonta) return;
    setAutoParam(target);
    setEditHistory((prev) => [target, ...prev.filter((k) => k !== target)]);
    setForm((prev) => solveFourthParameter(prev, target));
  };

  const handleTogglePontaAPonta = (checked: boolean) => {
    if (checked) {
      const meVal = parseNum(form.margemEsq);
      const mdVal = parseNum(form.margemDir);
      setSavedMargins({
        me: Number.isFinite(meVal) ? meVal : 10,
        md: Number.isFinite(mdVal) ? mdVal : 10,
      });
      setForm((prev) =>
        solveFourthParameter({ ...prev, pontaAPonta: true }, autoParam)
      );
    } else {
      const nextAuto: FourParamKey = 'compUsinagem';
      setAutoParam(nextAuto);
      setForm((prev) =>
        solveFourthParameter(
          {
            ...prev,
            pontaAPonta: false,
            margemEsq: fmtNum(savedMargins.me),
            margemDir: fmtNum(savedMargins.md),
          },
          nextAuto
        )
      );
    }
  };

  const handleResetDefaults = () => {
    setAutoParam('compUsinagem');
    setEditHistory(['compTotal', 'margemEsq', 'margemDir', 'compUsinagem']);
    setSavedMargins({ me: 10, md: 10 });
    setExportError(null);
    setForm(createInitialFormState());
  };

  const handleExportPdf = async () => {
    if (!svgRef.current) return;
    setExportError(null);
    setIsExporting(true);
    try {
      await exportCadDrawingToPdf(svgRef.current, form.partName);
    } catch (err) {
      setExportError(
        err instanceof Error
          ? `Falha ao gerar PDF: ${err.message}`
          : 'Ocorreu um erro ao gerar o PDF.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-slate-100 text-slate-900 lg:overflow-hidden">
      {/* Cabeçalho Superior */}
      <header className="no-print bg-slate-900 text-white px-5 py-3 flex items-center justify-between gap-6 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-sm sm:text-base font-bold tracking-tight whitespace-nowrap shrink-0">
            CAD Marcenaria
          </h1>
          <span className="hidden sm:inline text-slate-500" aria-hidden="true">
            ·
          </span>
          <span className="hidden sm:inline text-xs text-slate-300 font-medium truncate">
            Desenho Técnico Paramétrico (A4 Paisagem ABNT)
          </span>
        </div>

        <div className="text-xs text-slate-300 font-mono-num whitespace-nowrap shrink-0">
          {`Peça: ${fmtNum(data.compTotal)} × ${fmtNum(data.larguraTotal)} × ${fmtNum(data.espessura)}`}
          <span className="mx-2 text-slate-500" aria-hidden="true">
            ·
          </span>
          {`Usinagem: ${fmtNum(data.compUsinagem)} × ${fmtNum(data.larguraRasgo)} (Prof. ${fmtNum(data.profundidade)})`}
        </div>
      </header>

      {/* Área de Trabalho Duas Colunas */}
      <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[390px_1fr]">
        <ControlsSidebar
          form={form}
          autoParam={autoParam}
          validation={validation}
          isExporting={isExporting}
          exportError={exportError}
          onTextChange={handleTextChange}
          onNumericChange={handleNumericChange}
          onAutoSelect={handleAutoSelect}
          onTogglePontaAPonta={handleTogglePontaAPonta}
          onResetDefaults={handleResetDefaults}
          onExportPdf={handleExportPdf}
          onPrint={handlePrint}
        />

        {/* Coluna Direita: Prévia A4 Paisagem */}
        <section className="print-canvas-wrap drafting-grid-bg p-4 sm:p-6 flex items-center justify-center overflow-auto min-h-[480px]">
          <div className="a4-print-sheet relative w-full max-w-[1120px] aspect-[297/210] bg-white shadow-xl border border-slate-300 overflow-hidden shrink-0">
            {/* Bússola do Projetista — oculta na impressão e fora do SVG exportado */}
            <div className="no-print absolute top-4 right-5 bg-white/95 border border-slate-300 rounded px-2.5 py-1 text-[11px] font-semibold text-slate-800 shadow-sm pointer-events-none z-10 flex items-center gap-2.5 whitespace-nowrap">
              <span className="inline-flex items-center gap-1">
                <span
                  className="inline-block w-2.5 h-2.5 bg-yellow-300 border border-amber-500"
                  aria-hidden="true"
                />
                Amarelo: Usinagem
              </span>
              <span className="text-slate-300" aria-hidden="true">
                |
              </span>
              <span className="inline-flex items-center gap-1">
                <span
                  className="inline-block w-2.5 h-2.5 bg-red-600"
                  aria-hidden="true"
                />
                Vermelho: Linhas de Cota
              </span>
              <span className="text-slate-300" aria-hidden="true">
                |
              </span>
              <span className="inline-flex items-center gap-1">
                <span
                  className="inline-block w-2.5 h-2.5 bg-slate-950"
                  aria-hidden="true"
                />
                Preto: Valores e Contornos
              </span>
            </div>

            <CadDrawingSvg ref={svgRef} data={data} hasError={hasError} />
          </div>
        </section>
      </main>
    </div>
  );
}
