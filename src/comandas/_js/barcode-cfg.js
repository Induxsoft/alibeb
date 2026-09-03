/**
 * Interpretación de códigos de barras compuestos por máscara posicional.
 *
 * Gramática de la máscara:
 *   - Cada letra define un campo. Todos los dígitos que caen en posiciones
 *     con la misma letra se concatenan en orden de aparición.
 *   - El 0 marca una posición a descartar. Es el único dígito permitido.
 *   - La longitud de la máscara debe ser igual a la del código.
 *
 * Ejemplo: máscara "SKKK00QQQQV" sobre "79518806509"
 *          -> { s: "7", k: "951", q: "0650", v: "9" }
 */

const RE_MASCARA = /^[A-Za-z0]+$/;
const RE_CODIGO  = /^\d+$/;
const RE_VAL_MASCARA = /^(?=.*q)(?=.*k)[A-Za-z]+$/i
/**
 * Valida una máscara. Llamar al guardar la configuración, no en cada lectura.
 * @param {string} mascara
 * @returns {string} la máscara normalizada
 * @throws {Error} si la máscara no cumple la gramática
 */
function validarMascara(mascara) {
  if (typeof mascara !== "string" || mascara.length === 0)
    throw new Error("La máscara no puede estar vacía.");

  if (!RE_MASCARA.test(mascara))
    throw new Error(
      `Máscara inválida: "${mascara}". Solo se aceptan letras y el dígito 0.`
    );

  return mascara;
}

/**
 * Aplica la máscara a un código y devuelve los campos extraídos.
 * @param {string} mascara
 * @param {string} codigo
 * @returns {Object|null} objeto con un campo por letra, o null si no aplica
 */
function interpretarCodigo(mascara, codigo) {
  if (typeof mascara !== "string" || typeof codigo !== "string") return null;
  if (mascara.length !== codigo.length) return null;
  if (!RE_CODIGO.test(codigo)) return null;
  if (!RE_MASCARA.test(mascara)) return null;

  const campos = {};

  for (let i = 0; i < mascara.length; i++) {
    const c = mascara[i];
    if (c === "0") continue;

    const clave = c.toLowerCase();
    campos[clave] = (campos[clave] || "") + codigo[i];
  }

  return campos;
}
function validateFields() 
{
    const inputs = document.querySelectorAll('input[name^="mascara"]');
    let count=0;
    for(const element of inputs)
    {
        if(element.value.trim()!="")
        {
          try {
            validarMascara(element.value);  
          } 
          catch (error) 
          {
            count=-1;
            alert(error);
            return false;
          }
          
          if(!RE_VAL_MASCARA.test(element.value))
          {
            alert("La mascara '"+element.value+"' debe contener la letra Q Y K");
            return false;
          }
          count++;
        }
    };

    if(count == -1)return false;
    if(count < 1)
    {
      alert("Debe colocar alguna regla");
      return false;
    }
    return true;
}