import assert from "node:assert/strict";
import { test } from "node:test";
import { loginAllowed } from "@/auth";

test("loginAllowed scopes admin/user surfaces correctly", () => {
  assert.equal(loginAllowed("admin", "user"), false);
  assert.equal(loginAllowed("user", "admin"), false);
  assert.equal(loginAllowed("admin", "admin"), true);
  assert.equal(loginAllowed("user", "user"), true);
});
