import type {ActionFunction} from "@remix-run/node";
import {redirect} from "@remix-run/node";
import {sessionStorage} from "~/session.server";
import {Form, Link} from "@remix-run/react";

export const action: ActionFunction = async ({request}) => {
    //return logout(request);

    const session = await sessionStorage.getSession(
        request.headers.get("Cookie")
    );
    return redirect("/login", {
        headers: {
            "Set-Cookie": await sessionStorage.destroySession(session),
        },
    });
};

export default function LogoutRoute() {
    return (
        <>
            <p>Are you sure you want to log out?</p>
            <Form method="post">
                <button>Logout</button>
            </Form>
            <Link to="/">Never mind</Link>
        </>
    );
}
