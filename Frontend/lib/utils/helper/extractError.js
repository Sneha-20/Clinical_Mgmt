export const extractYupErrors = (yupError) => {
  const errors = {};
  if (yupError.inner) {
    yupError.inner.forEach((err) => {
      if (err.path) errors[err.path] = err.message;
    });
  }
  return errors;
};
