import {createUserSession} from "~/utils/session.server";
import {createClient} from "@supabase/supabase-js";

const supabaseAuth = {
    supabase: createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
    ),
    signUp: () => {
        supabaseAuth.supabase.auth.signUp({
            email: "email@email.email",
            password: "sup3rs3cur3",
        })
    },

    signIn: ({email, password}: { email: string, password: string }) => {
        return supabaseAuth.supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })
    },

    signOut: () => {
        supabaseAuth.supabase.auth.signOut()
    }
};

const fakeAuth = {
    signUp: () => {
        throw new Error("Method not implemented");

    },
    signIn: ({email, password}: { email: string, password: string }) => {
        if (
            email == "testuser" &&
            password == "testuser"
        )
            return {
                data: {user: "juan", session: 1234}
            }
        else
            return {
                error: {message: "invalid credentials!!!"}
            };

    },
    signOut: () => {
        throw new Error("Method not implemented");
    }
};

//const authService = process.env.MOCKED_MODE! ? fakeAuth : supabaseAuth;
const authService = supabaseAuth;

export async function login(redirectTo: string, data: any) {

    const response = await authService.signIn({
        email: data.identifier,
        password: data.password,
    })

    //const response = await request.json();

    console.log("response", response);

    if (response.error) return {error: response.error};

    return await createUserSession(redirectTo, response.data.session);
}

