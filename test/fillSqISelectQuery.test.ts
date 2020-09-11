import { expect } from 'chai'
import sql from 'mega-nice-sql'
import 'mocha'
import { fillSqlSelectQuery } from '../src/sqlCriteriaFiller'

describe('buildSqlSelectQuery', function() {
  it('should handle a simple select query', function() {
    let criteria = { a: 'a', b: 1 }
    let query = sql.select('*').from('Table')
    fillSqlSelectQuery(query, criteria, ['a', 'b'])
    expect(query.mysql()).to.equal('SELECT * FROM Table WHERE a = ? AND b = ?;')
  })
})
