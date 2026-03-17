# Todo Java + React

これは、**Spring Boot（Java） + React（TypeScript）** を組み合わせたフルスタック Todo アプリです。  
JWT 認証、CI/CD、Docker、Render／Vercel による本番デプロイを含む学習・実践用プロジェクトです。

---

## 🚀 特長 / ポイント

- フルスタック構成（バックエンドとフロントエンドを分離）  
- 認証は JWT（トークンベース）方式  
- CI/CD に GitHub Actions を使用  
- コンテナ化：Dockerfile を用意  
- デプロイ先：Render（バックエンド + DB）、Vercel（フロントエンド）  
- DBマイグレーション：Flyway  
- モダンフロント技術：React + TypeScript、TanStack Query、React Hook Form、Tailwind CSS  

---

## 🧱 技術スタック

| 層 | 技術 / フレームワーク |
|---|-------------------------|
| バックエンド | Spring Boot, MyBatis, Java |
| 認証 / セキュリティ | JWT |
| データベース | PostgreSQL |
| DB マイグレーション | Flyway |
| フロントエンド | React, TypeScript, TanStack Query, React Hook Form, Tailwind CSS |
| CI / ビルド / デプロイ | GitHub Actions, Dockerfile, Render, Vercel |

---

## 📦 構成と動作イメージ
- フロントは API を呼び出してデータを取得・表示  
- 認証は JWT トークンを `Authorization: Bearer <token>` ヘッダで送信  
- バックエンドはステートレスに設計  
- CI によってビルド → Docker コンテナ化 → Render / Vercel に自動デプロイ  
![システム図](https://github.com/user-attachments/assets/14c6c4e5-f7eb-4e52-9ddd-e9c43aae5d75)

---

## ER図

```mermaid
erDiagram
  USERS ||--o{ TODOS : has

  USERS {
    int id PK
    varchar(100) username "UNIQUE, NOT NULL"
    varchar(255) password "NOT NULL"
    varchar(255) roles "DEFAULT 'USER', NOT NULL"
  }

  TODOS {
    int id PK
    int user_id FK "NOT NULL -> users.id"
    varchar(200) title "NOT NULL"
    text description
    boolean done "DEFAULT false, NOT NULL"
    timestamptz created_at "DEFAULT now(), NOT NULL"
    timestamptz updated_at "DEFAULT now(), NOT NULL"
    smallint priority "DEFAULT 0, NOT NULL"
    date due_date
  }
```
---

## 🛠️ セットアップ / ローカルでの起動方法

1. リポジトリをクローン  
   ```bash
   git clone https://github.com/miyagawa-git/todo-java-react.git
   cd todo-java-react
   ```
２．バックエンドの環境設定
todo-backend/src/main/resources/application.yml などで DB 接続情報を設定
PostgreSQL を起動
Flyway マイグレーションを自動的に適用

３．フロントエンド設定
todo-frontend/.env（もしくは .env.local） に API ベース URL をセット
例: VITE_API_BASE=http://localhost:8080

４．両方を起動
バックエンド：./gradlew bootRun（または mvn spring-boot:run）
フロントエンド：npm install → npm run dev

ブラウザで http://localhost:5173（または指定ポート）にアクセスして動作確認

📚 実装のポイント（抜粋）

JWT 認証のフィルタ設計・例外処理

SecurityConfig における CORS 設定・セッションポリシー

フロントの API 通信で Authorization ヘッダ付与

TanStack Query：データ取得・キャッシュ管理

React Hook Form：ログイン / 入力フォームのバリデーション

Route 保護（RequireAuth コンポーネント）

CI/CD：GitHub Actions によるビルド → デプロイ

Dockerfile によるイメージ作成

Render / Vercel による本番デプロイ設計

---

🌐 公開（デモ / 本番）リンクとソースコード

デモ URL：https://todo-java-react.vercel.app

🚧 注意点 / 制限事項

このプロジェクトは学習目的であり、本番向けのセキュリティ対策（例えば XSS / CSRF / トークン失効など）は完全ではありません
環境変数の安全管理が必要
無料枠利用環境ではコールドスタートや遅延が発生する可能性あり

〜〜〜〜〜〜〜〜

import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import { once } from "events";

type CsvValidationOptions = {
  hasHeader?: boolean;
  encoding?: BufferEncoding;
};

type ProcessResult = {
  totalCount: number;
  errorCount: number;
  duplicateCount: number;
  errorCsvPath: string;
};

type ValidationContext = {
  seenValues: Set<string>;
};

/**
 * write stream へ1行安全に書き込む
 *
 * writer.write() が false を返した場合は、
 * バッファが詰まり気味なので "drain" を待つ。
 * 大量データでの書き込み時に重要。
 */
async function writeLineSafely(
  writer: fs.WriteStream,
  line: string
): Promise<void> {
  if (!writer.write(line)) {
    await once(writer, "drain");
  }
}

/**
 * エラーCSV出力用のエスケープ
 *
 * 値にカンマ・改行・ダブルクォートが含まれると
 * CSVの列崩れを起こすので、その場合だけクオートで囲む。
 */
function escapeCsv(value: string): string {
  if (
    value.includes('"') ||
    value.includes(",") ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * 1列CSV前提の値正規化
 *
 * 今回は「読み込みCSVにクオートなし」前提なので、
 * 余計なCSV解析はせず trim のみ行う。
 */
function normalizeSingleColumnValue(raw: string): string {
  return raw.trim();
}

/**
 * 形式チェック + 重複チェック
 *
 * 例:
 * - 必須
 * - 半角数字のみ
 * - 8桁固定
 * - 重複禁止
 *
 * 今回は「形式エラーがあっても重複チェックする」実装。
 * もし「形式エラー時は重複チェックしない」なら
 * errors.length === 0 のときだけ重複判定する。
 */
function validateValue(
  value: string,
  context: ValidationContext
): string[] {
  const errors: string[] = [];

  // 必須チェック
  if (value.length === 0) {
    errors.push("値が空です");
    return errors;
  }

  // 半角数字チェック
  if (!/^\d+$/.test(value)) {
    errors.push("半角数字のみ入力してください");
  }

  // 桁数チェック
  if (value.length !== 8) {
    errors.push("8桁で入力してください");
  }

  // 重複チェック
  if (context.seenValues.has(value)) {
    errors.push("値が重複しています");
  } else {
    context.seenValues.add(value);
  }

  return errors;
}

/**
 * 1列CSVをストリームで読み込み、
 * その場でチェックしてエラーCSVを生成する
 *
 * ポイント:
 * - 全件を配列やMapにためない
 * - 1行ずつ読む
 * - 1行ずつ判定する
 * - エラーがあればその場でCSV出力する
 *
 * そのため10万件規模でも比較的軽い。
 */
export async function validateSingleColumnCsvFast(
  inputCsvPath: string,
  errorCsvPath: string,
  options: CsvValidationOptions = {}
): Promise<ProcessResult> {
  const { hasHeader = false, encoding = "utf8" } = options;

  // 入力CSV読み込み用ストリーム
  const reader = fs.createReadStream(inputCsvPath, { encoding });

  // 1行ずつ読むためのインターフェース
  const rl = readline.createInterface({
    input: reader,
    crlfDelay: Infinity,
  });

  // エラーCSV書き込み用ストリーム
  const writer = fs.createWriteStream(errorCsvPath, { encoding: "utf8" });

  let physicalLineNumber = 0; // 実ファイル上の行番号
  let dataRowNumber = 0;      // データ行番号（ヘッダ除外後）
  let errorCount = 0;         // エラー件数
  let duplicateCount = 0;     // 重複エラー件数

  // 重複チェック用
  const context: ValidationContext = {
    seenValues: new Set<string>(),
  };

  try {
    // エラーCSVのヘッダ行
    await writeLineSafely(writer, "rowNumber,errorMessage,value\n");

    // 入力CSVを1行ずつ処理
    for await (const rawLine of rl) {
      physicalLineNumber++;

      // ヘッダありの場合、1行目はスキップ
      if (hasHeader && physicalLineNumber === 1) {
        continue;
      }

      dataRowNumber++;

      // UTF-8 BOM対策
      // 先頭行だけ BOM が付く可能性があるため除去
      const line =
        physicalLineNumber === 1 ? rawLine.replace(/^\uFEFF/, "") : rawLine;

      // 値の整形
      const value = normalizeSingleColumnValue(line);

      // バリデーション
      const errors = validateValue(value, context);

      // エラーなしなら次へ
      if (errors.length === 0) {
        continue;
      }

      // 重複エラー件数をカウント
      if (errors.includes("値が重複しています")) {
        duplicateCount++;
      }

      errorCount++;

      // エラーCSVの1行を作る
      const outputLine =
        [
          dataRowNumber,
          escapeCsv(errors.join(" / ")),
          escapeCsv(value),
        ].join(",") + "\n";

      // エラーCSVへ書き込み
      await writeLineSafely(writer, outputLine);
    }
  } finally {
    // 書き込み終了
    writer.end();
    await once(writer, "finish");
  }

  return {
    totalCount: dataRowNumber,
    errorCount,
    duplicateCount,
    errorCsvPath,
  };
}

/**
 * 実行例
 */
async function main(): Promise<void> {
  const inputCsvPath = path.resolve("./input.csv");
  const outputDir = path.resolve("./output");
  const errorCsvPath = path.join(outputDir, "error_records.csv");

  // 出力先フォルダがなければ作る
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const result = await validateSingleColumnCsvFast(
    inputCsvPath,
    errorCsvPath,
    {
      hasHeader: false,
      encoding: "utf8",
    }
  );

  console.log("処理結果:", result);
}

if (require.main === module) {
  main().catch((error) => {
    console.error("処理中にエラーが発生しました:", error);
    process.exit(1);
  });
}
