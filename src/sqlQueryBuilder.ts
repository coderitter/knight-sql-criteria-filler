import { DbCreateParameter, DbCriteria, DbDeleteParameter, DbInsertParameter, DbReadParameter, DbSelectParameter, DbUpdateParameter } from 'mega-nice-db-query-parameter'
import { Query } from 'mega-nice-sql'

export function fillCriteria(query: Query, criteria: DbCriteria|undefined, columns: string[]) {
  if (criteria == undefined) {
    return 
  }

  for (let prop in criteria) {
    if (Object.prototype.hasOwnProperty.call(criteria, prop)) {
      if (columns.indexOf(prop) > -1) {
        let value = criteria[prop]

        // console.debug(`Processing prop '${prop}':`, value)

        if (value !== undefined) {
          if (value === null) {
            query.where(prop, value)
          }
          else if (value instanceof Array && value.length == 0) {
            query.where(prop, value)
          }
          else if (value instanceof Array && value.length > 0) {
            // console.debug('Field is of type Array and has a length > 0')

            let sameTypes = true
            let lastTypeOfArrayValue = undefined
            let lastInstanceOfArrayValue = undefined
            let firstArrayValue = true

            for (let arrayValue of value) {
              let typeOfArrayValue = typeof arrayValue
              let instanceOfArrayValue = arrayValue.constructor != undefined ? arrayValue.constructor.name : undefined

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

              if (! isOurConditionObject(firstValue) && ! (firstValue instanceof Array)) {
                isInOperator = true
              }
            }

            if (isInOperator) {
              // console.debug(`Array represents an SQL IN operation`)
              query.where(prop, value)
            }
            else {
              // console.debug(`Array represents AND connected conditions`)
              for (let arrayValue of value) {
                if (isOurConditionObject(arrayValue)) {
                  query.where(prop, arrayValue.operator, arrayValue.value)
                }
                else {
                  query.where(prop, arrayValue)
                }
              }
            }
          }
          else if (typeof value === 'object') {
            if (value.operator != undefined && value.value !== undefined) {
              query.where(prop, value.operator, value.value)
            }
          }
          else {
            query.where(prop, value)
          }
        }
      }
    }
  }

  if (criteria.orderBy != undefined) {
    if (typeof criteria.orderBy === 'string') {
      query.orderBy(criteria.orderBy)
    }
    else if (typeof criteria.orderBy === 'object' && 'field' in criteria.orderBy) {
      query.orderBy(criteria.orderBy.field, criteria.orderBy.direction)
    }
    else if (criteria.orderBy instanceof Array) {
      for (let orderBy of criteria.orderBy) {
        if (typeof orderBy === 'object' && 'field' in orderBy) {
          query.orderBy(orderBy.field, orderBy.direction)
        }
      }    
    }
  }

  if (criteria.limit != undefined) {
    query.limit(criteria.limit)
  }

  if (criteria.offset != undefined) {
    query.offset(criteria.offset)
  }
}

export function fillSqlInsertQuery(query: Query, parameter: DbCreateParameter|DbInsertParameter|undefined, columns: string[]) {
  if (parameter == undefined) {
    return 
  }

  for (let column in parameter) {
    if (Object.prototype.hasOwnProperty.call(parameter, column)) {
      if (columns.indexOf(column) > -1) {
        let value = parameter[column]
        query.value(column, value)
      }
    }
  }
}

export function fillSqlSelectQuery(query: Query, parameter: DbReadParameter|DbSelectParameter|undefined, columns: string[]) {
  fillCriteria(query, parameter, columns)
}

export function fillSqlUpdateQuery(query: Query, parameter: DbUpdateParameter|undefined, columns: string[]) {
  if (parameter == undefined) {
    return 
  }

  for (let column in parameter) {
    if (Object.prototype.hasOwnProperty.call(parameter, column)) {
      if (columns.indexOf(column) > -1) {
        let value = parameter[column]
        query.set(column, value)
      }
    }
  }

  fillCriteria(query, parameter.criteria, columns)
}

export function fillSqlDeleteQuery(query: Query, parameter: DbDeleteParameter|undefined, columns: string[]) {
  return fillCriteria(query, parameter, columns)
}

function isOurConditionObject(value: any): boolean {
  if (typeof value !== 'object') {
    return false
  }

  let fieldCount = 0

  for (let field in value) {
    if (Object.prototype.hasOwnProperty.call(value, field)) {
      fieldCount++
    }
  }

  return 'operator' in value && 'value' in value && fieldCount === 2
}
