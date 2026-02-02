export function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation error",
          details: error.details.map((d) => ({
            field: d.path[0],
            message: d.message,
          })),
        },
      });
    }

    req.validatedBody = value;
    next();
  };
}
