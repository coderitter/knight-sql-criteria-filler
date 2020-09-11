# Mega Nice SQL Criteria Filler

## Install

`npm install mega-nice-sql-criteria-filler`

This package uses [mega-nice-sql](https://github.com/c0deritter/mega-nice-sql) and [mega-nice-criteria](https://github.com/c0deritter/mega-nice-criteria).

## Overview

Every fill function takes an array of column names to ignore invalid or protected criteria fields.

### fillSqlInsertQuery()

```typescript
import sql from 'mega-nice-sql'
import { CreateCriteria } from 'mega-nice-criteria'
import { fillSqlInsertQuery } from 'mega-nice-sql-criteria-filler'

let options: CreateCriteria = {
  name: 'Matthias',
  age: 37
}

let columns = ['name', 'age']
let query = sql.insertInto('table')

fillSqlInsertQuery(query, options, columns)
```

### fillSqlSelectQuery()

```typescript
import sql from 'mega-nice-sql'
import { ReadCriteria } from 'mega-nice-criteria'
import { fillSqlSelectQuery } from 'mega-nice-sql-criteria-filler'

let options: ReadCriteria = {
  name: { operator: 'LIKE', value: '%tth%' },
  age: { operator: '>', value: 30 }
}

let columns = ['name', 'age']
let query = sql.select('*').from('table')

fillSqlSelectQuery(query, options, columns)
```

### fillSqlUpdateQuery()

```typescript
import sql from 'mega-nice-sql'
import { UpdateCriteria } from 'mega-nice-criteria'
import { fillSqlUpdateQuery } from 'mega-nice-sql-criteria-filler'

let options: UpdateCriteria = {
  id: 1
  set: {
    age: 33,
  }
}

let columns = ['name', 'age']
let query = sql.update('table')

fillSqlUpdateQuery(query, options, columns)
```

### fillSqlDeleteQuery()

```typescript
import sql from 'mega-nice-sql'
import { DeleteCriteria } from 'mega-nice-criteria'
import { fillSqlDeleteQuery } from 'mega-nice-sql-criteria-filler'

let options: DeleteCriteria = {
  id: 1
}

let query = sql.deleteFrom('table')
fillSqlDeleteQuery(query, options)
```
