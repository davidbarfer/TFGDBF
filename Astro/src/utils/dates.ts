export function setISODateYYYYMMDD (date : any) {
  return new Date(date).toISOString().split('T')[0]
}