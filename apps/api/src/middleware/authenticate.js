import { User } from "../models/User.js";
import { verifyAccessToken } from "../utils/tokens.js";
import { unauthorized } from "../utils/httpError.js";

export async function authenticate(req, res, next) {
  const header = req.get("authorization") || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(unauthorized("Missing bearer token."));
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (error) {
    const expired = error.name === "TokenExpiredError";
    return next(
      unauthorized(
        expired ? "Access token expired." : "Invalid access token.",
        expired ? "TOKEN_EXPIRED" : "INVALID_TOKEN"
      )
    );
  }

  if (payload.type !== "access") {
    return next(unauthorized("Wrong token type.", "INVALID_TOKEN"));
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    return next(unauthorized("Account no longer exists.", "ACCOUNT_MISSING"));
  }

  req.user = user;
  return next();
}
