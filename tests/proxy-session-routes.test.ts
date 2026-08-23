import { describe, expect, it } from "vitest";
import { isPlatformOnlyPath, shouldRefreshAuthSession } from "../lib/proxy/session-routes";

describe("proxy session route helpers", () => {
  it("obnoví reláciu len na chránených cestách", () => {
    expect(shouldRefreshAuthSession("/app")).toBe(true);
    expect(shouldRefreshAuthSession("/app/web/demo")).toBe(true);
    expect(shouldRefreshAuthSession("/admin/spatna-vazba")).toBe(true);
    expect(shouldRefreshAuthSession("/api/health")).toBe(true);
  });

  it("neobnoví reláciu na verejných auth a marketing stránkach", () => {
    expect(shouldRefreshAuthSession("/")).toBe(false);
    expect(shouldRefreshAuthSession("/prihlasenie")).toBe(false);
    expect(shouldRefreshAuthSession("/registracia")).toBe(false);
    expect(shouldRefreshAuthSession("/obnova-hesla")).toBe(false);
    expect(shouldRefreshAuthSession("/auth/callback")).toBe(false);
    expect(shouldRefreshAuthSession("/sablony")).toBe(false);
  });

  it("presmeruje platform-only cesty z custom domény", () => {
    expect(isPlatformOnlyPath("/prihlasenie")).toBe(true);
    expect(isPlatformOnlyPath("/martin-novak")).toBe(false);
  });
});
