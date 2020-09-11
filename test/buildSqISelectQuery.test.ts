import { expect } from 'chai'
import 'mocha'
import { buildSqlSelectQuery } from '../src/sqlQueryBuilder'

describe('buildSqlSelectQuery', function() {
  it('should handle a simple select query', function() {
    let criteria = { a: 'a', b: 1 }
    let query = buildSqlSelectQuery(criteria, 'TableAB', schema)
    expect(query.mysql()).to.equal('SELECT a, b FROM TableAB WHERE a = ? AND b = ?;')
  })

  it('should handle inter table relationships', function() {
    let criteria = {
      id: 1,
      column1: 'a',
      many: {
        column1: 'b',
        table2: {
          column1: 'c'
        }
      }
    }

    let query = buildSqlSelectQuery(criteria, 'Table1', schema)

    expect(query._selects.length).to.equal(7)
    expect(query._selects[0]).to.equal('id')
    expect(query._selects[1]).to.equal('column1')
    expect(query._selects[2]).to.equal('many.table1Id many__table1Id')
    expect(query._selects[3]).to.equal('many.table2Id many__table2Id')
    expect(query._selects[4]).to.equal('many.column1 many__column1')
    expect(query._selects[5]).to.equal('many__table2.id many__table2__id')
    expect(query._selects[6]).to.equal('many__table2.column1 many__table2__column1')

    expect(query.mysql()).to.equal('SELECT id, column1, many.table1Id many__table1Id, many.table2Id many__table2Id, many.column1 many__column1, many__table2.id many__table2__id, many__table2.column1 many__table2__column1 FROM Table1 INNER JOIN TableMany many ON id = many.table1Id INNER JOIN Table2 many__table2 ON many.table2Id = many__table2.id WHERE id = ? AND column1 = ? AND many.column1 = ? AND many__table2.column1 = ?;')
  })
})

const schema = {
  'TableAB': {
    name: 'TableAB',
    columns: [ 'a', 'b' ]
  },
  
  'Table1': {
    name: 'Table1',
    columns: [ 'id', 'column1' ],
    many: {
      oneToMany: {
        thisId: 'id',
        otherTable: 'TableMany',
        otherId: 'table1Id'
      }
    }
  },
  
  'Table2': {
    name: 'Table2',
    columns: [ 'id', 'column1' ],
    many: {
      oneToMany: {
        thisId: 'id',
        otherTable: 'TableMany',
        otherId: 'table2Id'
      }
    }
  },

  'TableMany': {
    name: 'TableMany',
    columns: [ 'table1Id', 'table2Id', 'column1' ],
    table1: {
      manyToOne: {
        thisId: 'table1Id',
        otherTable: 'Table1',
        otherId: 'id'
      }
    },
    table2: {
      manyToOne: {
        thisId: 'table2Id',
        otherTable: 'Table2',
        otherId: 'id'
      }
    }
  }
}