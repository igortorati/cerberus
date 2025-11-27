import { isNull } from "./isNull";

export function getDateString(date: Date | null): string {
    if(!isNull(date) && !isNull(date.getFullYear()) && !isNull(date.getMonth()) && !isNull(date.getDate()))
        return `${date.getUTCDate()}/${date.getUTCMonth()+1}/${date.getUTCFullYear()}`;
    else
        return "--"
}