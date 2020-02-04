import { expect } from 'chai'
import 'mocha'
import sql, { Query } from 'mega-nice-sql'
import { fillCriteria } from '../src/sqlQueryBuilder'

describe('fillCriteria', function() {
  it('should add a simple column citerium', function() {
    let criteria = {
      a: 'a'
    }

    let query = new Query
    fillCriteria(query, criteria, ['a'])
    
    expect((<any> query)._wheres.length).to.equal(1)
    expect((<any> query)._wheres[0].column).to.equal('a')
    expect((<any> query)._wheres[0].operator).to.equal('=')
    expect((<any> query)._wheres[0].value).to.equal('a')
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
    expect((<any> query)._wheres[0].column).to.equal('a')
    expect((<any> query)._wheres[0].operator).to.equal('<>')
    expect((<any> query)._wheres[0].value).to.equal('a')
  })

  it('should add a null criterium', function() {
    let criteria = {
      a: null
    }

    let query = new Query
    fillCriteria(query, criteria, ['a'])
    
    expect((<any> query)._wheres.length).to.equal(1)
    expect((<any> query)._wheres[0].column).to.equal('a')
    expect((<any> query)._wheres[0].operator).to.equal('IS NULL')
  })

  it('should create an IN operator of an array of values', function() {
    let criteria1 = {
      a: [1, 2, 3, 4]
    }

    let query1 = new Query
    fillCriteria(query1, criteria1, ['a'])
    
    expect((<any> query1)._wheres.length).to.equal(1)
    expect((<any> query1)._wheres[0].column).to.equal('a')
    expect((<any> query1)._wheres[0].operator).to.equal('IN')
    expect((<any> query1)._wheres[0].value).to.deep.equal([1, 2, 3, 4])

    let criteria2 = {
      a: ['a', 'b', 'c', 'd']
    }

    let query2 = new Query
    fillCriteria(query2, criteria2, ['a'])
    
    expect((<any> query2)._wheres.length).to.equal(1)
    expect((<any> query2)._wheres[0].column).to.equal('a')
    expect((<any> query2)._wheres[0].operator).to.equal('IN')
    expect((<any> query2)._wheres[0].value).to.deep.equal(['a', 'b', 'c', 'd'])

    let date1 = new Date
    let date2 = new Date

    let criteria3 = {
      a: [date1, date2]
    }

    let query3 = new Query
    fillCriteria(query3, criteria3, ['a'])
    
    expect((<any> query3)._wheres.length).to.equal(1)
    expect((<any> query3)._wheres[0].column).to.equal('a')
    expect((<any> query3)._wheres[0].operator).to.equal('IN')
    expect((<any> query3)._wheres[0].value).to.deep.equal([date1, date2])
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
    expect((<any> query)._wheres[0].column).to.equal('a')
    expect((<any> query)._wheres[0].operator).to.equal('>')
    expect((<any> query)._wheres[0].value).to.equal(1)
    expect((<any> query)._wheres[1].column).to.equal('a')
    expect((<any> query)._wheres[1].operator).to.equal('<')
    expect((<any> query)._wheres[1].value).to.equal(10)
  })

  it('should set an empty array as value as an IN operator on an empty array', function() {
    let criteria = {
      a: []
    }

    let query = new Query
    fillCriteria(query, criteria, ['a'])

    expect((<any> query)._wheres.length).to.equal(1)
    expect((<any> query)._wheres[0].column).to.equal('a')
    expect((<any> query)._wheres[0].operator).to.equal('IN')
    expect((<any> query)._wheres[0].value).to.deep.equal([])
  })
})