import { redirect } from "next/navigation";

// Kept as a redirect: the auth redirect allow-list and existing links point here.
export default function EntriesRedirect() {
  redirect("/records/ctf");
}
