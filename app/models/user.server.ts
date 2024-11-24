import {createClient} from "@supabase/supabase-js";
import invariant from "tiny-invariant";

export type UserMutation = { id: string; email: string };

export type UserRecord = UserMutation & {
    created_at: Date;
};

// Abstract this away
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

invariant(
    supabaseUrl,
    "SUPABASE_URL must be set in your environment variables."
);
invariant(
    supabaseAnonKey,
    "SUPABASE_ANON_KEY must be set in your environment variables."
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function createUser(email: string, password: string) {
    const {data, error} = await supabase.auth.signUp({
        email,
        password,
    });

    console.log("created user", {data, error});

    // get the user profile after created
    const profile = await getProfileByEmail(data.user?.email);

    console.log("created user", {profile});

    return profile;
}

export async function getProfileById(
    id: string
): Promise<{
    user: UserRecord;
    error: Error | null;
}> {
    const {data, error} = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

//    if (data) return {id: data.id, email: data.email};

    return {
        user: data as UserRecord, error
    };
}

export async function getProfileByEmail(email?: string) {
    const {data, error} = await supabase
        .from("profiles")
        .select("email, id")
        .eq("email", email)
        .single();


    if (error) {
        console.error("getProfileByEmail", {data, error});
        return null
    }

    if (data) return data;
}

export async function verifyLogin(email: string, password: string) {
    const {data, error} = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        const {code, message, status} = error || {}
        console.error("verifylogin", {data, error: {code, status, message}})

        return undefined;
    }
    const profile = await getProfileByEmail(data.user?.email);

    return profile;
}
