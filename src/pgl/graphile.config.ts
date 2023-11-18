import { makePgService } from "postgraphile/adaptors/pg";
import { PostGraphileAmberPreset } from "postgraphile/presets/amber";
import { PgLazyJWTPreset } from "postgraphile/presets/lazy-jwt";
import { PostGraphileConnectionFilterPreset } from "postgraphile-plugin-connection-filter";
import { PgManyToManyPreset } from "@graphile-contrib/pg-many-to-many";
import { PgSimplifyInflectionPreset } from "@graphile/simplify-inflection";

export interface PostgraphileParams {
  connectionString: string;
  schemas: string;
  jwtSecret: string;
  jwtAudience: string;
  jwt?: any;
}

export const buildPreset = (postgraphileParams: PostgraphileParams) => {
  const preset: GraphileConfig.Preset = {
    extends: [
      PostGraphileAmberPreset,
      PgLazyJWTPreset,
      PostGraphileConnectionFilterPreset,
      PgManyToManyPreset,
      PgSimplifyInflectionPreset,
    ],
    inflection: {},
    schema: {
      retryOnInitFail: true,
    },
    grafserv: {
      port: 5678,
      graphqlPath: "/graphql",
      websockets: true,
      graphqlOverGET: true,
      pgJwtVerifyOptions: {
        audience: postgraphileParams.jwtAudience,
      },
      pgJwtSecret: postgraphileParams.jwtSecret,
    },
    grafast: {
      explain: false,
    },
    pgServices: [
      makePgService({
        connectionString: postgraphileParams.connectionString,
        schemas: (postgraphileParams.schemas || "")
          .split(",")
          .map((schema) => schema.trim()),
        pubsub: true,
        pgSettings: () => {
          return {
            "request.jwt.claims": JSON.stringify(postgraphileParams.jwt),
          };
        },
      }),
    ],
  };

  return preset;
};
