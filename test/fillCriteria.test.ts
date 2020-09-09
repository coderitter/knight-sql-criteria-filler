import { expect } from 'chai'
import { Query } from 'mega-nice-sql'
import 'mocha'
import { fillCriteria } from '../src/sqlQueryBuilder'

describe('fillCriteria', function() {
  it('should add a simple column citerium', function() {
    let criteria = {
      a: 'a'
    }

    let query = new Query
    fillCriteria(query, criteria, ['a'])

    expect((<any> query)._wheres.length).to.equal(1)
    expect((<any> query)._wheres[0].predicate).to.be.not.undefined
    expect((<any> query)._wheres[0].predicate.column).to.equal('a')
    expect((<any> query)._wheres[0].predicate.operator).to.equal('=')
    expect((<any> query)._wheres[0].predicate.value).to.equal('a')
  })

  it('should add a sophisticated column citerium', function() {
    let criteria = {
      a: {
        operator: '<>',
        value: 'a'
      }
    }

    let query = new Query
    fillCriteria(query, criteria, ['a'])
    
    expect((<any> query)._wheres.length).to.equal(1)
    expect((<any> query)._wheres[0].predicate).to.be.not.undefined
    expect((<any> query)._wheres[0].predicate.column).to.equal('a')
    expect((<any> query)._wheres[0].predicate.operator).to.equal('<>')
    expect((<any> query)._wheres[0].predicate.value).to.equal('a')
  })

  it('should not add a sophisticated column citerium if the value is undefined', function() {
    let criteria = {
      a: {
        operator: '<>',
        value: undefined
      }
    }

    let query = new Query
    fillCriteria(query, criteria, ['a'])
    
    expect((<any> query)._wheres.length).to.equal(0)
  })

  it('should add a null criterium', function() {
    let criteria1 = {
      a: null
    }

    let query1 = new Query
    fillCriteria(query1, criteria1, ['a'])

    expect((<any> query1)._wheres.length).to.equal(1)
    expect((<any> query1)._wheres[0].predicate).to.be.not.undefined
    expect((<any> query1)._wheres[0].predicate.column).to.equal('a')
    expect((<any> query1)._wheres[0].predicate.not).to.be.false

    let criteria2 = {
      a: 'IS NULL'
    }

    let query2 = new Query
    fillCriteria(query2, criteria2, ['a'])
    
    expect((<any> query2)._wheres.length).to.equal(1)
    expect((<any> query2)._wheres[0].predicate).to.be.not.undefined
    expect((<any> query2)._wheres[0].predicate.column).to.equal('a')
    expect((<any> query2)._wheres[0].predicate.not).to.be.false

    let criteria3 = {
      a: {
        operator: 'IS',
        value: 'NULL'
      }
    }

    let query3 = new Query
    fillCriteria(query3, criteria3, ['a'])
    
    expect((<any> query3)._wheres.length).to.equal(1)
    expect((<any> query3)._wheres[0].predicate).to.be.not.undefined
    expect((<any> query3)._wheres[0].predicate.column).to.equal('a')
    expect((<any> query3)._wheres[0].predicate.not).to.be.false
  })

  it('should create an IN operator of an array of values', function() {
    let criteria1 = {
      a: [1, 2, 3, 4]
    }

    let query1 = new Query
    fillCriteria(query1, criteria1, ['a'])
    
    expect((<any> query1)._wheres.length).to.equal(1)
    expect((<any> query1)._wheres[0].predicate).to.be.not.undefined
    expect((<any> query1)._wheres[0].predicate.column).to.equal('a')
    expect((<any> query1)._wheres[0].predicate.valuesArray).to.deep.equal([1, 2, 3, 4])

    let criteria2 = {
      a: ['a', 'b', 'c', 'd']
    }

    let query2 = new Query
    fillCriteria(query2, criteria2, ['a'])
    
    expect((<any> query2)._wheres.length).to.equal(1)
    expect((<any> query2)._wheres[0].predicate).to.be.not.undefined
    expect((<any> query2)._wheres[0].predicate.column).to.equal('a')
    expect((<any> query2)._wheres[0].predicate.valuesArray).to.deep.equal(['a', 'b', 'c', 'd'])

    let date1 = new Date
    let date2 = new Date

    let criteria3 = {
      a: [date1, date2]
    }

    let query3 = new Query
    fillCriteria(query3, criteria3, ['a'])
    
    expect((<any> query3)._wheres.length).to.equal(1)
    expect((<any> query3)._wheres[0].predicate).to.be.not.undefined
    expect((<any> query3)._wheres[0].predicate.column).to.equal('a')
    expect((<any> query3)._wheres[0].predicate.valuesArray).to.deep.equal([date1, date2])
  })

  it('should accept an array if sophisticated column criteria', function() {
    let criteria = {
      a: [
        {
          operator: '>',
          value: 1
        },
        {
          operator: '<',
          value: 10
        }
      ]
    }

    let query = new Query
    fillCriteria(query, criteria, ['a'])
    
    expect((<any> query)._wheres.length).to.equal(2)
    expect((<any> query)._wheres[0].predicate).to.be.not.undefined
    expect((<any> query)._wheres[0].predicate.column).to.equal('a')
    expect((<any> query)._wheres[0].predicate.operator).to.equal('>')
    expect((<any> query)._wheres[0].predicate.value).to.equal(1)
    expect((<any> query)._wheres[1].predicate).to.be.not.undefined
    expect((<any> query)._wheres[1].predicate.column).to.equal('a')
    expect((<any> query)._wheres[1].predicate.operator).to.equal('<')
    expect((<any> query)._wheres[1].predicate.value).to.equal(10)
  })

  it('should set an empty array as value as an IN operator on an empty array', function() {
    let criteria = {
      a: []
    }

    let query = new Query
    fillCriteria(query, criteria, ['a'])

    expect((<any> query)._wheres.length).to.equal(1)
    expect((<any> query)._wheres[0].predicate).to.be.not.undefined
    expect((<any> query)._wheres[0].predicate.column).to.equal('a')
    expect((<any> query)._wheres[0].predicate.valuesArray).to.deep.equal([])
  })

  it('should regard inherited properties', function() {
    let criteria = new TestSubCriteria

    let query = new Query
    fillCriteria(query, criteria, ['a', 'b'])

    expect((<any> query)._wheres.length).to.equal(2)
    expect((<any> query)._wheres[0].predicate).to.be.not.undefined
    expect((<any> query)._wheres[0].predicate.column).to.equal('a')
    expect((<any> query)._wheres[0].predicate.operator).to.equal('=')
    expect((<any> query)._wheres[0].predicate.value).to.equal('a')
    expect((<any> query)._wheres[1].predicate).to.be.not.undefined
    expect((<any> query)._wheres[1].predicate.column).to.equal('b')
    expect((<any> query)._wheres[1].predicate.operator).to.equal('=')
    expect((<any> query)._wheres[1].predicate.value).to.equal(1)
  })

  it('should regard property methods', function() {
    let criteria = new TestPropertyMethods

    let query = new Query
    fillCriteria(query, criteria, ['a', 'b'])

    expect((<any> query)._wheres.length).to.equal(2)
    expect((<any> query)._wheres[0].predicate).to.be.not.undefined
    expect((<any> query)._wheres[0].predicate.column).to.equal('a')
    expect((<any> query)._wheres[0].predicate.operator).to.equal('=')
    expect((<any> query)._wheres[0].predicate.value).to.equal('a')
    expect((<any> query)._wheres[1].predicate).to.be.not.undefined
    expect((<any> query)._wheres[1].predicate.column).to.equal('b')
    expect((<any> query)._wheres[1].predicate.operator).to.equal('=')
    expect((<any> query)._wheres[1].predicate.value).to.equal(1)
  })
})

class TestCriteria {
  a = 'a'
}

class TestSubCriteria extends TestCriteria {
  b = 1
}

class TestPropertyMethods {
  get a() { return 'a' }
  get b() { return 1 }
}