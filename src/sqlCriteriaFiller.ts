import { CreateCriteria, Criteria, DeleteCriteria, isOperatorAndValue, ReadCriteria, UpdateCriteria } from 'knight-criteria'
import { Query } from 'knight-sql'

export function fillCriteria(query: Query, criteria: Criteria|undefined, columns: string[], alias?: string) {
  // console.debug('query', query)
  // console.debug('criteria', criteria)
  // console.debug('tableName', tableName)
  // console.debug('schema', schema)
  // console.debug('alias', alias)

  if (criteria == undefined) {
    // console.debug('Criteria are undefined or null. Returning...')
    return 
  }

  let aliasPrefix = alias != undefined && alias.length > 0 ? alias + '.' : ''

  for (let column of columns) {
    if (criteria[column] !== undefined) {
      let value = criteria[column]

      if (columns.indexOf(column) > -1) {
        // console.debug(`Processing column '${column}':`, value)

        if (value !== undefined) {
          if (value === null) {
            query.where(aliasPrefix + column, value)
          }
          else if (value instanceof Array && value.length == 0) {
            query.where(aliasPrefix + column, value)
          }
          else if (value instanceof Array && value.length > 0) {
            // console.debug('Field is of type Array and has a length > 0')

            let sameTypes = true
            let lastTypeOfArrayValue = undefined
            let lastInstanceOfArrayValue = undefined
            let firstArrayValue = true

            for (let arrayValue of value) {
              let typeOfArrayValue = typeof arrayValue
              let instanceOfArrayValue = arrayValue != undefined && arrayValue.constructor != undefined ? arrayValue.constructor.name : undefined

              if (firstArrayValue) {
                lastTypeOfArrayValue = typeOfArrayValue
                lastInstanceOfArrayValue = instanceOfArrayValue
                firstArrayValue = false
              }

              if (typeOfArrayValue !== lastTypeOfArrayValue) {
                sameTypes = false
                break
              }

              if (instanceOfArrayValue !== lastInstanceOfArrayValue) {
                sameTypes = false
                break
              }
            }

            let isInOperator = false
            if (sameTypes) {
              let firstValue = value[0]

              if (! isOperatorAndValue(firstValue) && ! (firstValue instanceof Array)) {
                isInOperator = true
              }
            }

            if (isInOperator) {
              // console.debug(`Array represents an SQL IN operation`)
              query.where(aliasPrefix + column, value)
            }
            else {
              // console.debug(`Array represents AND connected conditions`)
              for (let arrayValue of value) {
                if (isOperatorAndValue(arrayValue)) {
                  query.where(aliasPrefix + column, arrayValue.operator, arrayValue.value)
                }
                else {
                  query.where(aliasPrefix + column, arrayValue)
                }
              }
            }
          }
          else if (typeof value === 'object' && Object.keys(value).length <= 2 && 'operator' in value) {
            if (value.value !== undefined) {
              query.where(aliasPrefix + column, value.operator, value.value)
            }
          }
          else {
            query.where(aliasPrefix + column, value)
          }
        }
      }
    }
  }
}

export function fillCreateCriteria(query: Query, criteria: CreateCriteria|undefined, columns: string[]) {
  if (criteria == undefined) {
    return 
  }

  for (let column of columns) {
    if (criteria[column] !== undefined) {
      let value = criteria[column]
      query.value(column, value)
    }
  }

  return query
}

export function fillReadCriteria(query: Query, criteria: ReadCriteria|undefined, columns: string[]) {
  if (criteria == undefined) {
    return
  }

  fillCriteria(query, criteria, columns)

  if (criteria['@orderBy'] != undefined) {
    if (typeof criteria['@orderBy'] === 'string') {
      query.orderBy(criteria['@orderBy'])
    }
    else if (criteria['@orderBy'] != undefined && 'field' in criteria['@orderBy'] && 'direction' in criteria['@orderBy']) {
      query.orderBy(criteria['@orderBy'].field, criteria['@orderBy'].direction as any)
    }
    else if (criteria['@orderBy'] instanceof Array) {
      for (let orderBy of criteria['@orderBy']) {
        if (typeof orderBy === 'object' && 'field' in orderBy) {
          query.orderBy(orderBy.field, orderBy.direction as any)
        }
      }    
    }
  }

  if (criteria['@limit'] != undefined) {
    query.limit(criteria['@limit'])
  }

  if (criteria['@offset'] != undefined) {
    query.offset(criteria['@offset'])
  }
}

export function fillUpdateCriteria(query: Query, criteria: UpdateCriteria|undefined, columns: string[]) {
  if (criteria == undefined) {
    return
  }

  for (let column of columns) {
    if (criteria['@set'][column] !== undefined) {
      let value = criteria['@set'][column]
      query.set(column, value)
    }
  }

  let criteriaWithoutSet = {
    ...criteria
  } as any

  delete criteriaWithoutSet['@set']

  fillCriteria(query, criteriaWithoutSet, columns)

  return query
}

export function fillDeleteCriteria(query: Query, criteria: DeleteCriteria|undefined, columns: string[]) {
  if (criteria == undefined) {
    return
  }

  fillCriteria(query, criteria, columns)
}
