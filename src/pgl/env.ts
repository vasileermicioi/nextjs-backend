const postgraphileEnvironement = {
  connectionString: process.env.DATABASE_URL || "",
  schemas: process.env.SCHEMAS || "public",
  jwtSecret: process.env.JWT_SECRET || "supersecretsecret!!",
  jwtAudience: process.env.JWT_AUDIENCE || "",
};

export default postgraphileEnvironement;
