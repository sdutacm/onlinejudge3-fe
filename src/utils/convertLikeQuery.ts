export default function (query, includedFields) {
  for (let field of includedFields) {
    if (Object.prototype.hasOwnProperty.call(query, field)) {
      query[`${field}__icontains`] = query[field];
      delete query[field];
    }
  }
}
