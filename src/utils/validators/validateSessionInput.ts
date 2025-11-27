import { CommandError } from "../../errors/commandError";
import { ISessionInputData } from "../../interfaces/sessionInputDataInterface";
import { NewSession } from "../../models";
import { sessionValidator } from "./validateSessionScheduleInputData";

export function validateSessionInput(sessionData: ISessionInputData): NewSession {
  const validated = sessionValidator.safeParse(sessionData);
  if (!validated.success) {
    const message = validated.error.issues[0]?.message ?? 'Dados inválidos.';
    throw new CommandError(message);
  }
  return validated.data;
}