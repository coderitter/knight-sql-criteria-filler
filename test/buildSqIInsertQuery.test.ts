import { expect } from 'chai'
import 'mocha'
import { buildSqlInsertQuery, Schema } from '../src/sqlQueryBuilder'

describe('buildSqlInsertQuery', function() {
  it('should add simple properties', function() {
    let criteria = { a: 'a', b: 1 }
    let query = buildSqlInsertQuery(criteria, 'TableAB', schema)

    expect((<any> query)._values.length).to.equal(2)
    expect((<any> query)._values[0].column).to.equal('a')
    expect((<any> query)._values[0].value).to.equal('a')
    expect((<any> query)._values[1].column).to.equal('b')
    expect((<any> query)._values[1].value).to.equal(1)
  })

  it('should add values from property methods', function() {
    let parameter = new TestPropertyMethods
    let query = buildSqlInsertQuery(parameter, 'TableAB', schema)

    expect((<any> query)._values.length).to.equal(2)
    expect((<any> query)._values[0].column).to.equal('a')
    expect((<any> query)._values[0].value).to.equal('a')
    expect((<any> query)._values[1].column).to.equal('b')
    expect((<any> query)._values[1].value).to.equal(1)
  })
})

class TestPropertyMethods {
  get a() { return 'a' }
  get b() { return 1 }
}

const schema = {
  'TableAB': {
    name: 'TableAB',
    columns: [ 'a', 'b' ]
  }
} as Schema