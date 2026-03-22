import { supabase } from "../supabaseClient";

/**
 * Upload an image to the Supabase 'posts' bucket
 * @param {File} file 
 * @param {string} barberId 
 * @returns {Promise<{url: string|null, error: Error|null}>}
 */
export async function uploadPostImage(file, barberId) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${barberId}-${Date.now()}.${fileExt}`;
    const filePath = `${barberId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('posts')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('posts')
      .getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
  } catch (error) {
    console.error("Error uploading image:", error);
    return { url: null, error };
  }
}

/**
 * Create a new post record in the database
 * @param {string} barberId - UUID of the barber
 * @param {string} imageUrl - Public URL of the image
 * @param {string} caption 
 * @returns {Promise<{success: boolean, data?: object, error?: Error}>}
 */
export async function createPostRecord(barberId, imageUrl, caption) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert([
        { 
          barber_id: barberId, 
          image_url: imageUrl, 
          caption: caption,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error("Error creating post record:", error);
    return { success: false, error };
  }
}
