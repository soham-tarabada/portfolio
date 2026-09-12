import { badRequest } from "../utils/httpError.js";

export function validate(schema, source = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const detail = result.error.issues
        .map((issue) => `${issue.path.join(".") || source}: ${issue.message}`)
        .join("; ");
      return next(badRequest(detail, "VALIDATION_ERROR"));
    }

    if (source === "query") {
      req.validatedQuery = result.data;
    } else {
      req[source] = result.data;
    }

    return next();
  };
}
