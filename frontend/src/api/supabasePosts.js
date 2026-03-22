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

/**
 * Fetch all posts for the feed, including barber names
 */
export async function getSupabasePosts() {
  try {
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('id, barber_id, image_url, caption, likes, created_at')
      .order('created_at', { ascending: false });

    if (postsError) throw postsError;
    if (!postsData || postsData.length === 0) return { success: true, data: [] };

    const barberIds = [...new Set(postsData.map(p => p.barber_id))];
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, first_name, last_name')
      .in('id', barberIds);

    const userMap = {};
    if (!usersError && usersData) {
      usersData.forEach(u => {
        userMap[u.id] = u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim();
      });
    }

    const enrichedPosts = postsData.map(p => ({
      ...p,
      users: { full_name: userMap[p.barber_id] }
    }));

    return { success: true, data: enrichedPosts };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return { success: false, error, data: [] };
  }
}

/**
 * Fetch posts for a specific barber
 */
export async function getBarberPosts(barberId) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('barber_id', barberId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Error fetching barber posts:", error);
    return { success: false, error, data: [] };
  }
}
