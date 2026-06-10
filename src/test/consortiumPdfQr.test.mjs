import test from "node:test";
import assert from "node:assert/strict";
import {
  buildPdfQrImageDataUrl,
  getConsortiumDocumentUrl,
  getQrSectionHeight,
  getQrSectionSummary,
} from "../consortiumPdfQr.js";

test("returns blank url when consortium has no configured documentation link", () => {
  assert.equal(getConsortiumDocumentUrl(undefined), "");
  assert.equal(getConsortiumDocumentUrl({ documentUrl: "   " }), "");
  assert.equal(getQrSectionHeight(""), 0);
  assert.equal(getQrSectionSummary(""), null);
});

test("builds a compact qr section summary from the same consortium document url used by preview", () => {
  const documentUrl = "https://drive.google.com/consorcio-torre-norte";

  assert.equal(
    getConsortiumDocumentUrl({ documentUrl: ` ${documentUrl} ` }),
    documentUrl,
  );

  const summary = getQrSectionSummary(documentUrl);
  assert.ok(summary);
  assert.equal(summary.documentUrl, documentUrl);
  assert.equal(summary.height, 35);
  assert.equal(summary.bullets.length, 5);
  assert.match(summary.description, /QR/i);
});

test("builds a png data url for the compact pdf qr image", async () => {
  const documentUrl = "https://drive.google.com/consorcio-torre-norte";

  const dataUrl = await buildPdfQrImageDataUrl(documentUrl);
  assert.match(dataUrl, /^data:image\/png;base64,/);

  const blankQr = await buildPdfQrImageDataUrl("");
  assert.equal(blankQr, null);
});
