import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">株メモ</h1>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginTop: "2rem" }}>
            <Link href="/stocks" className="btn btn-primary" style={{ background: "white", color: "#16a34a" }}>
              銘柄を探す
            </Link>
            <Link href="/dashboard" className="btn btn-outline" style={{ borderColor: "white", color: "white" }}>
              ダッシュボード
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: "4rem 0" }}>
        <div className="container">
          <h2 style={{ textAlign: "center", fontSize: "2rem", fontWeight: "700", marginBottom: "3rem" }}>
            主な機能
          </h2>
          <div className="grid grid-4">
            <div className="card">
              <div className="card-body" style={{ textAlign: "center" }}>
                <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.5rem", color: "var(--color-primary)" }}>
                  ダッシュボード
                </h3>
                <p style={{ color: "var(--foreground-secondary)", fontSize: "0.875rem" }}>
                  統計情報、最近のメモ、タグ使用状況を一目で確認
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body" style={{ textAlign: "center" }}>
                <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.5rem", color: "var(--color-primary)" }}>
                  ウォッチリスト
                </h3>
                <p style={{ color: "var(--foreground-secondary)", fontSize: "0.875rem" }}>
                  気になる銘柄をウォッチして一覧管理
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body" style={{ textAlign: "center" }}>
                <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.5rem", color: "var(--color-primary)" }}>
                  銘柄メモ
                </h3>
                <p style={{ color: "var(--foreground-secondary)", fontSize: "0.875rem" }}>
                  投資アイデアや分析結果を銘柄ごとに記録
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body" style={{ textAlign: "center" }}>
                <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.5rem", color: "var(--color-primary)" }}>
                  タグ管理
                </h3>
                <p style={{ color: "var(--foreground-secondary)", fontSize: "0.875rem" }}>
                  タグでメモを分類して簡単に検索
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: "4rem 0", background: "var(--background-secondary)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: "700", marginBottom: "1rem" }}>
            今すぐ始めよう
          </h2>
          <p style={{ color: "var(--foreground-secondary)", marginBottom: "2rem", maxWidth: "500px", margin: "0 auto 2rem" }}>
            4,000以上の日本株銘柄に対応。すべての機能が無料で使えます。
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/stocks" className="btn btn-primary">
              銘柄を探す
            </Link>
            <Link href="/watchlist" className="btn btn-outline">
              ウォッチリスト
            </Link>
            <Link href="/memos" className="btn btn-outline">
              マイメモ
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
