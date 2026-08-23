import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AVAILABLE_VERSIONS, useSettingsStore, type FontSize, type ThemeMode } from '../store/useSettingsStore'
import { db } from '../lib/db'
import { PageHeader } from '../components/ui/PageHeader'

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Claro' },
  { value: 'sepia', label: 'Sépia' },
  { value: 'dark', label: 'Escuro' },
  { value: 'system', label: 'Sistema' },
]

const FONT_OPTIONS: { value: FontSize; label: string }[] = [
  { value: 'sm', label: 'A' },
  { value: 'md', label: 'A' },
  { value: 'lg', label: 'A' },
  { value: 'xl', label: 'A' },
]

export function Settings() {
  const s = useSettingsStore()
  const [clearing, setClearing] = useState(false)
  const [cleared, setCleared] = useState(false)

  async function clearCache() {
    setClearing(true)
    try {
      await db.chapters.clear()
    } finally {
      setClearing(false)
      setCleared(true)
      setTimeout(() => setCleared(false), 2000)
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="Ajustes" />
      <div className="space-y-6 p-4">
        <Section title="Aparência">
          <FieldRow label="Tema">
            <SegmentedControl
              options={THEME_OPTIONS}
              value={s.theme}
              onChange={s.setTheme}
            />
          </FieldRow>
          <p className="text-xs text-text-muted">
            "Sépia" imita papel — costuma ser mais confortável para sessões de leitura longas.
          </p>
          <FieldRow label="Tamanho da fonte">
            <div className="flex gap-1">
              {FONT_OPTIONS.map((opt, i) => (
                <button
                  key={opt.value}
                  onClick={() => s.setFontSize(opt.value)}
                  style={{ fontSize: `${0.75 + i * 0.15}rem` }}
                  className={`h-9 w-9 rounded-lg border font-semibold ${
                    s.fontSize === opt.value ? 'border-accent bg-accent-soft text-accent' : 'border-border'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </FieldRow>
        </Section>

        <Section title="Tradução">
          <FieldRow label="Versão principal">
            <select
              value={s.version}
              onChange={(e) => s.setVersion(e.target.value)}
              className="rounded-lg border border-border bg-bg px-2 py-1.5 text-sm"
            >
              {AVAILABLE_VERSIONS.map((v) => (
                <option key={v.code} value={v.code}>
                  {v.label}
                </option>
              ))}
            </select>
          </FieldRow>
          <p className="text-xs text-text-muted">
            Padrão: NVI (Nova Versão Internacional). O texto é obtido em tempo real e fica salvo no seu
            dispositivo após a primeira leitura de cada capítulo.
          </p>
        </Section>

        <Section title="Provedor do texto bíblico">
          <FieldRow label="URL da API">
            <input
              value={s.apiBase}
              onChange={(e) => s.setApiBase(e.target.value)}
              className="w-44 rounded-lg border border-border bg-bg px-2 py-1.5 text-xs"
            />
          </FieldRow>
          <FieldRow label="Token de acesso">
            <input
              type="password"
              value={s.apiToken}
              onChange={(e) => s.setApiToken(e.target.value)}
              placeholder="opcional"
              className="w-44 rounded-lg border border-border bg-bg px-2 py-1.5 text-xs"
            />
          </FieldRow>
          <p className="text-xs text-text-muted">
            Por padrão o app usa a API pública e gratuita "A Bíblia Digital". Se ela exigir um token no
            seu caso, solicite um gratuitamente no site deles e cole aqui.
          </p>
        </Section>

        <Section title="Inteligência artificial (opcional)">
          <FieldRow label="Chave da API Anthropic">
            <input
              type="password"
              value={s.aiApiKey}
              onChange={(e) => s.setAiApiKey(e.target.value)}
              placeholder="sk-ant-…"
              className="w-44 rounded-lg border border-border bg-bg px-2 py-1.5 text-xs"
            />
          </FieldRow>
          <FieldRow label="Modelo">
            <input
              value={s.aiModel}
              onChange={(e) => s.setAiModel(e.target.value)}
              className="w-44 rounded-lg border border-border bg-bg px-2 py-1.5 text-xs"
            />
          </FieldRow>
          <p className="text-xs text-text-muted">
            Com uma chave configurada, você desbloqueia explicações de versículos por IA. A chave fica
            salva apenas neste dispositivo e as requisições vão diretamente do seu navegador para a
            Anthropic — o Verbo não tem servidor próprio nem vê sua chave.
          </p>
        </Section>

        <Section title="Leitura em voz alta">
          <FieldRow label={`Velocidade: ${s.ttsRate.toFixed(1)}x`}>
            <input
              type="range"
              min={0.5}
              max={1.8}
              step={0.1}
              value={s.ttsRate}
              onChange={(e) => s.setTtsRate(parseFloat(e.target.value))}
            />
          </FieldRow>
        </Section>

        <Section title="Dados offline">
          <Link
            to="/downloads"
            className="block rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-surface-2"
          >
            Gerenciar downloads offline →
          </Link>
          <button
            onClick={clearCache}
            disabled={clearing}
            className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-sm font-medium text-rose-500 hover:bg-rose-500/5 disabled:opacity-50"
          >
            {cleared ? 'Cache limpo ✓' : 'Limpar capítulos baixados'}
          </button>
        </Section>

        <p className="pt-2 text-center text-xs text-text-muted">
          Verbo — Bíblia NVI Inteligente. Seus dados de leitura, notas e destaques ficam só no seu
          dispositivo.
        </p>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{title}</p>
      <div className="space-y-2 rounded-2xl border border-border bg-surface p-3">{children}</div>
    </section>
  )
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm">{label}</span>
      {children}
    </div>
  )
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex rounded-lg border border-border p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded-md px-2.5 py-1 text-xs font-medium ${
            value === opt.value ? 'bg-accent text-bg' : 'text-text-muted'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
