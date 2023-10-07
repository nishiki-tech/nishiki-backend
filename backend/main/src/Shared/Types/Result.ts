/**
 * This is result result type.
 * {@link https://qiita.com/frosted_bird/items/176c7371b1f98a0fea85}
 */
export type Result<T = void, E = void> =
  | { ok: true; value: T }
  | { ok: false; error: E }

export const Ok = <T, E>(value: T): Result<T, E> => ({
  ok: true,
  value,
})

export const Err = <T, E>(error: E): Result<T, E> => ({ ok: false, error })
