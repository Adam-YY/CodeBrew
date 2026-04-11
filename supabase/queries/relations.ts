import { supabase } from "@/supabase/client";

type Person = {
  id: number;
  first_name: string;
  last_name: string;
  created_at: string;
  date_of_birth: string | null;
  gender: string | null;
  generation: number;
  profile_picture_path: string | null;
};

type FamilyPersonRow = {
  person: Person | Person[];
};

export const getFamilyMembers = async (
  familyId: number
): Promise<Person[]> => {
  console.log("Fetching family members for family ID:", familyId);

  const { data, error } = await supabase
    .from("family_person")
    .select(`
      person:person_id (
        id,
        first_name,
        last_name,
        created_at,
        date_of_birth,
        gender,
        generation,
        profile_picture_path
      )
    `)
    .eq("family_id", familyId)
    .order("created_at", {
      foreignTable: "person",
      ascending: true,
    });

  if (error) throw error;

  if (!data) return [];

  return (data as FamilyPersonRow[]).map((row) => {
    const p = Array.isArray(row.person)
      ? row.person[0]
      : row.person;

    return {
      id: p.id,
      first_name: p.first_name,
      last_name: p.last_name,
      created_at: p.created_at,
      date_of_birth: p.date_of_birth,
      gender: p.gender,
      generation: p.generation,
      profile_picture_path: p.profile_picture_path,
    };
  });
};