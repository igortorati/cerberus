import { z } from 'zod'

z.setErrorMap((issue, ctx) => {
  const defaultRequiredMessage = `O campo "${issue.path.join(".")}" precisa ser informado`
  if (issue.code === "invalid_type" && issue.received === "undefined") {
    return { message: defaultRequiredMessage };
  }

  if (issue.code === "too_small" && issue.type === "string") {
    return { message: defaultRequiredMessage };
  }

  return { message: ctx.defaultError };
});

export { z }