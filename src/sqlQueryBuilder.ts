import { DbCreateCriteria, DbCriteria, DbDeleteCriteria, DbInsertCriteria, DbReadCriteria, DbSelectCriteria, DbUpdateCriteria, isOperatorValue } from 'mega-nice-db-criteria'
import sql, { Query } from 'mega-nice-sql'

export function fillCriteria(query: Query, criteria: DbCriteria|undefined, tableName: string, schema: Schema, alias?: string) {
  // console.debug('query', query)
  // console.debug('criteria', criteria)
  // console.debug('tableName', tableName)
  // console.debug('schema', schema)
  // console.debug('alias', alias)

  if (criteria == undefined) {
    // console.debug('Criteria are undefined or null. Returning...')
    return 
  }

  let table = schema.table(tableName)
  // console.debug('table', table)

  if (table == undefined) {
    throw new Error('Table not contained in schema: ' + tableName)
  }

  let aliasPrefix = alias != undefined && alias.length > 0 ? alias + '.' : ''

  for (let column of table.columns) {
    if (criteria[column] !== undefined) {
      let value = criteria[column]

      if (table.columns.indexOf(column) > -1) {
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

              if (! isOperatorValue(firstValue) && ! (firstValue instanceof Array)) {
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
                if (isOperatorValue(arrayValue)) {
                  query.where(aliasPrefix + column, arrayValue.operator, arrayValue.value)
                }
                else {
                  query.where(aliasPrefix + column, arrayValue)
                }
              }
            }
          }
          else if (typeof value === 'object') {
            if (value.operator != undefined && value.value !== undefined) {
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

  // console.debug('Iterating through all properties of the table object which contain the relationships...')
  for (let relationshipName of Object.keys(table)) {
    // console.debug('relationshipName', relationshipName)
    
    if (relationshipName == 'table' || relationshipName == 'columns') {
      // console.debug('Relationship name is \'table\' or \'columns\'. Continuing...')
      continue
    }

    if (! (relationshipName in criteria)) {
      // console.debug('Relationship is not contained in the criteria. Continuing...')
      continue
    }

    let relationship = table[relationshipName]
    let relationshipCriteria = criteria[relationshipName]
    // console.debug('relationship', relationship)
    // console.debug('relationshipCriteria', relationshipCriteria)
    
    let thisId
    let otherTable
    let otherId

    if (typeof relationship.oneToMany == 'object' && relationship.oneToMay !== null) {
      // console.debug('We have a oneToMany relationship')
      thisId = relationship.oneToMany.thisId
      otherTable = relationship.oneToMany.otherTable
      otherId = relationship.oneToMany.otherId
    }
    else if (typeof relationship.manyToOne == 'object' && relationship.manyToOne !== null) {
      // console.debug('We have a manyToOne relationship')
      thisId = relationship.manyToOne.thisId
      otherTable = relationship.manyToOne.otherTable
      otherId = relationship.manyToOne.otherId
    }
    else {
      throw new Error('Given criteria do not contain oneToMany nor manyToOne')
    }

    if (typeof thisId != 'string' || thisId.length == 0) {
      throw new Error('Given relationship object does not contain property \'thisId\'')
    }

    if (typeof otherTable != 'string' || otherTable.length == 0) {
      throw new Error('Given relationship object do not contain property \'otherTable\'')
    }

    if (typeof otherId != 'string' || otherId.length == 0) {
      throw new Error('Given relationship object does not contain property \'otherId\'')
    }

    // console.debug('thisId', thisId)
    // console.debug('otherTable', otherTable)
    // console.debug('otherId', otherId)

    let joinAlias = alias != undefined && alias.length > 0 ? alias + '_' + relationshipName : relationshipName

    // console.debug('joinAlias', joinAlias)
    
    // console.debug('Adding INNER JOIN to query')
    query.join('INNER', otherTable, joinAlias, '' + (alias != undefined && alias.length > 0 ? alias + '.' : '') + thisId + ' = ' + joinAlias + '.' + otherId)
    // console.debug('query', query)

    // console.debug('Filling query with the relationship criteria. Going into the recursion...')
    fillCriteria(query, relationshipCriteria, otherTable, schema, joinAlias)
    // console.debug('Coming back from recursion...', query)
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

export function buildSqlInsertQuery(criteria: DbCreateCriteria|DbInsertCriteria|undefined, tableName: string, schema: Schema): Query {
  let table = schema.table(tableName)

  if (table == undefined) {
    throw new Error('Table not contained in schema: ' + tableName)
  }

  let query = sql.insertInto(table.table)

  if (criteria == undefined) {
    return query
  }

  for (let column of table.columns) {
    if (criteria[column] !== undefined) {
      let value = criteria[column]
      query.value(column, value)
    }
  }

  return query
}

export function buildSqlSelectQuery(criteria: DbReadCriteria|DbSelectCriteria|undefined, tableName: string, schema: Schema): Query {
  let table = schema.table(tableName)

  if (table == undefined) {
    throw new Error('Table not contained in schema: ' + tableName)
  }

  let query = new Query
  query.from(tableName)
  fillCriteria(query, criteria, tableName, schema)

  for (let from of query._froms) {
    let fromTable = schema.table(from.table)
    
    if (fromTable == undefined) {
      throw new Error('Table not contained in schema: ' + from.table)
    }

    for (let column of fromTable.columns) {
      let alias = from.alias != undefined && from.alias.length > 0 ? from.alias : undefined
      query.select((alias != undefined ? alias + '.' : '' ) + column, (alias != undefined ? alias + '_' + column : undefined))
    }
  }

  for (let join of query._joins) {
    let joinTable = schema.table(join.table)
    
    if (joinTable == undefined) {
      throw new Error('Table not contained in schema: ' + join.table)
    }

    for (let column of joinTable.columns) {
      let alias = join.alias != undefined && join.alias.length > 0 ? join.alias : undefined
      query.select((alias != undefined ? alias + '.' : '' ) + column, (alias != undefined ? alias + '_' + column : undefined))
    }
  }

  return query
}

export function buildSqlUpdateQuery(criteria: DbUpdateCriteria|undefined, tableName: string, schema: Schema): Query {
  let table = schema.table(tableName)

  if (table == undefined) {
    throw new Error('Table not contained in schema: ' + tableName)
  }

  let query = sql.update(table.table)

  if (criteria == undefined) {
    return query
  }

  for (let column of table.columns) {
    if (criteria.set[column] !== undefined) {
      let value = criteria.set[column]
      query.set(column, value)
    }
  }

  let criteriaWithoutSet = {
    ...criteria
  }

  delete criteria.set

  fillCriteria(query, criteriaWithoutSet, tableName, schema)

  return query
}

export function buildSqlDeleteQuery(criteria: DbDeleteCriteria|undefined, tableName: string, schema: Schema): Query {
  let table = schema.table(tableName)

  if (table == undefined) {
    throw new Error('Table not contained in schema: ' + tableName)
  }

  let query = sql.deleteFrom(table.table)

  if (criteria == undefined) {
    return query
  }

  fillCriteria(query, criteria, tableName, schema)

  return query
}

export class Schema {
  tableNameToTable: {[ tableName: string]: Table } = {}

  add(...tables: Table[]) {
    for (let table of tables) {
      this.tableNameToTable[table.table] = table
    }
  }

  table(tableName: string) {
    return this.tableNameToTable[tableName]
  }
}

export interface Table {
  table: string
  columns: string[]
  [ relationship: string ]: any|Relationship
}

export interface Relationship {
  oneToMany?: {
    thisId: any
    otherTable: string
    otherId: any  
  },
  manyToOne?: {
    thisId: any
    otherTable: string
    otherId: any  
  }
}
