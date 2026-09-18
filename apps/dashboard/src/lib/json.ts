import type { Json } from "@db/database.types";
import type { RecordData } from "@/lib/types";

/**
 * Convert a record's `data` map into the shape PostgREST's generated client wants.
 *
 * `RecordData` is `Record<string, unknown>` because a field's value type is only known at runtime,
 * from the kind's `field_schema`. The generated `Json` type is a closed recursive union, and
 * `Record<string, unknown>` is not assignable to it — TypeScript cannot prove an `unknown` is
 * JSON-shaped. Widening `RecordData` to `Json` instead would push that union through every field
 * renderer and buy a narrowing cast at each one.
 *
 * So the conversion happens once, here, at the single database boundary. The assertion is not a
 * blind one: every value in `data` originates in a `FieldInput` for a declared `field_schema`
 * entry, supabase-js JSON-serialises the request body anyway, and `private.validate_record()`
 * rejects any `data` whose keys or value types the kind does not declare. This is the only place
 * in `src/` allowed to assert this.
 */
export function toJson(data: RecordData): Json {
  return data as Json;
}
