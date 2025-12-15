import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">Stock Memo</h1>
          <p className="hero-description">
            あなたの株式投資アイデアを記録・整理するためのメモアプリケーション。
            銘柄ごとにメモを管理し、投資判断をサポートします。
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <Link href="/stocks" className="btn btn-primary" style={{ background: "white", color: "#3b82f6" }}>
              銘柄を探す
            </Link>
            <Link href="/memos" className="btn btn-outline" style={{ borderColor: "white", color: "white" }}>
              マイメモ
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
          <div className="grid grid-3">
            <div className="card">
              <div className="card-body" style={{ textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📝</div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                  銘柄メモ
                </h3>
                <p style={{ color: "var(--foreground-secondary)" }}>
                  銘柄ごとにメモを作成・管理。投資アイデアや分析結果を記録できます。
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body" style={{ textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏷️</div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                  タグ管理
                </h3>
                <p style={{ color: "var(--foreground-secondary)" }}>
                  タグを使ってメモを整理。テーマや投資スタイルで分類できます。
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body" style={{ textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                  プライバシー
                </h3>
                <p style={{ color: "var(--foreground-secondary)" }}>
                  メモは非公開がデフォルト。公開設定で他のユーザーと共有も可能。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: "4rem 0", background: "var(--background-secondary)" }}>
        <div className="container">
          <div className="grid grid-3" style={{ textAlign: "center" }}>
            <div>
              <div style={{ fontSize: "2.5rem", fontWeight: "800", color: "var(--color-primary)" }}>
                4,000+
              </div>
              <div style={{ color: "var(--foreground-secondary)" }}>登録銘柄数</div>
            </div>
            <div>
              <div style={{ fontSize: "2.5rem", fontWeight: "800", color: "var(--color-secondary)" }}>
                無料
              </div>
              <div style={{ color: "var(--foreground-secondary)" }}>すべての機能</div>
            </div>
            <div>
              <div style={{ fontSize: "2.5rem", fontWeight: "800", color: "var(--color-accent)" }}>
                安全
              </div>
              <div style={{ color: "var(--foreground-secondary)" }}>データ保護</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

