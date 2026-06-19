import NodeCache from "node-cache";

const cache = new NodeCache({
  stdTTL: 300,       // TTL padrão: 5 minutos
  checkperiod: 60,   // Verificação de expiração a cada 60 segundos
  useClones: false,  // Não clonar objetos
  maxKeys: 500,      // Máximo de 500 entradas no cache
});

/**
 * Gera uma chave de cache a partir dos parâmetros de busca.
 * @param {object} params
 * @returns {string}
 */
export function buildCacheKey(params) {
  const sorted = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      if (params[key] !== undefined && params[key] !== "") {
        acc[key] = params[key];
      }
      return acc;
    }, {});
  return `jokes:${JSON.stringify(sorted)}`;
}

export default cache;
