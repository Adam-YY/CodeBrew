import { supabase } from "@/supabase/client";

export type MessageType = "Letter" | "Tradition" | "Heirloom";

export interface InsertLetterParams {
  unlock_date: `${number}-${number}-${number}`; // yyyy-mm-dd
  sender_id: string;
  recipient_id: string;
  message_type: MessageType;
  title: string;
  message: string;
}

export interface Letter {
  id: number;
  created_date: string;
  unlock_date: string | null;
  sender_id: string;
  recipient_id: string;
  message_type: MessageType;
  title: string;
  message: string;
}

// --- validators ---
const isValidDate = (date: string) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) return false;

  const d = new Date(date);
  return !isNaN(d.getTime()) && date === d.toISOString().slice(0, 10);
};

const isValidUUID = (id: string) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id);
};

const isValidMessageType = (type: string): type is MessageType => {
  return ["Letter", "Tradition", "Heirloom"].includes(type);
};

// --- main function ---
export const insertLetter = async ({
  unlock_date,
  sender_id,
  recipient_id,
  message_type,
  title,
  message,
}: InsertLetterParams): Promise<Letter> => {
  
  // 1. Validate Date (Handling potential null/optional date)
  if (unlock_date && !isValidDate(unlock_date)) {
    throw new Error("Invalid unlock_date format. Expected yyyy-mm-dd.");
  }

  // 2. Validate UUIDs
  // Sender must be a valid UUID
  if (!isValidUUID(sender_id)) {
    throw new Error("Invalid UUID for sender_id.");
  }

  // Recipient can be a valid UUID OR null
  if (recipient_id !== null && !isValidUUID(recipient_id)) {
    throw new Error("Invalid UUID for recipient_id.");
  }

  // 3. Validate Type & Content
  if (!isValidMessageType(message_type)) {
    throw new Error("Invalid message_type.");
  }

  if (!title.trim() || !message.trim()) {
    throw new Error("Title and message cannot be empty.");
  }

  // insert
  const { data, error } = await supabase
    .from("letter")
    .insert([
      {
        // If unlock_date is null, Supabase will use the column default
        unlock_date: unlock_date || null, 
        sender_id,
        recipient_id, // This will now correctly pass null to the DB
        message_type,
        title,
        message,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Letter;
};