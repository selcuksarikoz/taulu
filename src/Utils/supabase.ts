import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  String(process.env.SUPABASE_URL),
  String(process.env.SUPABASE_KEY),
);

export const getUserInfo = async (accessToken) => {
  try {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`User info request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
};

export async function createUser(userInfo: IGoogleUser, supabaseId: string) {
  const { data, error } = await supabase.from("users").upsert(
    [
      {
        auth_id: supabaseId,
        google_id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        is_pro: userInfo.is_pro || false,
      },
    ],
    {
      onConflict: "email",
    },
  );

  if (error) throw error;

  return data;
}

export async function signInWithGoogle(
  idToken: string,
): Promise<ISupabaseSession | any> {
  try {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
    });

    if (error) return error;

    return data;
  } catch (error) {
    throw error;
  }
}
