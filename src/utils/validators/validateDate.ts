import moment from "moment";
import { BRAZIL_DATE_FORMAT } from "../../constants/dateAndTimeConstants";

export function validateDate(dateString: string): boolean {
  const date = moment(dateString, BRAZIL_DATE_FORMAT).toDate()
  return /^\d{2}\/\d{2}\/\d{4}$/.test(dateString) && !isNaN(date.getTime())
}
