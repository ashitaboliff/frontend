# 型・スキーマ再エクスポート移行 TODO

## 計画
- [x] ドメインごとの `model/types.ts` / `model/schema.ts` を整備（新規・更新）
- [x] 既存の `@ashitaboliff/types` 直接 import を全置換
- [x] ローカル型・スキーマの再エクスポート経路を統一
- [x] 型チェック・フォーマットを実行して問題がないか確認

## 作業ログ
- [x] 下準備（現状調査・方針決定）
- [x] 実装（ファイル作成・更新）
- [x] 置換（import の差し替え）
- [x] 検証（npm run ts / npm run check:fix）
