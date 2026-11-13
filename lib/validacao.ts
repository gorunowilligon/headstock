import { juntar } from '@/lib/api'

// Validação dos formulários com mensagens próprias, no lugar dos balões nativos do navegador.
// Os formulários usam `noValidate` e chamam `validarFormulario` no submit: as regras continuam
// nos atributos HTML (required, minLength, min, type="email"...), só a mensagem muda.

type Campo = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

/** Rótulo visível do campo: texto do <label> (sem o texto dos elementos internos) ou aria-label. */
function rotuloDe(campo: Campo) {
  const label = campo.labels?.[0]
  const texto = label
    ? Array.from(label.childNodes).filter((no) => no.nodeType === Node.TEXT_NODE).map((no) => no.textContent).join(' ')
    : ''
  return (texto.trim() || campo.getAttribute('aria-label') || campo.getAttribute('placeholder') || 'Campo').replace(/\s+/g, ' ')
}

function problemaDe(campo: Campo, rotulo: string): string | null {
  const v = campo.validity
  if (v.valid) return null
  if (v.valueMissing) return null // tratado à parte, em uma única frase
  if (v.typeMismatch && campo.type === 'email') return 'Informe um e-mail válido (ex.: nome@email.com).'
  if (v.tooShort) return `${rotulo}: use pelo menos ${(campo as HTMLInputElement).minLength} caracteres.`
  if (v.tooLong) return `${rotulo}: use no máximo ${(campo as HTMLInputElement).maxLength} caracteres.`
  if (v.badInput) return `${rotulo}: informe um número válido.`
  if (v.rangeUnderflow) return `${rotulo}: o valor mínimo é ${(campo as HTMLInputElement).min}.`
  if (v.rangeOverflow) return `${rotulo}: o valor máximo é ${(campo as HTMLInputElement).max}.`
  if (v.stepMismatch) return `${rotulo}: use no máximo duas casas decimais.`
  if (v.patternMismatch) return `${rotulo}: formato inválido.`
  return `${rotulo}: valor inválido.`
}

/** Marca o campo como inválido até o usuário mexer nele de novo. */
export function marcarInvalido(campo: Element) {
  campo.setAttribute('aria-invalid', 'true')
  const limpar = () => campo.removeAttribute('aria-invalid')
  campo.addEventListener('input', limpar, { once: true })
  campo.addEventListener('change', limpar, { once: true })
}

/**
 * Valida o formulário e devolve a mensagem a exibir (ou null se estiver tudo certo).
 * `extras` são problemas que o HTML não expressa (ex.: fotos mínimas), já em frase pronta.
 * Campos inválidos ficam destacados e o primeiro recebe o foco.
 */
export function validarFormulario(form: HTMLFormElement, extras: string[] = []): string | null {
  // Remove espaços sobrando antes de validar, para "   " contar como vazio.
  const campos = Array.from(form.elements).filter((el): el is Campo =>
    (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) && !el.disabled && el.willValidate)
  for (const campo of campos) {
    if (!(campo instanceof HTMLSelectElement) && campo.type !== 'password' && campo.value !== campo.value.trim() && !campo.value.trim()) campo.value = ''
  }

  const faltando: string[] = []
  const problemas: string[] = []
  let primeiro: Campo | null = null
  for (const campo of campos) {
    if (campo.validity.valid) continue
    primeiro ??= campo
    marcarInvalido(campo)
    const rotulo = rotuloDe(campo)
    if (campo.validity.valueMissing) faltando.push(rotulo)
    else problemas.push(problemaDe(campo, rotulo) ?? `${rotulo}: valor inválido.`)
  }
  primeiro?.focus()

  const frases = [
    ...(faltando.length ? [`Formulário incompleto. ${faltando.length === 1 ? 'Preencha o campo' : 'Preencha os campos'}: ${juntar(faltando)}.`] : []),
    ...extras,
    ...problemas,
  ]
  return frases.length ? frases.join(' ') : null
}
