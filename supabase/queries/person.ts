import { supabase } from "@/supabase/client";

type CreatePersonParams = {
  first_name: string;
  last_name: string;
  generation: number;
  family_id: number;

  date_of_birth?: string | null;
  gender?: string | null;
  profile_picture_path?: string | null;
};

export const createPerson = async ({
  first_name,
  last_name,
  generation,
  date_of_birth = null,
  gender = null,
  family_id,
  profile_picture_path = null,
}: CreatePersonParams) => {
  console.log("Creating person:", {
    first_name,
    last_name,
    generation,
    date_of_birth,
    gender,
    family_id,
  });

  // Create person
  const { data, error } = await supabase
    .from("person")
    .insert([
      {
        first_name,
        last_name,
        date_of_birth,
        gender,
        generation,
        profile_picture_path,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("createPerson error:", error);
    throw error;
  }

  // Link person to family
  const { error: linkError } = await supabase
    .from("family_person")
    .insert([
      {
        person_id: data.id,
        family_id,
      },
    ]);

  if (linkError) {
    console.error("createPerson link error:", linkError);
    throw linkError;
  }

  console.log("Created person:", data);
  return data;
};