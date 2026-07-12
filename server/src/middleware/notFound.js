import createHttpError from "../utils/httpError.js";

export default function notFound(request, _response, next) {
  next(createHttpError(404, `Route not found: ${request.method} ${request.originalUrl}`));
}
