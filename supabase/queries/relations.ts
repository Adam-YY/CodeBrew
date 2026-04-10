import { supabase } from '@/supabase/client';

export const getFamilyMembers = async (familyId) => {
  const { data, error } = await supabase
    .from('family_person')
    .select(`
      person:person_id (
        id,
        first_name,
        last_name,
        created_at
      )
    `)
    .eq('family_id', familyId)
    .order('created_at', { foreignTable: 'person', ascending: true });

  if (error) throw error;

  // remove created_at before returning
  return data.map(row => {
    const { created_at, ...person } = row.person;
    return person;
  });
};