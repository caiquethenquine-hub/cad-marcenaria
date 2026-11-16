import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Printer,
  RotateCcw,
} from 'lucide-react';
import {
  CadFormState,
  FourParamKey,
  NumericFieldKey,
  ValidationResult,
} from '../types/cad';

interface ControlsSidebarProps {
  form: CadFormState;
  autoParam: FourParamKey;
  validation: ValidationResult;
  isExporting: boolean;
  exportError: string | null;
  onTextChange: (key: 'partName' | 'partMaterial' | 'partDate', value: string) => void;
  onNumericChange: (key: NumericFieldKey, value: string) => void;
  onAutoSelect: (key: FourParamKey) => void;
  onTogglePontaAPonta: (checked: boolean) => void;
  onResetDefaults: () => void;
  onExportPdf: () => void;
  onPrint: () => void;
}

function AutoToggleButton({
  target,
  active,
  disabled,
  onClick,
}: {
  target: FourParamKey;
  active: boolean;
  disabled: boolean;
  onClick: (target: FourParamKey) => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onClick(target)}
      title={
        active
          ? 'Parâmetro calculado automaticamente'
          : 'Calcular este parâmetro automaticamente'
      }
      className={`px-1.5 py-0.5 text-[10px] font-bold tracking-wide rounded border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        active
          ? 'bg-blue-600 border-blue-600 text-white'
          : 'bg-white border-slate-300 text-slate-500 hover:border-blue-600 hover:text-blue-600'
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      AUTO
    </button>
  );
}

export const ControlsSidebar: React.FC<ControlsSidebarProps> = ({
  form,
  autoParam,
  validation,
  isExporting,
  exportError,
  onTextChange,
  onNumericChange,
  onAutoSelect,
  onTogglePontaAPonta,
  onResetDefaults,
  onExportPdf,
  onPrint,
}) => {
  const { hasError, message, errorFields } = validation;
  const through = form.pontaAPonta;

  const inputClass = (
    key: NumericFieldKey,
    opts?: { isAuto?: boolean; disabled?: boolean }
  ) => {
    const base =
      'w-full px-2.5 py-1.5 text-[13px] font-mono-num rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600';
    if (errorFields.has(key)) {
      return `${base} border-red-500 bg-red-50 text-red-900`;
    }
    if (opts?.disabled) {
      return `${base} border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed`;
    }
    if (opts?.isAuto) {
      return `${base} border-blue-500 bg-blue-50 text-blue-900 font-semibold`;
    }
    return `${base} border-slate-300 bg-white text-slate-900`;
  };

  return (
    <aside className="no-print bg-white border-r border-slate-200 flex flex-col min-h-0 overflow-y-auto">
      <div className="p-5 space-y-5 flex-1">
        {/* Grupo 1: Dados do Carimbo */}
        <section className="pb-5 border-b border-slate-200">
          <h2 className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-3">
            1. Dados do Carimbo
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 flex flex-col gap-1">
              <label
                htmlFor="partName"
                className="text-xs font-semibold text-slate-700"
              >
                Nome da Peça
              </label>
              <input
                id="partName"
                type="text"
                value={form.partName}
                onChange={(e) => onTextChange('partName', e.target.value)}
                className="w-full px-2.5 py-1.5 text-[13px] rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="partMaterial"
                className="text-xs font-semibold text-slate-700"
              >
                Material
              </label>
              <input
                id="partMaterial"
                type="text"
                value={form.partMaterial}
                onChange={(e) => onTextChange('partMaterial', e.target.value)}
                className="w-full px-2.5 py-1.5 text-[13px] rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="partDate"
                className="text-xs font-semibold text-slate-700"
              >
                Data
              </label>
              <input
                id="partDate"
                type="date"
                value={form.partDate}
                onChange={(e) => onTextChange('partDate', e.target.value)}
                className="w-full px-2.5 py-1.5 text-[13px] font-mono-num rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>
        </section>

        {/* Grupo 2: Dimensões da Peça */}
        <section className="pb-5 border-b border-slate-200">
          <h2 className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-3">
            2. Dimensões da Peça (mm)
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-1.5">
                <label
                  htmlFor="compTotal"
                  className="text-xs font-semibold text-slate-700"
                >
                  Comprimento Total
                </label>
                <AutoToggleButton
                  target="compTotal"
                  active={!through && autoParam === 'compTotal'}
                  disabled={through}
                  onClick={onAutoSelect}
                />
              </div>
              <input
                id="compTotal"
                type="number"
                step="any"
                min="1"
                value={form.compTotal}
                onChange={(e) => onNumericChange('compTotal', e.target.value)}
                className={inputClass('compTotal', {
                  isAuto: !through && autoParam === 'compTotal',
                })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="larguraTotal"
                className="text-xs font-semibold text-slate-700"
              >
                Largura Total
              </label>
              <input
                id="larguraTotal"
                type="number"
                step="any"
                min="1"
                value={form.larguraTotal}
                onChange={(e) => onNumericChange('larguraTotal', e.target.value)}
                className={inputClass('larguraTotal')}
              />
            </div>

            <div className="col-span-2 flex flex-col gap-1">
              <label
                htmlFor="espessura"
                className="text-xs font-semibold text-slate-700"
              >
                Espessura da Peça
              </label>
              <input
                id="espessura"
                type="number"
                step="any"
                min="1"
                value={form.espessura}
                onChange={(e) => onNumericChange('espessura', e.target.value)}
                className={inputClass('espessura')}
              />
            </div>
          </div>
        </section>

        {/* Grupo 3: Características da Usinagem (LED) */}
        <section className="pb-5 border-b border-slate-200">
          <h2 className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-3">
            3. Características da Usinagem (LED)
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="larguraRasgo"
                className="text-xs font-semibold text-slate-700"
              >
                Largura do Rasgo
              </label>
              <input
                id="larguraRasgo"
                type="number"
                step="any"
                min="0.1"
                value={form.larguraRasgo}
                onChange={(e) => onNumericChange('larguraRasgo', e.target.value)}
                className={inputClass('larguraRasgo')}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="profundidade"
                className="text-xs font-semibold text-slate-700"
              >
                Profundidade Rebaixo
              </label>
              <input
                id="profundidade"
                type="number"
                step="any"
                min="0.1"
                value={form.profundidade}
                onChange={(e) => onNumericChange('profundidade', e.target.value)}
                className={inputClass('profundidade')}
              />
            </div>

            <div className="col-span-2 flex flex-col gap-1">
              <label
                htmlFor="distFundo"
                className="text-xs font-semibold text-slate-700"
              >
                Distância do Fundo / Borda Sup.
              </label>
              <input
                id="distFundo"
                type="number"
                step="any"
                min="0"
                value={form.distFundo}
                onChange={(e) => onNumericChange('distFundo', e.target.value)}
                className={inputClass('distFundo')}
              />
            </div>
          </div>
        </section>

        {/* Grupo 4: Posicionamento Longitudinal */}
        <section className="pb-4">
          <h2 className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-3">
            4. Posicionamento Longitudinal
          </h2>

          <label
            htmlFor="pontaAPonta"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md border border-slate-300 bg-slate-50 hover:border-blue-600 cursor-pointer transition-colors mb-2.5"
          >
            <input
              id="pontaAPonta"
              type="checkbox"
              checked={form.pontaAPonta}
              onChange={(e) => onTogglePontaAPonta(e.target.checked)}
              className="w-4 h-4 accent-blue-600 cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-800 select-none">
              Usinagem de ponta a ponta
            </span>
          </label>

          <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
            Insira <strong className="text-slate-700">3 dos 4</strong> valores
            (Comprimento Total, Comp. Usinagem, Margem Esq., Margem Dir.). O
            campo <strong className="text-slate-700">AUTO</strong> é calculado
            automaticamente.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 flex flex-col gap-1">
              <div className="flex items-center justify-between gap-1.5">
                <label
                  htmlFor="compUsinagem"
                  className="text-xs font-semibold text-slate-700"
                >
                  Comprimento da Usinagem
                </label>
                <AutoToggleButton
                  target="compUsinagem"
                  active={!through && autoParam === 'compUsinagem'}
                  disabled={through}
                  onClick={onAutoSelect}
                />
              </div>
              <input
                id="compUsinagem"
                type="number"
                step="any"
                min="0"
                disabled={through}
                value={form.compUsinagem}
                onChange={(e) => onNumericChange('compUsinagem', e.target.value)}
                className={inputClass('compUsinagem', {
                  isAuto: !through && autoParam === 'compUsinagem',
                  disabled: through,
                })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-1.5">
                <label
                  htmlFor="margemEsq"
                  className="text-xs font-semibold text-slate-700"
                >
                  Margem Esquerda
                </label>
                <AutoToggleButton
                  target="margemEsq"
                  active={!through && autoParam === 'margemEsq'}
                  disabled={through}
                  onClick={onAutoSelect}
                />
              </div>
              <input
                id="margemEsq"
                type="number"
                step="any"
                min="0"
                disabled={through}
                value={form.margemEsq}
                onChange={(e) => onNumericChange('margemEsq', e.target.value)}
                className={inputClass('margemEsq', {
                  isAuto: !through && autoParam === 'margemEsq',
                  disabled: through,
                })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-1.5">
                <label
                  htmlFor="margemDir"
                  className="text-xs font-semibold text-slate-700"
                >
                  Margem Direita
                </label>
                <AutoToggleButton
                  target="margemDir"
                  active={!through && autoParam === 'margemDir'}
                  disabled={through}
                  onClick={onAutoSelect}
                />
              </div>
              <input
                id="margemDir"
                type="number"
                step="any"
                min="0"
                disabled={through}
                value={form.margemDir}
                onChange={(e) => onNumericChange('margemDir', e.target.value)}
                className={inputClass('margemDir', {
                  isAuto: !through && autoParam === 'margemDir',
                  disabled: through,
                })}
              />
            </div>
          </div>
        </section>

        {/* Validação Dimensional */}
        <div
          role="status"
          aria-live="polite"
          className={`flex items-start gap-2.5 px-3 py-2.5 rounded-md border text-xs font-semibold leading-snug ${
            hasError
              ? 'bg-red-50 border-red-300 text-red-800'
              : 'bg-emerald-50 border-emerald-300 text-emerald-800'
          }`}
        >
          {hasError ? (
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          )}
          <span className="font-mono-num">{message}</span>
        </div>

        {exportError && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-md border border-red-300 bg-red-50 text-xs text-red-800 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{exportError}</span>
          </div>
        )}
      </div>

      {/* Ações no Rodapé da Barra Lateral */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2.5 shrink-0">
        <button
          type="button"
          onClick={onExportPdf}
          disabled={isExporting}
          className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:translate-y-px rounded-lg flex items-center justify-center gap-2 transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-wait cursor-pointer"
        >
          <Download className="w-4 h-4 shrink-0" />
          {isExporting ? 'Gerando PDF A4 Paisagem...' : 'Exportar PDF'}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onPrint}
            className="py-2 px-3 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-md flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 shrink-0" />
            Imprimir A4
          </button>
          <button
            type="button"
            onClick={onResetDefaults}
            className="py-2 px-3 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-md flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            Restaurar Padrão
          </button>
        </div>
      </div>
    </aside>
  );
};
