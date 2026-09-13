import { ReportDm, ReportTotals } from '../../interfaces/reportTypes'

export const totalsConfig: Array<{
  label: string
  value: (totals: ReportTotals) => number
}> = [
  {
    label: 'Total de Mesas Concluídas',
    value: totals => totals.total_finished,
  },
  {
    label: 'Total de Mesas Deletadas',
    value: totals => totals.total_deleted,
  },
  {
    label: 'Total de Mesas em Andamento',
    value: totals => totals.total_ongoing,
  },
  {
    label: 'Total de Mesas Ativas (não em andamento)',
    value: totals => totals.total_active_not_ongoing,
  },
  {
    label: 'Total de Mesas em Andamento (sendo divulgadas)',
    value: totals => totals.total_ongoing_promoted,
  },
  {
    label: 'Total de Mesas Ativas (não em andamento, sendo divulgadas)',
    value: totals => totals.total_active_promoted_not_ongoing,
  },
]

export const dmColumns: Array<{
  key: keyof ReportDm
  header: string
  width: number
  legend: string
  format?: (value: ReportDm[keyof ReportDm], dm: ReportDm) => string
}> = [
  {
    key: 'dm_name',
    header: 'Mestre',
    width: 130,
    legend: 'Mestre: Nome do mestre',
    format: value =>
      String(value)
        .substring(0, 35)
        .replace(/[^\x00-\xFF]/g, '?'),
  },
  {
    key: 'active_tables',
    header: 'Mesas',
    width: 30,
    legend: 'Mesas: Total de mesas ativas',
    format: value => String(value),
  },
  {
    key: 'unique_players',
    header: 'Jog. Únicos',
    width: 42,
    legend: 'Jog. Únicos: Jogadores únicos em todas as mesas ativas',
    format: value => String(value),
  },
  {
    key: 'total_players',
    header: 'Total Jog.',
    width: 42,
    legend: 'Total Jog.: Total de ocorrências de jogadores em mesas ativas',
    format: value => String(value),
  },
  {
    key: 'ongoing_tables',
    header: 'Em And.',
    width: 30,
    legend: 'Em And.: Mesas em andamento',
    format: value => String(value),
  },
  {
    key: 'unique_players_ongoing',
    header: 'Jog. And.',
    width: 42,
    legend: 'Jog. And.: Jogadores únicos em mesas em andamento',
    format: value => String(value),
  },
  {
    key: 'total_players_ongoing',
    header: 'Total And.',
    width: 42,
    legend: 'Total And.: Total de ocorrências de jogadores em mesas em andamento',
    format: value => String(value),
  },
  {
    key: 'avg_ticket',
    header: 'Ticket Médio',
    width: 45,
    legend: 'Ticket Médio: Preço médio por mesa (apenas mesas em andamento)',
    format: value => `R$ ${Number(value).toFixed(2)}`,
  },
  {
    key: 'weighted_avg_ticket',
    header: 'Ticket Ponderado',
    width: 55,
    legend: 'Ticket Ponderado: Ticket médio ponderado por jogador em andamento (mesas quinzenais tem peso 0.5, semanais tem peso 1)',
    format: value => `R$ ${Number(value).toFixed(2)}`,
  },
  {
    key: 'monthly_value_estimate',
    header: 'Valor Mensal Est.',
    width: 65,
    legend: 'Valor Mensal Est.: Receita mensal estimada do mestre (mesas em andamento, jogadores pagantes, ajustado pela frequência)',
    format: value => `R$ ${Number(value).toFixed(2)}`,
  },
]
