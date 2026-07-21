export function setISODateYYYYMMDD (date : any) {
  return new Date(date).toISOString().split('T')[0]
}
export function setLocalDateLanguage (date : any, language: string = 'es-ES') {
  return new Date(date).toLocaleDateString(language, { year: 'numeric', month: '2-digit', day: '2-digit' })
}