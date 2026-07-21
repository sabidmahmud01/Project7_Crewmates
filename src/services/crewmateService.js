import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

const TABLE_NAME = 'crewmates';
const STORAGE_KEY = 'crewforge-crewmates';

const sortNewestFirst = (crewmates) =>
  [...crewmates].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

const readLocalCrewmates = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
};

const writeLocalCrewmates = (crewmates) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sortNewestFirst(crewmates)));
};

const getLocalId = () => {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const getCrewmates = async () => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  return sortNewestFirst(readLocalCrewmates());
};

export const getCrewmate = async (id) => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  return readLocalCrewmates().find((crewmate) => String(crewmate.id) === String(id));
};

export const createCrewmate = async (crewmate) => {
  const payload = {
    ...crewmate,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const nextCrewmate = { ...payload, id: getLocalId() };
  writeLocalCrewmates([nextCrewmate, ...readLocalCrewmates()]);
  return nextCrewmate;
};

export const updateCrewmate = async (id, updates) => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const crewmates = readLocalCrewmates();
  const updatedCrewmates = crewmates.map((crewmate) =>
    String(crewmate.id) === String(id) ? { ...crewmate, ...updates } : crewmate,
  );
  writeLocalCrewmates(updatedCrewmates);
  return updatedCrewmates.find((crewmate) => String(crewmate.id) === String(id));
};

export const deleteCrewmate = async (id) => {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);
    if (error) throw error;
    return;
  }

  writeLocalCrewmates(
    readLocalCrewmates().filter((crewmate) => String(crewmate.id) !== String(id)),
  );
};
