function splitHeadersAndBody(raw: string) {
  const match = raw.match(/\r?\n\r?\n/);

  if (!match || match.index === undefined) {
    return {
      headers: "",
      body: raw
    };
  }

  const separatorLength = match[0].length;
  return {
    headers: raw.slice(0, match.index),
    body: raw.slice(match.index + separatorLength)
  };
}

function parseHeaders(block: string) {
  const normalized = block.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const headers: Record<string, string> = {};
  let currentKey = "";

  for (const line of lines) {
    if (!line.trim()) {
      continue;
    }

    if (/^\s/.test(line) && currentKey) {
      headers[currentKey] = `${headers[currentKey]} ${line.trim()}`.trim();
      continue;
    }

    const separatorIndex = line.indexOf(":");

    if (separatorIndex === -1) {
      continue;
    }

    currentKey = line.slice(0, separatorIndex).trim().toLowerCase();
    headers[currentKey] = line.slice(separatorIndex + 1).trim();
  }

  return headers;
}

function getHeaderParameter(value: string, key: string) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = value.match(new RegExp(`${escapedKey}\\*?=(?:"([^"]+)"|([^;]+))`, "i"));
  const raw = (match?.[1] || match?.[2] || "").trim();

  if (!raw) {
    return "";
  }

  const rfc5987Match = raw.match(/^([^']*)'[^']*'(.*)$/);
  if (rfc5987Match) {
    try {
      return decodeURIComponent(rfc5987Match[2]);
    } catch {
      return rfc5987Match[2];
    }
  }

  return raw;
}

function getCharset(contentType: string) {
  const match = contentType.match(/charset="?([^";]+)"?/i);
  return match?.[1]?.toLowerCase() || "utf-8";
}

function getBoundary(contentType: string) {
  const match = contentType.match(/boundary="?([^";]+)"?/i);
  return match?.[1] || "";
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, code) => String.fromCharCode(parseInt(code, 16)));
}

function decodeQuotedPrintable(input: string, charset: string) {
  const compacted = input.replace(/=\r?\n/g, "");
  const buffer = Buffer.alloc(compacted.length);
  let bytesWritten = 0;

  for (let i = 0; i < compacted.length; i++) {
    if (compacted[i] === "=" && i + 2 < compacted.length) {
      const hex = compacted.slice(i + 1, i + 3);
      if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
        buffer[bytesWritten++] = parseInt(hex, 16);
        i += 2;
        continue;
      }
    }

    buffer[bytesWritten++] = compacted.charCodeAt(i);
  }

  const isUtf8 = charset === "utf-8" || charset === "utf8" || charset.includes("utf-8");
  return buffer.slice(0, bytesWritten).toString(isUtf8 ? "utf8" : "latin1");
}

function decodeTransferBody(body: string, encoding: string, charset: string) {
  const normalizedEncoding = encoding.trim().toLowerCase();

  try {
    if (normalizedEncoding === "base64") {
      const compact = body.replace(/\s+/g, "");
      const isUtf8 = charset === "utf-8" || charset === "utf8" || charset.includes("utf-8");
      return Buffer.from(compact, "base64").toString(isUtf8 ? "utf8" : "latin1");
    }

    if (normalizedEncoding === "quoted-printable") {
      return decodeQuotedPrintable(body, charset);
    }
  } catch {
    return body;
  }

  return body;
}

function decodeTransferBodyBuffer(body: string, encoding: string) {
  const normalizedEncoding = encoding.trim().toLowerCase();

  try {
    if (normalizedEncoding === "base64") {
      return Buffer.from(body.replace(/\s+/g, ""), "base64");
    }

    if (normalizedEncoding === "quoted-printable") {
      const decoded = decodeQuotedPrintable(body, "latin1");
      return Buffer.from(decoded, "latin1");
    }
  } catch {
    return Buffer.from(body, "utf8");
  }

  return Buffer.from(body, "utf8");
}

function htmlToText(html: string) {
  return decodeHtmlEntities(
    html
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<li\b[^>]*>/gi, "• ")
      .replace(/<[^>]+>/g, " ")
  );
}

function stripMimeArtifacts(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/^\s*This is a multi-part message in MIME format\.\s*$/gim, "")
    .replace(/^\s*Content-[^:\n]+:.*$/gim, "")
    .replace(/^\s*Mime-Version:.*$/gim, "")
    .replace(/^\s*charset="?[^"\n]+"?\s*$/gim, "")
    .replace(/^\s*boundary="?[^"\n]+"?\s*$/gim, "")
    .replace(/^\s*--[-A-Za-z0-9_=.:/]+--?\s*$/gim, "")
    .replace(/^\s*----_NmP-[^\n]*$/gim, "")
    .replace(/^\s*------=_Part_[^\n]*$/gim, "")
    .replace(/\.[A-Za-z0-9_-]+\s*\{[^}]+\}/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizeEmailText(input: string) {
  return stripMimeArtifacts(decodeHtmlEntities(input)).trim();
}

function splitMultipartBody(body: string, boundary: string) {
  const normalized = body.replace(/\r\n/g, "\n");
  const marker = `--${boundary}`;

  return normalized
    .split(marker)
    .slice(1)
    .map((part) => part.replace(/^\n+/, "").replace(/\n+--$/, "").trim())
    .filter((part) => part && part !== "--");
}

type ExtractedMimeAttachment = {
  fileName: string;
  contentType: string;
  size: number;
  contentId: string | null;
  contentLocation: string | null;
  disposition: string | null;
  content: Buffer;
};

export type EmailAttachmentContent = {
  fileName: string;
  contentType: string;
  size: number;
  contentId: string | null;
  contentLocation: string | null;
  disposition: string | null;
  content: Buffer;
};

function normalizeContentId(value: string | null | undefined) {
  return String(value || "")
    .trim()
    .replace(/^<|>$/g, "")
    .toLowerCase();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const maxInlineImageBytes = 4 * 1024 * 1024;

function replaceAllLiteral(value: string, search: string, replacement: string) {
  if (!search) {
    return value;
  }

  return value.replace(new RegExp(escapeRegExp(search), "gi"), () => replacement);
}

function replaceHtmlAttributeUrl(html: string, url: string, replacement: string) {
  if (!url) {
    return html;
  }

  const escapedUrl = escapeRegExp(url);
  return html.replace(
    new RegExp(`\\b(src|background)\\s*=\\s*(["'])${escapedUrl}\\2`, "gi"),
    (_match, attribute: string, quote: string) => `${attribute}=${quote}${replacement}${quote}`
  );
}

function isStoredAttachment(input: {
  contentType: string;
  disposition?: string | null;
  contentId?: string | null;
}) {
  const isInlineImage =
    input.contentType.toLowerCase().startsWith("image/") &&
    (input.disposition === "inline" || Boolean(input.contentId));

  return !isInlineImage;
}

function embedInlineImages(html: string, attachments: ExtractedMimeAttachment[]) {
  if (!html || !attachments.length) {
    return html;
  }

  let nextHtml = html;

  for (const attachment of attachments) {
    if (!attachment.contentId || !attachment.contentType.toLowerCase().startsWith("image/")) {
      continue;
    }

    if (attachment.content.length > maxInlineImageBytes) {
      continue;
    }

    const dataUrl = `data:${attachment.contentType};base64,${attachment.content.toString("base64")}`;
    const cidValues = new Set([
      attachment.contentId,
      encodeURIComponent(attachment.contentId),
      attachment.contentId.replace(/@/g, "%40")
    ]);

    for (const cidValue of cidValues) {
      nextHtml = replaceAllLiteral(nextHtml, `cid:${cidValue}`, dataUrl);
    }

    nextHtml = replaceHtmlAttributeUrl(nextHtml, attachment.contentLocation || "", dataUrl);
    nextHtml = replaceHtmlAttributeUrl(nextHtml, attachment.fileName || "", dataUrl);
    nextHtml = replaceHtmlAttributeUrl(nextHtml, `./${attachment.fileName || ""}`, dataUrl);
  }

  return nextHtml;
}

function extractMimeParts(raw: string): { htmlParts: string[]; textParts: string[]; attachments: ExtractedMimeAttachment[] } {
  const { headers: headerBlock, body } = splitHeadersAndBody(raw);
  const headers = parseHeaders(headerBlock);
  const contentType = headers["content-type"] || "text/plain; charset=utf-8";
  const contentDisposition = headers["content-disposition"] || "";
  const mimeType = contentType.split(";")[0]?.trim().toLowerCase() || "text/plain";

  if (mimeType.startsWith("multipart/")) {
    const boundary = getBoundary(contentType);

    if (!boundary) {
      return { htmlParts: [], textParts: [normalizeEmailText(body)], attachments: [] };
    }

    return splitMultipartBody(body, boundary).reduce(
      (accumulator, part) => {
        const result = extractMimeParts(part);
        accumulator.htmlParts.push(...result.htmlParts);
        accumulator.textParts.push(...result.textParts);
        accumulator.attachments.push(...result.attachments);
        return accumulator;
      },
      { htmlParts: [] as string[], textParts: [] as string[], attachments: [] as ExtractedMimeAttachment[] }
    );
  }

  const charset = getCharset(contentType);
  const encoding = headers["content-transfer-encoding"] || "";
  const decoded = decodeTransferBody(body, encoding, charset).trim();

  if (!decoded) {
    return { htmlParts: [], textParts: [], attachments: [] };
  }

  const disposition = contentDisposition.split(";")[0]?.trim().toLowerCase() || null;
  const fileName = getHeaderParameter(contentDisposition, "filename") || getHeaderParameter(contentType, "name");
  const contentId = normalizeContentId(headers["content-id"]) || null;
  const contentLocation = (headers["content-location"] || "").trim() || null;

  if (mimeType === "text/html" && disposition !== "attachment") {
    return {
      htmlParts: [decoded],
      textParts: [normalizeEmailText(htmlToText(decoded))],
      attachments: []
    };
  }

  if (mimeType === "text/plain" && disposition !== "attachment") {
    return {
      htmlParts: [],
      textParts: [normalizeEmailText(decoded)],
      attachments: []
    };
  }

  const content = decodeTransferBodyBuffer(body, encoding);

  return {
    htmlParts: [],
    textParts: [],
    attachments: [
      {
        fileName: fileName || contentId || "attachment",
        contentType: mimeType || "application/octet-stream",
        size: content.length,
        contentId,
        contentLocation,
        disposition,
        content
      }
    ]
  };
}

export function wrapEmailTextAsHtml(text: string) {
  const normalized = normalizeEmailText(text);

  if (!normalized) {
    return "";
  }

  const escaped = normalized
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

export function extractEmailContentFromMime(source: string | Buffer | undefined) {
  const raw = Buffer.from(source || "").toString("utf8");

  if (!raw.trim()) {
    return { text: "", html: "", attachments: [] };
  }

  const result = extractMimeParts(raw);
  const rawHtml = result.htmlParts.find((part) => part.trim()) || "";
  const html = embedInlineImages(rawHtml, result.attachments);
  const text = result.textParts.find((part) => part.trim()) || normalizeEmailText(htmlToText(html)) || normalizeEmailText(raw);
  const attachments = result.attachments.map((attachment) => ({
    fileName: attachment.fileName,
    contentType: attachment.contentType,
    size: attachment.size,
    contentId: attachment.contentId,
    contentLocation: attachment.contentLocation,
    disposition: attachment.disposition
  }));

  return {
    text,
    html,
    attachments
  };
}

export function extractEmailAttachmentFromMime(source: string | Buffer | undefined, attachmentIndex: number): EmailAttachmentContent | null {
  if (!Number.isInteger(attachmentIndex) || attachmentIndex < 0) {
    return null;
  }

  const raw = Buffer.from(source || "").toString("utf8");

  if (!raw.trim()) {
    return null;
  }

  const result = extractMimeParts(raw);
  const attachment = result.attachments.filter(isStoredAttachment)[attachmentIndex];

  if (!attachment) {
    return null;
  }

  return {
    fileName: attachment.fileName,
    contentType: attachment.contentType,
    size: attachment.size,
    contentId: attachment.contentId,
    contentLocation: attachment.contentLocation,
    disposition: attachment.disposition,
    content: attachment.content
  };
}

export function emailBodyNeedsRepair(body: string | null | undefined, bodyHtml: string | null | undefined) {
  const rawBody = (body || "").trim();
  const rawHtml = (bodyHtml || "").trim();

  if (!rawBody && !rawHtml) {
    return true;
  }

  if (/cid:[^"'\s>)]+/i.test(rawHtml)) {
    return true;
  }

  if (rawHtml) {
    return false;
  }

  const normalized = normalizeEmailText(rawBody);

  return (
    !normalized ||
    /This is a multi-part message in MIME format\./i.test(rawBody) ||
    /Content-Transfer-Encoding:|Content-Type:|Mime-Version:/i.test(rawBody)
  );
}
