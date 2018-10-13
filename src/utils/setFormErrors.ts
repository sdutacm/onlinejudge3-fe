export default function (form, errors) {
  let newFields = {};
  for (let field in errors) {
    if (errors.hasOwnProperty(field)) {
      newFields[field] = {
        value: form.getFieldValue(field),
        errors: [new Error(errors[field])],
      };
    }
  }
  form.setFields(newFields);
}
