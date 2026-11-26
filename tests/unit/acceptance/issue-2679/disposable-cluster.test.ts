import { describe, expect, it, vi } from "vitest";

const LOOPBACK =
  "postgresql://postgres:postgres@127.0.0.1:5432/asymmetrical_test";

const load = () => import("./disposable-cluster");

function client() {
  const sent: string[] = [];
  return {
    sent,
    query: vi.fn(async (text: string) => {
      sent.push(text);
      return { rows: [] };
    }),
    escapeLiteral: (value: string) => `'${value.replaceAll("'", "''")}'`,
  };
}

describe("AL-2679 WP6 rest: a real-stack suite changes a role's password only on a database it may destroy (D-34)", () => {
  it.each([
    "postgresql://postgres:pw@db.example.org:5432/postgres",
    "postgresql://postgres:pw@10.1.2.3:5432/postgres",
    "not a database address",
  ])(
    "refuses %s, before it reads the mark or sends ALTER ROLE",
    async (adminUrl) => {
      const { setDisposableRolePassword } = await load();
      const sql = client();
      const requireDisposable = vi.fn();
      await expect(
        setDisposableRolePassword({
          adminUrl,
          client: sql,
          role: "cms_runtime",
          password: "a".repeat(48),
          requireDisposable,
        }),
      ).rejects.toThrow(/loopback/);
      expect(requireDisposable).not.toHaveBeenCalled();
      expect(sql.sent).toEqual([]);
    },
  );

  it("refuses a loopback database without the disposable mark, and sends no ALTER ROLE", async () => {
    const { setDisposableRolePassword } = await load();
    const sql = client();
    const requireDisposable = vi.fn(() => {
      throw new Error("refusing to change a role of: no environment marker");
    });
    await expect(
      setDisposableRolePassword({
        adminUrl: LOOPBACK,
        client: sql,
        role: "cms_runtime",
        password: "a".repeat(48),
        requireDisposable,
      }),
    ).rejects.toThrow(/no environment marker/);
    expect(requireDisposable).toHaveBeenCalledWith(
      expect.objectContaining({ databaseUrl: LOOPBACK }),
    );
    expect(sql.sent).toEqual([]);
  });

  it("sets, then clears, the password on a loopback database marked disposable", async () => {
    const { setDisposableRolePassword } = await load();
    const sql = client();
    const requireDisposable = vi.fn(() => ({ ok: true, kind: "disposable" }));
    for (const password of ["a".repeat(48), null]) {
      await setDisposableRolePassword({
        adminUrl: LOOPBACK,
        client: sql,
        role: "cms_runtime",
        password,
        requireDisposable,
      });
    }
    expect(sql.sent).toEqual([
      `ALTER ROLE cms_runtime PASSWORD '${"a".repeat(48)}'`,
      "ALTER ROLE cms_runtime PASSWORD NULL",
    ]);
    expect(requireDisposable).toHaveBeenCalledTimes(2);
  });

  it("refuses a role name that is not a plain identifier", async () => {
    const { setDisposableRolePassword } = await load();
    const sql = client();
    await expect(
      setDisposableRolePassword({
        adminUrl: LOOPBACK,
        client: sql,
        role: "cms_runtime; DROP ROLE postgres",
        password: null,
        requireDisposable: vi.fn(() => ({ ok: true, kind: "disposable" })),
      }),
    ).rejects.toThrow(/plain role name/);
    expect(sql.sent).toEqual([]);
  });
});
