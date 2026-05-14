import assert from "node:assert/strict";
import crypto from "node:crypto";
import { afterEach, test } from "node:test";
import { createToken, verifyToken } from "./auth";

const originalAdminSecret = process.env.ADMIN_SECRET;

afterEach(() => {
  if (originalAdminSecret === undefined) {
    delete process.env.ADMIN_SECRET;
  } else {
    process.env.ADMIN_SECRET = originalAdminSecret;
  }
});

test("admin token creation fails closed without ADMIN_SECRET", () => {
  delete process.env.ADMIN_SECRET;

  assert.throws(
    () => createToken("admin-id", "admin@example.com", "super_admin"),
    /ADMIN_SECRET is required/
  );
});

test("admin token verification fails closed without ADMIN_SECRET", () => {
  delete process.env.ADMIN_SECRET;

  assert.equal(verifyToken("payload.signature"), null);
});

test("admin tokens round-trip when ADMIN_SECRET is configured", () => {
  process.env.ADMIN_SECRET = "configured-test-secret";

  const token = createToken("admin-id", "admin@example.com", "super_admin");

  assert.deepEqual(verifyToken(token), {
    userId: "admin-id",
    email: "admin@example.com",
    role: "super_admin",
  });
});

test("legacy fallback-secret tokens are rejected", () => {
  process.env.ADMIN_SECRET = "configured-test-secret";
  const payload = JSON.stringify({
    userId: "admin-id",
    email: "admin@example.com",
    role: "super_admin",
    exp: Date.now() + 60_000,
  });
  const sig = crypto
    .createHmac("sha256", "hart-county-admin-secret-key")
    .update(payload)
    .digest("hex");

  assert.equal(verifyToken(`${Buffer.from(payload).toString("base64")}.${sig}`), null);
});
