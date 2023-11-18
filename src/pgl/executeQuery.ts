import { makeSchema } from "postgraphile";
import { parse, validate } from "postgraphile/graphql";
import { hookArgs, execute } from "postgraphile/grafast";
import postgraphileParams from "./env";
import { buildPreset } from "./graphile.config";

/**
 * Given a request context `requestContext`, GraphQL query text `source` and
 * optionally variable values and operation name, execute the given GraphQL
 * operation against our schema and return the result.
 */
export async function executeQuery(
  source: string,
  variableValues?: Record<string, unknown> | null,
  operationName?: string,
  jwt?: any
) {
  const preset = buildPreset({
    ...postgraphileParams,
    jwt: jwt,
  });
  const schemaResultPromise = makeSchema(preset);
  const { schema, resolvedPreset } = await schemaResultPromise;

  // Parse the GraphQL query text:
  const document = parse(source);

  // Validate the GraphQL document against the schema:
  const errors = validate(schema, document);
  if (errors.length > 0) {
    throw new Error(`Validation error(s) occurred`, { cause: errors });
  }

  // Prepare the execution arguments:
  const args = await hookArgs(
    {
      schema,
      document,
      variableValues,
      operationName,
    },
    resolvedPreset,
    {}
  );

  // Execute the request using Grafast:
  return await execute(args, resolvedPreset);
}
