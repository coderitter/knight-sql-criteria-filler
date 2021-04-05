import { expect } from 'chai'
import sql from 'knight-sql'
import 'mocha'
import { fillReadCriteria } from '../src/sqlCriteriaFiller'

describe('buildSqlSelectQuery', function() {
  it('should handle a simple select query', function() {
    let criteria = { a: 'a', b: 1 }
    let query = sql.select('*').from('Table')
    fillReadCriteria(query, criteria, ['a', 'b'])
    expect(query.mysql()).to.equal('SELECT * FROM Table WHERE a = ? AND b = ?;')
  })
})
