## Why Postgraphile?

We use postgraphile v5 as alternative for pg_graphql that comes out of the box in Supabase

- camel-case as in javascript community
  if tables are snake case, postgraphile will make them camel case e.g. user_roles -> userRoles
  and pg_graphql will only append a `Collection`` suffix: e.g. user_roles -> user_rolesCollection
- extendable with views, functions and stored-procedures
  postgraphile will expose all these in graphql, see https://postgraphile.org/postgraphile/next/computed-columns
  at the time of writing, Supabase is exposing these through rest rpc, but not in graphql
