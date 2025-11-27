export interface INewGameInputData {
  nome_mesa: string;
  mestre: string;
  vagas_totais: number;
  vagas_staff?: number;
  canal_texto: string;
  canal_voz: string;
  role: string;
  frequencia: string;
  dia_da_semana: string;
  horario: string;
  valor: number;
  data_primeira_sessao: string;
}