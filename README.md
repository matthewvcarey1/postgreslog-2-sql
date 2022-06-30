# postgreslog-2-sql
Utility to render stream of error log output into sql queries that can be run in a client.

This program turns an incoming stdin stream of postgres err logs into a stdout stream of SQL statements that can easily be run with a client like psql, PostBird or Postico.

You may need to add a final semicolon to use the queries in psql.

Execute statements are converted to regular statements with inline literal parameters.

More crucially it is possible prepend them with EXPLAIN ANALYZE and understand what aspects of the statements are not so efficient.

If you are using a library such as TypeOrm, you are insulated from the complexity of your queries on Postgres. This should help allow you to unpick what is actually happening.

Caveat: This code will not cope with a massive pipe of log text all at once, node just bales out, rather just pipe the logs as you run your database normally

If you are running postgres in a docker container you make a container that logs and get docker to record the logs locally.

## Usage

`tail -f postgres.err | src/postgreslog2Sql.ts`

## Requirements

node and typescript need to be installed.

Before using it the first time you will need to run in the root folder of this project.

`npm i`

You may need to set the file src/postgreslog2sql.ts as executable.

`chmod a+x src/postgreslog2sql.ts`

