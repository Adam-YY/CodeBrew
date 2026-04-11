import { supabase } from "@/supabase/client";

import { Letter } from "./insertLetter";

const getTodayDate = () => {
  return new Date().toISOString().slice(0, 10); // yyyy-mm-dd
};

export const getLetters = async (person_id: string) => {
  const { data, error } = await supabase
    .from("letter")
    .select("*")
    .or(
      [
        // sender sees everything they sent
        `sender_id.eq.${person_id}`,

        // recipient sees their messages
        `recipient_id.eq.${person_id}`,

        // broadcast messages (everyone can see)
        `recipient_id.is.null`,
      ].join(",")
    )
    .order("created_date", { ascending: false });

  if (error) throw new Error(error.message);

  return data ?? [];
};