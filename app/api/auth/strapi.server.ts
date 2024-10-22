import {createUserSession, getUserData} from "~/utils/session.server";

export async function login(redirectTo: string, data: any) {
    const baseUrl = process.env.STRAPI_API_URL;
    const query = `/api/auth/local`;
    const request = await fetch(baseUrl + query, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    const response = await request.json();
    if (response.error) return {error: response.error};
    return await createUserSession(redirectTo, {
        user: response.user,
        jwt: response.jwt,
    });
}


export async function userme(request: Request) {
    const user = await getUserData(request);
    if (!user) return null;

    const baseUrl = process.env.STRAPI_API_URL || "http://127.0.0.1:1337";
    const path = `/api/users/me`;

    try {
        const userRequest = await fetch(baseUrl + path, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                authorization: `Bearer ${user.jwt}`,
            },
        });

        const userData = await userRequest.json();
        return userData;
    } catch (error) {
        console.error(error);
        throw new Error("Error fetching user data");
    }
}

export async function register(redirectTo: string, data: any) {

    const baseUrl = process.env.STRAPI_API_URL
    const query = `/api/auth/local/register`;
    const request = await fetch(baseUrl + query, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })

    const response = await request.json();
    if (response.error) return {error: response.error};
    return await createUserSession(redirectTo, {user: response.user, jwt: response.jwt});
}