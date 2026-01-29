import Database from 'better-sqlite3'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'

// Create database in the project root
const dbPath = path.join(process.cwd(), 'local.db')
console.log('[SQLite] Opening database at:', dbPath)

const db = new Database(dbPath)
// Enable foreign keys
db.pragma('foreign_keys = ON')

type FilterOperator = 'eq' | 'neq' | 'in' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains'

interface Filter {
  column: string
  operator: FilterOperator
  value: any
}

interface QueryOptions {
  select: string
  filters: Filter[]
  orderBy?: { column: string; ascending: boolean }
  limit?: number
  single?: boolean
  count?: 'exact' | null
  head?: boolean
}

// Helper to parse tags JSON
function parseRow(row: any, table: string): any {
  if (!row) return null

  const result = { ...row }

  // Convert SQLite integers to booleans
  if ('is_admin' in result) result.is_admin = Boolean(result.is_admin)
  if ('is_featured' in result) result.is_featured = Boolean(result.is_featured)

  // Parse JSON arrays
  if ('tags' in result && typeof result.tags === 'string') {
    try {
      result.tags = JSON.parse(result.tags)
    } catch {
      result.tags = []
    }
  }

  return result
}

// Join related data
function joinRelations(row: any, select: string): any {
  if (!row || !select.includes(':')) return row

  const result = { ...row }

  // Handle user:users(*) pattern
  if (select.includes('user:users')) {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(row.user_id)
    result.user = parseRow(user, 'users')
  }

  // Handle project:projects(*) pattern
  if (select.includes('project:projects')) {
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(row.project_id)
    if (project) {
      const parsedProject = parseRow(project, 'projects')
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(parsedProject.user_id)
      parsedProject.user = parseRow(user, 'users')
      result.project = parsedProject
    }
  }

  // Handle grant:grants(*) pattern
  if (select.includes('grant:grants')) {
    const grant = db.prepare('SELECT * FROM grants WHERE id = ?').get(row.grant_id)
    result.grant = parseRow(grant, 'grants')
  }

  return result
}

class SQLiteQueryBuilder {
  private table: string
  private options: QueryOptions = { select: '*', filters: [] }

  constructor(table: string) {
    this.table = table
  }

  select(columns: string = '*', opts?: { count?: 'exact'; head?: boolean }) {
    this.options.select = columns
    if (opts?.count) this.options.count = opts.count
    if (opts?.head) this.options.head = opts.head
    return this
  }

  eq(column: string, value: any) {
    this.options.filters.push({ column, operator: 'eq', value })
    return this
  }

  neq(column: string, value: any) {
    this.options.filters.push({ column, operator: 'neq', value })
    return this
  }

  in(column: string, values: any[]) {
    this.options.filters.push({ column, operator: 'in', value: values })
    return this
  }

  contains(column: string, value: any[]) {
    this.options.filters.push({ column, operator: 'contains', value })
    return this
  }

  gt(column: string, value: any) {
    this.options.filters.push({ column, operator: 'gt', value })
    return this
  }

  lt(column: string, value: any) {
    this.options.filters.push({ column, operator: 'lt', value })
    return this
  }

  gte(column: string, value: any) {
    this.options.filters.push({ column, operator: 'gte', value })
    return this
  }

  lte(column: string, value: any) {
    this.options.filters.push({ column, operator: 'lte', value })
    return this
  }

  order(column: string, { ascending = true }: { ascending?: boolean } = {}) {
    this.options.orderBy = { column, ascending }
    return this
  }

  limit(count: number) {
    this.options.limit = count
    return this
  }

  single() {
    this.options.single = true
    return this.execute()
  }

  private buildWhereClause(): { sql: string; params: any[] } {
    if (this.options.filters.length === 0) {
      return { sql: '', params: [] }
    }

    const conditions: string[] = []
    const params: any[] = []

    for (const filter of this.options.filters) {
      switch (filter.operator) {
        case 'eq':
          conditions.push(`${filter.column} = ?`)
          params.push(filter.value)
          break
        case 'neq':
          conditions.push(`${filter.column} != ?`)
          params.push(filter.value)
          break
        case 'in':
          const placeholders = filter.value.map(() => '?').join(', ')
          conditions.push(`${filter.column} IN (${placeholders})`)
          params.push(...filter.value)
          break
        case 'contains':
          // For JSON array contains in SQLite
          const containsConditions = filter.value.map(() => `${filter.column} LIKE ?`).join(' OR ')
          conditions.push(`(${containsConditions})`)
          filter.value.forEach((v: any) => params.push(`%"${v}"%`))
          break
        case 'gt':
          conditions.push(`${filter.column} > ?`)
          params.push(filter.value)
          break
        case 'lt':
          conditions.push(`${filter.column} < ?`)
          params.push(filter.value)
          break
        case 'gte':
          conditions.push(`${filter.column} >= ?`)
          params.push(filter.value)
          break
        case 'lte':
          conditions.push(`${filter.column} <= ?`)
          params.push(filter.value)
          break
      }
    }

    return { sql: `WHERE ${conditions.join(' AND ')}`, params }
  }

  async execute(): Promise<{ data: any; error: null; count?: number }> {
    try {
      const { sql: whereClause, params } = this.buildWhereClause()

      // Handle count queries
      if (this.options.count === 'exact' && this.options.head) {
        const countSql = `SELECT COUNT(*) as count FROM ${this.table} ${whereClause}`
        const result = db.prepare(countSql).get(...params) as { count: number }
        return { data: null, error: null, count: result.count }
      }

      let sql = `SELECT * FROM ${this.table} ${whereClause}`

      if (this.options.orderBy) {
        sql += ` ORDER BY ${this.options.orderBy.column} ${this.options.orderBy.ascending ? 'ASC' : 'DESC'}`
      }

      if (this.options.limit) {
        sql += ` LIMIT ${this.options.limit}`
      }

      const stmt = db.prepare(sql)

      if (this.options.single) {
        const row = stmt.get(...params)
        let parsed = parseRow(row, this.table)
        if (parsed && this.options.select) {
          parsed = joinRelations(parsed, this.options.select)
        }
        return { data: parsed, error: null }
      }

      const rows = stmt.all(...params)
      let data = rows.map(row => {
        let parsed = parseRow(row, this.table)
        if (this.options.select) {
          parsed = joinRelations(parsed, this.options.select)
        }
        return parsed
      })

      return { data, error: null }
    } catch (error) {
      console.error('SQLite query error:', error)
      return { data: null, error: null }
    }
  }

  then<TResult>(
    onfulfilled?: (value: { data: any; error: null; count?: number }) => TResult
  ): Promise<TResult> {
    return this.execute().then(onfulfilled)
  }
}

class SQLiteInsertBuilder {
  private table: string
  private values: any
  private returnSelect: boolean = false

  constructor(table: string, values: any) {
    this.table = table
    this.values = values
  }

  select() {
    this.returnSelect = true
    return this
  }

  single() {
    return this.execute()
  }

  async execute(): Promise<{ data: any; error: null }> {
    try {
      const id = this.values.id || uuidv4()
      const now = new Date().toISOString()

      const data = {
        id,
        ...this.values,
        created_at: this.values.created_at || now,
        updated_at: this.values.updated_at || now,
      }

      // Handle tags array
      if (Array.isArray(data.tags)) {
        data.tags = JSON.stringify(data.tags)
      }

      // Convert booleans to integers
      if ('is_admin' in data) data.is_admin = data.is_admin ? 1 : 0
      if ('is_featured' in data) data.is_featured = data.is_featured ? 1 : 0

      const columns = Object.keys(data)
      const placeholders = columns.map(() => '?').join(', ')
      const sql = `INSERT INTO ${this.table} (${columns.join(', ')}) VALUES (${placeholders})`

      db.prepare(sql).run(...Object.values(data))

      // Return the inserted data
      const result = parseRow(data, this.table)
      return { data: result, error: null }
    } catch (error) {
      console.error('SQLite insert error:', error)
      return { data: null, error: null }
    }
  }

  then<TResult>(onfulfilled?: (value: { data: any; error: null }) => TResult): Promise<TResult> {
    return this.execute().then(onfulfilled)
  }
}

class SQLiteUpdateBuilder {
  private table: string
  private values: any
  private filters: Filter[] = []
  private returnSelect: boolean = false

  constructor(table: string, values: any) {
    this.table = table
    this.values = values
  }

  eq(column: string, value: any) {
    this.filters.push({ column, operator: 'eq', value })
    return this
  }

  select() {
    this.returnSelect = true
    return this
  }

  single() {
    return this.execute()
  }

  async execute(): Promise<{ data: any; error: null }> {
    try {
      const data = { ...this.values, updated_at: new Date().toISOString() }

      // Handle tags array
      if (Array.isArray(data.tags)) {
        data.tags = JSON.stringify(data.tags)
      }

      // Convert booleans to integers
      if ('is_admin' in data) data.is_admin = data.is_admin ? 1 : 0
      if ('is_featured' in data) data.is_featured = data.is_featured ? 1 : 0

      const setClauses = Object.keys(data).map(k => `${k} = ?`).join(', ')
      const whereClause = this.filters.map(f => `${f.column} = ?`).join(' AND ')
      const sql = `UPDATE ${this.table} SET ${setClauses} WHERE ${whereClause}`

      const params = [...Object.values(data), ...this.filters.map(f => f.value)]
      db.prepare(sql).run(...params)

      // Return updated data
      if (this.returnSelect && this.filters.length > 0) {
        const selectSql = `SELECT * FROM ${this.table} WHERE ${whereClause}`
        const row = db.prepare(selectSql).get(...this.filters.map(f => f.value))
        return { data: parseRow(row, this.table), error: null }
      }

      return { data, error: null }
    } catch (error) {
      console.error('SQLite update error:', error)
      return { data: null, error: null }
    }
  }

  then<TResult>(onfulfilled?: (value: { data: any; error: null }) => TResult): Promise<TResult> {
    return this.execute().then(onfulfilled)
  }
}

class SQLiteDeleteBuilder {
  private table: string
  private filters: Filter[] = []

  constructor(table: string) {
    this.table = table
  }

  eq(column: string, value: any) {
    this.filters.push({ column, operator: 'eq', value })
    return this
  }

  async execute(): Promise<{ data: null; error: null }> {
    try {
      const whereClause = this.filters.map(f => `${f.column} = ?`).join(' AND ')
      const sql = `DELETE FROM ${this.table} WHERE ${whereClause}`
      db.prepare(sql).run(...this.filters.map(f => f.value))
      return { data: null, error: null }
    } catch (error) {
      console.error('SQLite delete error:', error)
      return { data: null, error: null }
    }
  }

  then<TResult>(onfulfilled?: (value: { data: null; error: null }) => TResult): Promise<TResult> {
    return this.execute().then(onfulfilled)
  }
}

class SQLiteTableBuilder {
  private tableName: string

  constructor(tableName: string) {
    this.tableName = tableName
  }

  select(columns: string = '*', opts?: { count?: 'exact'; head?: boolean }) {
    const builder = new SQLiteQueryBuilder(this.tableName)
    return builder.select(columns, opts)
  }

  insert(values: any) {
    return new SQLiteInsertBuilder(this.tableName, values)
  }

  update(values: any) {
    return new SQLiteUpdateBuilder(this.tableName, values)
  }

  delete() {
    return new SQLiteDeleteBuilder(this.tableName)
  }
}

// Mock auth for local development
let currentUserId: string | null = null

const localAuth = {
  getUser: async () => {
    if (!currentUserId) {
      return { data: { user: null }, error: null }
    }
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(currentUserId)
    if (user) {
      return {
        data: {
          user: { id: (user as any).id, email: (user as any).email }
        },
        error: null
      }
    }
    return { data: { user: null }, error: null }
  },
  signInWithOAuth: async ({ provider, options }: any) => {
    return { data: {}, error: null }
  },
  signOut: async () => {
    currentUserId = null
    return { error: null }
  },
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return {
      data: {
        subscription: {
          unsubscribe: () => {}
        }
      }
    }
  }
}

// Export for setting user in development
export function setLocalUser(userId: string | null) {
  currentUserId = userId
}

// Main SQLite client that mimics Supabase
export function createSQLiteClient() {
  return {
    from: (table: string) => new SQLiteTableBuilder(table),
    auth: localAuth,
  }
}

export function shouldUseLocalDb(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  return !supabaseUrl || supabaseUrl === '' || supabaseUrl === 'your_supabase_url'
}
