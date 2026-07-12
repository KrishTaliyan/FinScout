import createHttpError from "../utils/httpError.js";

export default function validateRequest(schema) {
  return (request, _response, next) => {
    const parsed = schema.safeParse(request.body);

    if (!parsed.success) {
      next(createHttpError(400, "Invalid request body.", parsed.error.flatten().fieldErrors));
      return;
    }

    request.validatedBody = parsed.data;
    next();
  };
}
