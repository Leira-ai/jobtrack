export const DEFAULT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_DOCUMENT_EXTENSIONS = ["pdf", "docx"] as const;
export const DOCUMENT_MIME_TYPE_BY_EXTENSION = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
} as const;
export const ALLOWED_DOCUMENT_MIME_TYPES = Object.values(
  DOCUMENT_MIME_TYPE_BY_EXTENSION,
);

export interface FileMetadata {
  readonly name: string;
  readonly size: number;
  readonly type: string;
}

export type FileValidationCode =
  | "empty"
  | "too-large"
  | "unsupported-extension"
  | "unsupported-mime";

export interface FileValidationError {
  readonly code: FileValidationCode;
  readonly message: string;
}

export interface FileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly FileValidationError[];
}

export interface FileValidationOptions {
  readonly maxSizeBytes?: number;
  readonly allowedExtensions?: readonly string[];
  readonly allowedMimeTypes?: readonly string[];
}

export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot <= 0 ? "" : fileName.slice(lastDot + 1).toLowerCase();
}

export function validateDocumentFile(
  file: FileMetadata,
  options: FileValidationOptions = {},
): FileValidationResult {
  const maxSizeBytes = options.maxSizeBytes ?? DEFAULT_MAX_FILE_SIZE_BYTES;
  const extensions = (
    options.allowedExtensions ?? ALLOWED_DOCUMENT_EXTENSIONS
  ).map((value) => value.toLowerCase());
  const mimeTypes = (
    options.allowedMimeTypes ?? ALLOWED_DOCUMENT_MIME_TYPES
  ).map((value) => value.toLowerCase());
  const extension = getFileExtension(file.name);
  const mimeType = file.type.toLowerCase().split(";", 1)[0]?.trim() ?? "";
  const errors: FileValidationError[] = [];

  if (file.size <= 0)
    errors.push({ code: "empty", message: "The selected file is empty." });
  if (file.size > maxSizeBytes) {
    errors.push({
      code: "too-large",
      message: `File must be no larger than ${maxSizeBytes} bytes.`,
    });
  }
  if (!extensions.includes(extension)) {
    errors.push({
      code: "unsupported-extension",
      message: `File extension .${extension || "(none)"} is not supported.`,
    });
  }
  if (!mimeTypes.includes(mimeType)) {
    errors.push({
      code: "unsupported-mime",
      message: `File type ${mimeType || "(empty)"} is not supported.`,
    });
  } else if (
    mimeType &&
    extension in DOCUMENT_MIME_TYPE_BY_EXTENSION &&
    mimeType !==
      DOCUMENT_MIME_TYPE_BY_EXTENSION[
        extension as keyof typeof DOCUMENT_MIME_TYPE_BY_EXTENSION
      ]
  ) {
    errors.push({
      code: "unsupported-mime",
      message: `File type ${mimeType} does not match the .${extension} extension.`,
    });
  }
  return { valid: errors.length === 0, errors };
}

export const validateFile = validateDocumentFile;
export const isValidDocumentFile = (
  file: FileMetadata,
  options?: FileValidationOptions,
): boolean => validateDocumentFile(file, options).valid;
