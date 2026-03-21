// Transform snake_case to camelCase
export function snakeToCamel(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel)
  }

  if (obj !== null && typeof obj === 'object') {
    const newObj: any = {}
    for (const key in obj) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      newObj[camelKey] = snakeToCamel(obj[key])
    }
    return newObj
  }

  return obj
}

// Transform camelCase to snake_case
export function camelToSnake(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(camelToSnake)
  }

  if (obj !== null && typeof obj === 'object') {
    const newObj: any = {}
    for (const key in obj) {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
      newObj[snakeKey] = camelToSnake(obj[key])
    }
    return newObj
  }

  return obj
}
