export const INVITE_COMMAND = {
  name: 'convite',
  description: 'Obtém o link de convite do bot.',
}

export const CREATE_TABLE_COMMAND = {
  name: 'abrir-mesa',
  description: 'Cria uma nova mesa de RPG.',
  options: [
    {
      type: 3,
      name: 'nome_mesa',
      description: 'Crie um nome para a mesa.',
      required: true,
    },
    {
      type: 8,
      name: 'role',
      description: 'Selecione o cargo da mesa.',
      required: true,
      autocomplete: true,
    },
    {
      type: 7,
      name: 'canal_texto',
      description: 'Canal de texto da mesa.',
      channel_types: [0],
      required: true,
      autocomplete: true,
    },
    {
      type: 7,
      name: 'canal_voz',
      description: 'Canal de voz da mesa.',
      channel_types: [2],
      required: true,
      autocomplete: true,
    },
    {
      type: 6,
      name: 'mestre',
      description: 'Selecione o mestre da mesa.',
      required: true,
      autocomplete: true,
    },
    {
      type: 3,
      name: 'dia_da_semana',
      description: 'Dia da semana em que a mesa ocorre.',
      required: true,
      autocomplete: true,
    },
    {
      type: 3,
      name: 'horario',
      description: 'Horário da mesa (formato HH:mm).',
      required: true,
    },
    {
      type: 4,
      name: 'vagas_totais',
      description: 'Número total de vagas disponíveis.',
      required: true,
      min_value: 1,
    },
    {
      type: 10,
      name: 'valor',
      description: 'Valor da mesa em reais (use 0 para gratuita).',
      required: true,
      min_value: 0,
    },
    {
      type: 3,
      name: 'frequencia',
      description: 'Frequência da mesa.',
      required: true,
      autocomplete: true,
    },
    {
      type: 3,
      name: 'data_primeira_sessao',
      description:
        'Informe o dia da primeira sessão da mesa (mesmo dia da semana estipulado anteriormente).',
      required: true,
    },
    {
      type: 4,
      name: 'vagas_staff',
      description: 'Número total de vagas disponíveis para Staff.',
      min_value: 0,
    },
  ],
}

export const EDIT_TABLE_COMMAND = {
  name: 'editar-mesa',
  description: 'Editar uma mesa de RPG.',
  options: [
    {
      type: 10,
      name: 'mesa',
      description: 'Selecione a mesa a editar.',
      autocomplete: true,
      required: true,
    },
    {
      type: 3,
      name: 'nome_mesa',
      description: 'Crie um nome para a mesa.',
    },
    {
      type: 8,
      name: 'role',
      description: 'Selecione o cargo da mesa.',
      autocomplete: true,
    },
    {
      type: 7,
      name: 'canal_texto',
      description: 'Canal de texto da mesa.',
      channel_types: [0],
      autocomplete: true,
    },
    {
      type: 7,
      name: 'canal_voz',
      description: 'Canal de voz da mesa.',
      channel_types: [2],
      autocomplete: true,
    },
    {
      type: 6,
      name: 'mestre',
      description: 'Selecione o mestre da mesa.',
      autocomplete: true,
    },
    {
      type: 3,
      name: 'dia_da_semana',
      description: 'Dia da semana em que a mesa ocorre.',
      autocomplete: true,
    },
    {
      type: 3,
      name: 'horario',
      description: 'Horário da mesa (formato HH:mm).',
    },
    {
      type: 4,
      name: 'vagas_totais',
      description: 'Número total de vagas disponíveis.',
      min_value: 0,
    },
    {
      type: 10,
      name: 'valor',
      description: 'Valor da mesa em reais (use 0 para gratuita).',
      min_value: 0,
    },
    {
      type: 3,
      name: 'frequencia',
      description: 'Frequência da mesa.',
      autocomplete: true,
    },
    {
      type: 3,
      name: 'data_primeira_sessao',
      description:
        'Informe o dia da primeira sessão da mesa (mesmo dia da semana estipulado anteriormente).',
    },
    {
      type: 4,
      name: 'vagas_staff',
      description: 'Número total de vagas disponíveis para Staff.',
      min_value: 0,
    },
  ],
}

export const DELETE_TABLE_COMMAND = {
  name: 'deletar-mesa',
  description: 'Deleta uma mesa de RPG.',
  options: [
    {
      type: 10,
      name: 'mesa',
      description: 'Selecione a mesa a editar.',
      autocomplete: true,
      required: true,
    },
  ],
}

export const GET_TABLE_COMMAND = {
  name: 'informacoes-mesa',
  description: 'Recuperar informações de uma mesa de RPG.',
  options: [
    {
      type: 10,
      name: 'mesa',
      description: 'Selecione a mesa para visualizar as informações.',
      autocomplete: true,
      required: true,
    },
  ],
}

export const CREATE_JOIN_ORIGIN_COMMAND = {
  name: 'criar-origem',
  description: 'Cria uma nova origem. Você pode digitar se não estivar na lista.',
  options: [
    {
      type: 3,
      name: 'origem',
      description: `O nome da origem.`,
      autocomplete: true,
      required: true,
    },
    {
      type: 3,
      name: 'grupo',
      description: `O nome do grupo.`,
      required: true,
    },
  ],
}

export const PLAYER_ENTRY_COMMAND = {
  name: 'entrada',
  description: 'Registrar a entrada de um jogador em uma mesa.',
  options: [
    {
      type: 6,
      name: 'jogador',
      description: 'Jogador que está entrando na mesa.',
      required: true,
    },
    {
      type: 10,
      name: 'mesa',
      description: 'Selecione a mesa correspondente.',
      autocomplete: true,
      required: true,
    },
    {
      type: 10,
      name: 'origem_entrada',
      description: 'Origem de onde o jogador veio.',
      autocomplete: true,
      required: true,
    },
    {
      type: 5,
      name: 'vaga_staff',
      description: 'Marque se esta é uma vaga de staff.',
      required: false,
    },
    {
      type: 3,
      name: 'nota',
      description: 'Observações adicionais sobre a entrada.',
      required: false,
    },
  ],
};

export const PLAYER_LEAVE_COMMAND = {
  name: 'saida',
  description: 'Registrar a saída de um jogador de uma mesa.',
  options: [
    {
      type: 10,
      name: 'mesa',
      description: 'Selecione a mesa correspondente.',
      autocomplete: true,
      required: true,
    },
    {
      type: 6,
      name: 'jogador',
      description: 'Jogador que está saindo da mesa.',
      required: true,
    },
    {
      type: 3,
      name: 'motivo',
      description: 'Motivo da saída do jogador.',
      required: false,
    },
    {
      type: 3,
      name: 'nota',
      description: 'Observações adicionais sobre a saída.',
      required: false,
    },
  ],
};

export const SCHEDULE_SESSION_COMMAND = {
  name: 'marcar-sessao',
  description: '📅 Marca uma nova sessão de jogo',
  options: [
    {
      type: 10,
      name: 'mesa',
      description: 'Selecione a mesa correspondente.',
      autocomplete: true,
      required: true,
    },
    {
      name: 'data',
      description: 'Data da sessão (YYYY-MM-DD)',
      type: 3,
      required: true,
    },
    {
      name: 'motivo',
      description: 'Motivo do agendamento (opcional)',
      type: 3,
      required: false,
    },
  ],
};

export const UNSCHEDULE_SESSION_COMMAND = {
  name: 'cancelar-sessao',
  description: '❌ Cancela uma sessão de jogo',
  options: [
    {
      type: 10,
      name: 'mesa',
      description: 'Selecione a mesa correspondente.',
      autocomplete: true,
      required: true,
    },
    {
      name: 'data',
      description: 'Data da sessão cancelada (YYYY-MM-DD)',
      type: 3,
      required: true,
    },
    {
      name: 'motivo',
      description: 'Motivo do cancelamento (opcional)',
      type: 3,
      required: false,
    },
  ],
};
