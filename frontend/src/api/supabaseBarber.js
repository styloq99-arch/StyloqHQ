import { supabase } from '../supabaseClient';

/**
 * Save Barber's customizable profile payload (JSONB)
 */
export async function saveBarberProfileData(barberId, profileData) {
  try {
    const { data, error } = await supabase
      .from('barbers')
      .update({ profile_data: profileData })
      .eq('user_id', barberId);

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error saving barber profile:', err);
    return { success: false, error: err };
  }
}

/**
 * Retrieve Barber's customizable profile payload (JSONB)
 */
export async function getBarberProfileData(barberId) {
  try {
    const { data, error } = await supabase
      .from('barbers')
      .select('profile_data')
      .eq('user_id', barberId)
      .maybeSingle();

    if (error) throw error;
    return { success: true, data: data?.profile_data || null };
  } catch (err) {
    console.error('Error fetching barber profile data:', err);
    return { success: false, error: err, data: null };
  }
}

/**
 * Submit a customer review for a barber
 */
export async function submitReview(barberId, customerId, authorName, authorAvatar, rating, reviewText, tags) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          barber_id: barberId,
          customer_id: customerId,
          author_name: authorName,
          author_avatar: authorAvatar,
          rating: rating,
          review_text: reviewText,
          tags: tags
        }
      ]);

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error submitting review:', err);
    return { success: false, error: err };
  }
}

/**
 * Retrieve all reviews for a specific barber
 */
export async function getBarberReviews(barberId) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('barber_id', barberId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return { success: false, error: err, data: [] };
  }
}
