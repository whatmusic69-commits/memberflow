import { readFile } from "node:fs/promises";
import { Buffer } from "node:buffer";
import path from "node:path";
import { deflateSync } from "node:zlib";
import { PKPass } from "passkit-generator";
import { customers } from "@/data/mock-data";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const decodedToken = decodeURIComponent(token);
    const customerRecords = customers.filter((customer) => customer.token === decodedToken);
    const customer = customerRecords[0] ?? customers.find((item) => item.token === "mfp_c_8f3k29x7") ?? customers[0];
    const memberships = customers.filter((item) => item.token === customer.token);
    const activePrograms = memberships.flatMap((membership) => [membership.subscriptionProgramId, membership.loyaltyProgramId].filter(Boolean));
    const passBuffer = await createMemberFlowPass({
      token: customer.token,
      customerName: customer.name,
      customerNumber: customer.customerNumber ?? "MF-000184",
      activeProgramCount: activePrograms.length || 1,
    });

    const body = new ArrayBuffer(passBuffer.byteLength);
    new Uint8Array(body).set(passBuffer);
    return new Response(body, {
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": `attachment; filename="memberflow-${customer.customerNumber ?? "pass"}.pkpass"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Wallet error";
    return Response.json({ error: message }, { status: 500 });
  }
}

async function createMemberFlowPass({ token, customerName, customerNumber, activeProgramCount }: { token: string; customerName: string; customerNumber: string; activeProgramCount: number }) {
  const certificates = await readWalletCertificates();
  const passTypeIdentifier = requiredEnv("APPLE_PASS_TYPE_ID");
  const teamIdentifier = requiredEnv("APPLE_TEAM_ID");
  const passJson = {
    formatVersion: 1,
    passTypeIdentifier,
    teamIdentifier,
    serialNumber: customerNumber,
    organizationName: "MemberFlow",
    description: "MemberFlow customer pass",
    logoText: "MemberFlow",
    foregroundColor: "rgb(255,255,255)",
    backgroundColor: "rgb(18,19,32)",
    labelColor: "rgb(190,185,255)",
    sharingProhibited: false,
    storeCard: {
      primaryFields: [{ key: "client", label: "CLIENT", value: customerName }],
      secondaryFields: [{ key: "programs", label: "ACTIVE PROGRAMS", value: `${activeProgramCount}` }],
      auxiliaryFields: [{ key: "number", label: "CUSTOMER", value: customerNumber }],
      backFields: [
        { key: "cards", label: "My cards", value: "Open your connected programs at /customer/cards" },
        { key: "privacy", label: "QR security", value: "The QR code contains only a secure MemberFlow customer token." },
      ],
    },
  };

  const pass = new PKPass(
    {
      "pass.json": Buffer.from(JSON.stringify(passJson)),
      "icon.png": createMemberFlowPng(29),
      "icon@2x.png": createMemberFlowPng(58),
      "logo.png": createMemberFlowPng(96),
      "logo@2x.png": createMemberFlowPng(192),
    },
    certificates,
  );

  pass.setBarcodes({
    format: "PKBarcodeFormatQR",
    message: `memberflow:customer:${token}`,
    messageEncoding: "iso-8859-1",
    altText: customerNumber,
  });

  return pass.getAsBuffer();
}

async function readWalletCertificates() {
  const [wwdr, signerCert, signerKey] = await Promise.all([
    readConfiguredCertificate("APPLE_WWDR_CERT"),
    readConfiguredCertificate("APPLE_PASS_CERT"),
    readConfiguredCertificate("APPLE_PASS_KEY"),
  ]);
  return {
    wwdr,
    signerCert,
    signerKey,
    signerKeyPassphrase: process.env.APPLE_PASS_P12_PASSWORD,
  };
}

async function readConfiguredCertificate(envPrefix: string) {
  const base64 = process.env[`${envPrefix}_BASE64`];
  if (base64) return Buffer.from(base64.replaceAll("\\n", "").trim(), "base64");
  return readConfiguredFile(`${envPrefix}_PATH`);
}

async function readConfiguredFile(envName: string) {
  const configuredPath = requiredEnv(envName);
  const fileName = path.basename(configuredPath);
  return readFile(path.join(process.cwd(), "secrets", "apple-wallet", fileName));
}

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function createMemberFlowPng(size: number) {
  const scale = size / 1024;
  return encodePng(size, size, (x, y) => {
    const sourceX = x / scale;
    const sourceY = y / scale;
    if (!inRoundedRect(sourceX, sourceY, 64, 64, 896, 896, 166)) return [0, 0, 0, 0];
    const t = (sourceX + sourceY) / 2048;
    const violet = mix([81, 66, 255], [202, 48, 222], t);
    const whiteShape =
      inRoundedRect(sourceX, sourceY, 236, 300, 356, 318, 84) ||
      inRoundedRect(sourceX, sourceY, 432, 410, 356, 318, 84) ||
      inRoundedRect(sourceX, sourceY, 424, 382, 156, 96, 48) ||
      inRoundedRect(sourceX, sourceY, 444, 550, 156, 96, 48);
    if (whiteShape) return [255, 255, 255, 255];
    return [violet[0], violet[1], violet[2], 255];
  });
}

function mix(from: number[], to: number[], t: number) {
  return from.map((value, index) => Math.round(value + (to[index] - value) * Math.max(0, Math.min(1, t))));
}

function inRoundedRect(x: number, y: number, rectX: number, rectY: number, width: number, height: number, radius: number) {
  const innerX = Math.max(rectX + radius, Math.min(x, rectX + width - radius));
  const innerY = Math.max(rectY + radius, Math.min(y, rectY + height - radius));
  return (x - innerX) ** 2 + (y - innerY) ** 2 <= radius ** 2;
}

function encodePng(width: number, height: number, pixel: (x: number, y: number) => number[]) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0;
    for (let x = 0; x < width; x += 1) {
      const [red, green, blue, alpha] = pixel(x, y);
      const index = rowStart + 1 + x * 4;
      raw[index] = red;
      raw[index + 1] = green;
      raw[index + 2] = blue;
      raw[index + 3] = alpha;
    }
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", Buffer.concat([uint32(width), uint32(height), Buffer.from([8, 6, 0, 0, 0])])),
    pngChunk("IDAT", deflateSync(raw)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function pngChunk(type: string, data: Buffer) {
  const typeBuffer = Buffer.from(type);
  return Buffer.concat([uint32(data.length), typeBuffer, data, uint32(crc32(Buffer.concat([typeBuffer, data])))]); 
}

function uint32(value: number) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32BE(value >>> 0);
  return buffer;
}

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let crc = index;
  for (let bit = 0; bit < 8; bit += 1) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  return crc >>> 0;
});

function crc32(buffer: Buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
