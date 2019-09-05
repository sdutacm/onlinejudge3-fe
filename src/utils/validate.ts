import msg from "./msg";

export interface UploadFileType {
  name: string;
  type: string;
}

/**
 * validate file before upload
 * @param validTypes valid type rules
 * @param maxSize file size (MiB)
 */
export function validateFile(validTypes: UploadFileType[], maxSize: number) {
  return function (file) {
    const isValidType = validTypes.filter(v => v.type === file.type).length > 0;
    if (!isValidType) {
      msg.error(`Invalid file format. Only ${validTypes.map(v => v.name).join(', ')} allowed`);
    }
    const isValidSize = file.size / 1024 / 1024 < maxSize;
    if (!isValidSize) {
      msg.error(`File must be smaller than ${maxSize} MiB`);
    }
    return isValidType && isValidSize;
  };
}
