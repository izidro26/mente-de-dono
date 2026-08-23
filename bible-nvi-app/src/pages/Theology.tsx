import { Link } from 'react-router-dom'
import { THEOLOGY_LOCI } from '../data/theology'
import { PageHeader } from '../components/ui/PageHeader'

export function Theology() {
  return (
    <div className="animate-fade-in">
      <PageHeader title="Estudos" subtitle="Teologia sistemática, em profundidade" />
      <div className="space-y-3 p-4">
        <div className="rounded-2xl border border-border bg-surface-2 p-4 text-sm text-text-muted">
          Uma seção mais densa que o resto do app: os grandes temas ("loci") da teologia sistemática,
          com as principais posições de diferentes tradições cristãs lado a lado — sem apontar uma
          como "a certa". Ótimo para quem já leu a Bíblia e quer ir mais fundo.
        </div>

        <ul className="space-y-2">
          {THEOLOGY_LOCI.map((locus) => (
            <li key={locus.id}>
              <Link
                to={`/estudos/${locus.id}`}
                className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm transition hover:border-accent"
              >
                <span className="text-2xl leading-none">{locus.emoji}</span>
                <div>
                  <p className="font-semibold">{locus.title}</p>
                  <p className="text-sm text-text-muted">{locus.subtitle}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
