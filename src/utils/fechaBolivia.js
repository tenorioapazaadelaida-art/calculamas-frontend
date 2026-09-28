export const ZONA_HORARIA_BOLIVIA = 'America/La_Paz'

const partesBolivia = (fecha = new Date()) =>
  Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: ZONA_HORARIA_BOLIVIA,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .formatToParts(fecha)
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value }) => [type, value]),
  )

export const fechaHoyBolivia = (fecha = new Date()) => {
  const { year, month, day } = partesBolivia(fecha)
  return `${year}-${month}-${day}`
}

export const gestionActualBolivia = (fecha = new Date()) => Number(partesBolivia(fecha).year)

export const mesActualBolivia = (fecha = new Date()) => Number(partesBolivia(fecha).month)
