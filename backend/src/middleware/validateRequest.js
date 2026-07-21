/**
 * src/middleware/validateRequest.js
 *
 * validate({ body, query, params }) returns Express middleware that parses
 * the matching parts of the request against the given zod schemas. Any part
 * omitted from the config is left untouched. On success, req.body/query/params
 * are replaced with the parsed (and thus coerced/defaulted) values. On
 * failure, responds 400 with a flat list of { field, message } issues.
 */

function validate(schemas = {}) {
  return function validateRequestMiddleware(req, res, next) {
    const errors = [];
    const parts = ['body', 'query', 'params'];

    for (const part of parts) {
      const schema = schemas[part];
      if (!schema) continue;

      const result = schema.safeParse(req[part]);

      if (!result.success) {
        for (const issue of result.error.issues) {
          const field = [part, ...issue.path].join('.');
          errors.push({ field, message: issue.message });
        }
        continue;
      }

      req[part] = result.data;
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    next();
  };
}

module.exports = { validate };
