# Knight SQL Criteria Filler by Coderitter

## Related packages

This package uses criteria from [knight-criteria](https://github.com/c0deritter/knight-criteria) and fills a SQL query based on [knight-sql](https://github.com/c0deritter/knight-sql).

If you are looking for a more sophisticated solution to query a database use [knight-orm](https://github.com/c0deritter/knight-orm).

## Install

`npm install knight-sql-criteria-filler`

## Overview

Every fill function takes an array of column names to ignore invalid or protected criteria fields.

### fillCreateCriteria()

```typescript
import sql from 'knight-sql'
import { CreateCriteria } from 'knight-criteria'
import { fillCreateCriteria } from 'knight-sql-criteria-filler'

let criteria: CreateCriteria = {
  name: 'Matthias',
  age: 37
}

let query = sql.insertInto('table')

// last parameter is the list of valid column names
fillSqlInsertQuery(query, criteria, ['name', 'age'])

query.mysql() == 'INSERT INTO table (name, age) VALUES (?, ?)'
query.values() == ['Matthias', 37]
```

### fillReadCriteria()

```typescript
import sql from 'knight-sql'
import { ReadCriteria } from 'knight-criteria'
import { fillReadCriteria } from 'knight-sql-criteria-filler'

let criteria: ReadCriteria = {
  name: { operator: 'LIKE', value: '%tth%' },
  age: { operator: '>', value: 30 }
}

let query = sql.select('*').from('table')

// last parameter is the list of valid columns
fillSqlSelectQuery(query, criteria, ['name', 'age'])

query.mysql() == 'SELECT * FROM table WHERE name LIKE ? AND age > ?'
query.values() == ['%tth%', 30]
```

### fillUpdateCriteria()

```typescript
import sql from 'knight-sql'
import { UpdateCriteria } from 'knight-criteria'
import { fillUpdateCriteria } from 'knight-sql-criteria-filler'

let criteria: UpdateCriteria = {
  id: 1
  '@set': {
    age: 33
  }
}

let query = sql.update('table')

// last parameter is the list of valid columns
fillSqlUpdateQuery(query, criteria, ['name', 'age'])

query.mysql() == 'UPDATE table SET age = ? WHERE id = 1'
query.values() == [33, 1]
```

### fillDeleteCriteria()

```typescript
import sql from 'knight-sql'
import { DeleteCriteria } from 'knight-criteria'
import { fillDeleteCriteria } from 'knight-sql-criteria-filler'

let criteria: DeleteCriteria = {
  id: 1
}

let query = sql.deleteFrom('table')

// last parameter is the list of valid columns
fillSqlDeleteQuery(query, criteria, ['name', 'age'])

query.mysql() == 'DELETE FROM table WHERE id = ?'
query.values() == [1]
```
