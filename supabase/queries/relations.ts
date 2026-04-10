import { supabase } from '@/supabase/client';

export const getFamilyMembers = async (familyId) => {
  console.log('Fetching family members for family ID:', familyId);

  const { data, error } = await supabase
    .from('family_person')
    .select(`
      person:person_id (
        id,
        first_name,
        last_name,
        created_at,
        date_of_birth,
        gender
      )
    `)
    .eq('family_id', familyId)
    .order('created_at', { foreignTable: 'person', ascending: true });

  if (error) throw error;

  return data.map(row => {
    const p = row.person;

    return {
      id: p.id,
      first_name: p.first_name,
      last_name: p.last_name,
      created_at: p.created_at,
      date_of_birth: p.date_of_birth,
      gender: p.gender,
    };
  });
};