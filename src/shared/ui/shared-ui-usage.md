# shared/ui コンポーネント 利用ガイド

本ドキュメントは shared/ui 配下（atoms / molecules / organisms / layout / icons / ads）のコンポーネントをプロダクトで再利用する際のクイックリファレンスです。[Zenn 記事](https://zenn.dev/uzu_tech/articles/common-component-anti-pattern)で指摘されていた「共通コンポーネントのアンチパターン」を避けるための方針も併記しています。

## 共通原則
- **ネイティブ属性を潰さない**: Props は可能な限り HTML 標準属性を継承し、余計なラップ型を作らない。独自型が必要な場合でも `...rest` で透過させる。
- **責務は最小限**: レイアウト（余白・枠線・背景）は呼び出し側で決める。コンポーネント内では必要最小限のスタイルとアクセシビリティ設定のみ。
- **型安全**: `interface` ではなく `type` を使用し、`any` や不必要な型アサーションを避ける。
- **アクセシビリティ**: `aria-*`, `role`, `aria-live`, `aria-describedby` を意識する。キーボード操作（Enter/Space/Arrow）をサポートする。
- **制御/非制御の両立**: フォーム系は `value/onChange` と `defaultValue`/内部ステートを両立し、`react-hook-form` の `register` と併用できるようにする。
- **Atomic Design の役割**  
  - atoms: 単一要素の UI（input, button, icon 等）。ビジネスロジックなし。  
  - molecules: atoms を組み合わせた小規模 UI（フォームフィールド、メッセージなど）。  
  - organisms: ページ構造を形作る大きめのコンテナ・レイアウト。  
  - 配置が曖昧な場合は「依存するドメインデータの有無」と「複数画面での再利用度」で判断。

## atoms
- **TextInputField / TextareaInputField**  
  - ネイティブ属性透過。`register` と `onChange` を合成。`wrapperClassName` で外側を調整。`errorMessage` を渡すと `aria-describedby` を自動付与。
- **SelectField**  
  - `options: Record<label, value>` または `placeholderOptionLabel` で初期表示。`onChange` は name/value を含む SyntheticEvent を返す。`register` と併用可。
- **PasswordInputField**（実体は molecules だがフォーム用最小セットとして扱いやすい）  
  - `showPassword`, `onToggleVisibility`, `onPressMouseDown` を渡す。`register` も併用可。
- **Message**  
  - `variant: info | success | warning | error`。`role` は variant に応じ自動設定。`aria-live` も自動。
- **Pagination**  
  - `currentPage`, `totalPages`, `onPageChange`。`maxMiddleItems` で中央の件数を調整。`aria-current` 付き。
- **Tabs / Tab**  
  - 制御/非制御両対応。Arrow/Home/End で移動。`value` と `onChange` を渡すと制御モード。
- **ShareButton**  
  - Web Share API のみ。`label` で表示文言を指定。
- **LineButton**  
  - LINE公式デザイン準拠の汎用ボタン。デフォルトで LINE アイコン付き（`showIcon={false}` で非表示）。hover/active は黒オーバーレイ、disabled は白背景＋薄灰ボーダー。
- **Image / Img**  
  - `fallback` を指定するとエラー時に差し替えを行う画像コンポーネント。next/image 版と img 版。
- **Carousel**  
  - `slides: {id, node}[]`。スワイプ・hover 一時停止・prev/next。
- **DatePicker / DatePickerCustomHeader**  
  - react-datepicker ラッパ。`renderCustomHeader` を内包し ja ロケール登録済み。`errorMessage` で Validation 表示可。
- **HomePageBar**  
  - 飾り用 SVG。`aria-hidden` 済み。背景色変更はラップ側で。
- **Loading / LoadingOverlay**  
  - 簡易ローディング表示。`role="status"` 付き。
- **RadioSortGroup**  
  - ソート切り替え用ラジオボタン集合。`options`/`currentSort`/`onSortChange`。
- **LinkWithArrow**  
  - next/link をラップ。`iconClassName` でアイコン調整。

## molecules
- **Popup**  
  - `<dialog>` ラッパ。`open/onClose` 必須。`maxWidth` は Tailwind トークン or 任意長さ。フォーカスを閉じ元に戻す。バックドロップは form method="dialog" で閉じる。
- **Modal**  
  - Popup を内部利用。`open/onOpenChange` で外部制御も可。`defaultOpen` で初期表示。
- **ShareToLineButton**  
  - LINE 共有専用ボタン。`url` と `text` を渡す。内部で `LineButton` を利用。
- **TextSearchField**  
  - TextInput + 検索アイコン。input 属性透過、`register` 併用可。
- **FlashMessage**  
  - 一時的に画面上部へ表示。`duration`/`onClose`/`closeable`。Message コンポーネントを内包。
- **FeedbackMessage**  
  - `source` に FeedbackMessageType/ApiError/string/ReactNode を受け取り、Message にマッピング。`showDetails` で ApiError.details の表示制御。
- **GenericTableBody / GenericTableSkeleton**  
  - ヘッダー/行レンダリングのテンプレート。エラー/空データ時の表示込み。行クリックはキーボード操作対応。
- **CalendarFrame**  
  - 日付×時間のグリッドを描画する枠。セル描画ロジックは `renderCell` で注入。
- **TagsInputField**  
  - タグ追加/削除（Enter/Comma/Blur）。`control` あり/なし両対応。重複除外・trim 済み。
- **MultiSelectField**  
  - チェックボックス式マルチセレクト。`options: {label,value}[]`。dropdown 開閉と onBlur を同期。

## organisms
- **PaginatedResourceLayout / Skeleton**  
  - 件数切替 + ソート + ページネーションの骨格。子にテーブル等を配置する想定。
- **PaginatedTableSkeleton / PaginatedErrorView**  
  - ページネーション UI のスケルトン/エラー表示付き。
- **HomePageHeader**  
  - トップページ用ヒーロー。背景バー + タイトル。`className` で余白調整。
- **AddToCalendarModal**  
  - 予定情報から Google/Yahoo/Apple 追加リンクを生成するモーダル。

## 新規コンポーネントを追加する際のガイド
1. **階層を決める**:  
   - ドメイン非依存で単一要素 → atoms  
   - 入力補助や複合フィールド → molecules  
   - レイアウト枠・複数セクション → organisms
2. **props 設計**:  
   - ネイティブ要素を包む場合は該当の `*HTMLAttributes` を継承し、不要なものだけ `Omit`。  
   - `className` と `wrapperClassName` を分け、余白は外側で制御。  
   - 非制御/制御どちらも許容するなら `value/defaultValue` 両対応にする。
3. **アクセシビリティ**:  
   - ラベルと入力を `id/htmlFor` で結ぶ。エラーは `aria-describedby`。  
   - インタラクティブ要素には `aria-label` or visible label、キーボード操作を検討。  
   - `role`/`aria-live` を適切に設定。
4. **エラーハンドリング**:  
   - フォールバック（画像、Web Share）を用意し、失敗時のユーザ通知を入れる。
5. **型とテスト**:  
   - `type` で Props 定義。`any`/`as unknown as` 禁止。  
   - 追加後は `pnpm --filter frontend ts` を必ず実行。必要なら Biome の `check:fix` も。
6. **スタイル**:  
   - DaisyUI/Tailwind のユーティリティのみで完結させ、レイアウト固定値は極力避ける。  
   - 余白・背景・枠線は「最低限」。呼び出し側が上書きしやすい構成にする。

## 既知の依存ユーティリティ
- `shared/ui/utils/classNames` — falsy を除外して className を結合。
- `shared/ui/utils/refs` — 複数 ref を合成。
- `shared/hooks/useSelectField` — select/multi-select 用の dropdown 制御・SyntheticEvent 生成。
- `shared/hooks/useCarousel` — スワイプ対応カルーセルの状態管理。

## 最低限のチェックリスト
- [ ] Props がネイティブ属性を阻害していないか
- [ ] アクセシビリティ（aria/role/keyboard）が付いているか
- [ ] エラー/空状態の UI を返すか（null にしないか）
- [ ] className を安全にマージしているか
- [ ] 型チェック (`pnpm --filter frontend ts`) を通したか
