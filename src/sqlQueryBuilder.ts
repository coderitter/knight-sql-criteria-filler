import { Query } from "mega-nice-sql"
import { SqlQueryOptions } from "mega-nice-sql-query-options"

export function fillSqlQuery(query: Query, options: SqlQueryOptions | undefined, columns: string[]) {
  if (options == undefined) {
    return 
  }
  
  for (let field in options) {
    if (Object.prototype.hasOwnProperty.call(options, field)) {
      if (columns.indexOf(field) >= -1) {
        let value = options[field]

        // console.debug(`Processing field ${field}`, value)

        if (value !== undefined) {
          if (value === null) {
            query.where(field, value)
          }
          else if (typeof value === "object" && "operator" in value && "value" in value) {
            query.where(field, value.operator, value.value)
          }
          else if (value instanceof Array && value.length > 0) {
            // console.debug("Field is of type Array and has a length > 0")

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
              query.where(field, value)
            }
            else {
              // console.debug(`Array represents AND connected conditions`)
              for (let arrayValue of value) {
                if (isOurConditionObject(arrayValue)) {
                  query.where(field, arrayValue.operator, arrayValue.value)
                }
                else {
                  query.where(field, arrayValue)
                }
              }
            }
          }
          else {
            query.where(field, value)
          }
        }
      }
    }
  }

  if (options.orderBy != undefined) {
    if (typeof options.orderBy === "string") {
      query.orderBy(options.orderBy)
    }
    else if (typeof options.orderBy === "object" && "column" in options.orderBy) {
      query.orderBy(options.orderBy.column, options.orderBy.direction)
    }
    else if (options.orderBy instanceof Array) {
      for (let orderBy of options.orderBy) {
        if (typeof orderBy === "object" && "column" in orderBy) {
          query.orderBy(orderBy.column, orderBy.direction)
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

  return "operator" in value && "value" in value && fieldCount === 2
}