import { supabase } from "@/supabase/client";
import { Letter } from "./insertLetter";

const getTodayDate = () => {
  return new Date().toISOString().slice(0, 10); // yyyy-mm-dd
};

export const getLetters = async (person_id: string) => {
  // 1. Find which family this person belongs to
  const { data: familyPersonRow, error: familyError } = await supabase
    .from("family_person")
    .select("family_id")
    .eq("person_id", person_id)
    .single();

  if (familyError || !familyPersonRow) {
    throw new Error("Could not resolve family for person: " + (familyError?.message ?? "not found"));
  }

  const familyId = familyPersonRow.family_id;

  // 2. Get all person IDs in that family
  const { data: familyPersons, error: membersError } = await supabase
    .from("family_person")
    .select("person_id")
    .eq("family_id", familyId);

  if (membersError) throw new Error(membersError.message);

  const familyPersonIds = (familyPersons ?? []).map((fp) => fp.person_id);

  if (familyPersonIds.length === 0) return [];

  // 3. Fetch letters where the sender is in this family, and:
  //    - the current person is the sender, OR
  //    - the current person is the recipient, OR
  //    - it's a broadcast (recipient_id is null)
  const { data, error } = await supabase
    .from("letter")
    .select("*")
    .in("sender_id", familyPersonIds)   // scopes to this family
    .or(
      [
        `sender_id.eq.${person_id}`,    // they sent it
        `recipient_id.eq.${person_id}`, // addressed to them
        `recipient_id.is.null`,         // broadcast to the family
      ].join(",")
    )
    .order("created_date", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
};