import { Query } from 'mega-nice-sql'
import { DbCriteria, DbSelectOptions, DbInsertOptions, DbUpdateOptions, DbDeleteOptions } from 'mega-nice-db-query-options'

export function fillWhere(query: Query, options: DbCriteria|undefined, columns: string[]) {
  if (options == undefined) {
    return 
  }

  for (let prop in options) {
    if (Object.prototype.hasOwnProperty.call(options, prop)) {
      if (columns.indexOf(prop) > -1) {
        let value = options[prop]

        // console.debug(`Processing field ${field}`, value)

        if (value !== undefined) {
          if (value === null) {
            query.where(prop, value)
          }
          else if (typeof value === 'object' && 'operator' in value && 'value' in value) {
            query.where(prop, value.operator, value.value)
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
          else {
            query.where(prop, value)
          }
        }
      }
    }
  }

  if (options.orderBy != undefined) {
    if (typeof options.orderBy === 'string') {
      query.orderBy(options.orderBy)
    }
    else if (typeof options.orderBy === 'object' && 'field' in options.orderBy) {
      query.orderBy(options.orderBy.field, options.orderBy.direction)
    }
    else if (options.orderBy instanceof Array) {
      for (let orderBy of options.orderBy) {
        if (typeof orderBy === 'object' && 'field' in orderBy) {
          query.orderBy(orderBy.field, orderBy.direction)
        }
      }    
    }
  }

  if (options.limit != undefined) {
    query.limit(options.limit)
  }

  if (options.offset != undefined) {
    query.offset(options.offset)
  }
}

export function fillSqlInsertQuery(query: Query, options: DbInsertOptions|undefined, columns: string[]) {
  if (options == undefined) {
    return 
  }

  for (let column in options) {
    if (Object.prototype.hasOwnProperty.call(options, column)) {
      if (columns.indexOf(column) > -1) {
        let value = options[column]
        query.value(column, value)
      }
    }
  }
}

export function fillSqlSelectQuery(query: Query, options: DbSelectOptions|undefined, columns: string[]) {
  fillWhere(query, options, columns)
}

export function fillSqlUpdateQuery(query: Query, options: DbUpdateOptions|undefined, columns: string[]) {
  if (options == undefined) {
    return 
  }

  for (let column in options) {
    if (Object.prototype.hasOwnProperty.call(options, column)) {
      if (columns.indexOf(column) > -1) {
        let value = options[column]
        query.set(column, value)
      }
    }
  }

  fillWhere(query, options.queryOptions, columns)
}

export function fillSqlDeleteQuery(query: Query, options: DbDeleteOptions|undefined, columns: string[]) {
  return fillWhere(query, options, columns)
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
