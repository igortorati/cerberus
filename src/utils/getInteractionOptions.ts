import {
  APIChatInputApplicationCommandInteraction,
  APIApplicationCommandInteractionDataOption,
  APIApplicationCommandInteractionDataBasicOption,
} from 'discord-api-types/v10';

type OptionValue = string | number | boolean;

interface OptionRecord {
  [key: string]: OptionValue;
}

function getInteractionOptions(
  interaction: APIChatInputApplicationCommandInteraction,
): OptionRecord {
  const parseOptions = (
    options?: APIApplicationCommandInteractionDataOption[],
  ): OptionRecord => {
    if (!options) return {};

    return options.reduce<OptionRecord>((acc, opt) => {
      const basic = opt as APIApplicationCommandInteractionDataBasicOption;
      if (basic.value !== undefined) {
        acc[basic.name] = basic.value as OptionValue;
      }
      return acc;
    }, {});
  };

  return parseOptions(interaction.data.options);
}

function convertOptionsToType<T extends object>(
  options: OptionRecord,
): T {
  const result = {} as Record<keyof T, unknown>;

  for (const key in options) {
    const value = options[key];
    result[key as keyof T] = value as T[keyof T];
  }

  return result as T;
}

export function extractInteractionData<T extends object>(
  interaction: APIChatInputApplicationCommandInteraction,
): T {
  const rawOptions = getInteractionOptions(interaction);
  return convertOptionsToType<T>(rawOptions);
}