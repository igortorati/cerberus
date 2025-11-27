import { SESSION_TYPE } from "../enums/sessionType";
import { NewSession } from "../models";
import { ValidatedSessionInputData } from "./validators/inputSessionDataValidator";

export function buildSessionData(createdBy: string, inputData: ValidatedSessionInputData, type: SESSION_TYPE): NewSession {
  return {
    game_id: inputData.mesa,
    type,
    date: inputData.data,
    reason: inputData.motivo,
    created_by_discord_id: createdBy,
  };
}