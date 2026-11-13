// Regras de negócio e limites centralizados, com referência ao documento de requisitos.

export const TAXA_PLATAFORMA = 0.07              // RN01
export const HORAS_LIBERACAO_PAGAMENTO = 48      // RN02
export const DIAS_UTEIS_PARA_RASTREIO = 3        // RN03
export const HORAS_PARA_DISPUTA = 48             // RN04
export const REPUTACAO_MINIMA = 2                // RN07
export const MIN_FOTOS = 3                       // RF02
export const MAX_FOTOS = 20
export const LIMITE_FOTO_MB = 5                  // RNF08 / RN08
export const TENTATIVAS_LOGIN_POR_MINUTO = 10    // RNF10

export const arredondar = (valor) => Math.round(valor * 100) / 100

export const somarHoras = (data, horas) => new Date(data.getTime() + horas * 3_600_000)

export function somarDiasUteis(data, dias) {
  const resultado = new Date(data)
  let restantes = dias
  while (restantes > 0) {
    resultado.setDate(resultado.getDate() + 1)
    const diaSemana = resultado.getDay()
    if (diaSemana !== 0 && diaSemana !== 6) restantes--
  }
  return resultado
}
