import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { executeQuery } from "../../pgl/executeQuery";
import postgraphileParams from "../../pgl/env";

const checkJwt = (accessToken: string) => {
  let payload = null;
  try {
    const decoded = jwt.verify(accessToken, postgraphileParams.jwtSecret, {
      complete: true,
    });
    if (!(decoded?.payload as any).aud) {
      return {
        success: false,
        message: "jwt is missing audience",
      };
    }
    if (!decoded?.payload?.sub) {
      return {
        success: false,
        message: "jwt is missing subject",
      };
    }
    payload = decoded.payload;
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
  return {
    success: true,
    message: "",
    payload,
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let jwt = null;
  if (!req?.body?.query?.includes("__schema")) {
    const accessTokenParts = (req.headers?.authorization || "")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ");
    if (accessTokenParts.length < 2) {
      res.status(401).json({ message: "no access token" });
      return;
    }
    const jwtValidationResult = checkJwt(accessTokenParts[1]);
    if (!jwtValidationResult.success) {
      return res
        .status(401)
        .json({ message: `${jwtValidationResult.message}` });
    }
    jwt = jwtValidationResult.payload;
  }

  try {
    const { query, variables } = req.body;
    const result = await executeQuery(query, variables, undefined, jwt);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: `${err}` });
  }
}
