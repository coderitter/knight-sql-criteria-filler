# Mega Nice SQL Query Builder

## Install

`npm install mega-nice-sql-query-builder`

This package uses [mega-nice-sql](https://github.com/c0deritter/mega-nice-sql) and [mega-nice-db-query-options](https://github.com/c0deritter/mega-nice-db-query-options).

## Overview

### fillSqlInsertQuery()

```typescript
import sql from 'mega-nice-sql'
import { fillSqlInsertQuery } from 'mega-nice-sql-query-builder'
import { SqlInsertOptions } from 'mega-nice-sql-query-options'

let options: SqlInsertOptions = {
  name: 'Matthias',
  age: 37
}

let query = sql.insertInto('table')
fillSqlInsertQuery(query, options)
```

### fillSqlSelectQuery()

```typescript
import sql from 'mega-nice-sql'
import { fillSqlSelectQuery } from 'mega-nice-sql-query-builder'
import { SqlSelectOptions } from 'mega-nice-sql-query-options'

let options: SqlSelectOptions = {
  name: { operator: 'LIKE', value: '%tth%' },
  age: { operator: '>', value: 30 }
}

let query = sql.select('*').from('table')
fillSqlSelectQuery(query, options)
```

### fillSqlUpdateQuery()

```typescript
import sql from 'mega-nice-sql'
import { fillSqlUpdateQuery } from 'mega-nice-sql-query-builder'
import { SqlUpdateOptions } from 'mega-nice-sql-query-options'

let options: SqlUpdateOptions = {
  age: 33,
  queryOptions: {
    id: 1
  }
}

let query = sql.update('table')
fillSqlUpdateQuery(query, options)
```

### fillSqlDeleteQuery()

```typescript
import sql from 'mega-nice-sql'
import { fillSqlDeleteQuery } from 'mega-nice-sql-query-builder'
import { SqlDeleteOptions } from 'mega-nice-sql-query-options'

let options: SqlDeleteOptions = {
  id: 1
}

let query = sql.deleteFrom('table')
fillSqlDeleteQuery(query, options)
```

### Determine allowed columns

```typescript
let allowedColumns = [ 'id', 'name', 'age' ]

fillSqlInsertQuery(query, options, allowedColumns)
fillSqlSelectQuery(query, options, allowedColumns)
fillSqlUpdateQuery(query, options, allowedColumns)
fillSqlDeleteQuery(query, options, allowedColumns)
```