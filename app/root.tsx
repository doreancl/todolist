import type {LinksFunction, LoaderFunctionArgs} from "@remix-run/node";
import {json, MetaFunction, redirect} from "@remix-run/node";
import {Form, Link, Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData} from "@remix-run/react";
import {getUser, sessionStorage} from "./session.server";

import stylesheet from "~/assets/styles/tailwind.css?url";
import stylesheetFont from "~/assets/fonts/satoshi.css?url";

export const meta: MetaFunction = () => {
    return [{title: "Doreancl TODO LIST"}];
};

export const links: LinksFunction = () => [
    { rel: "stylesheet", href: stylesheet },
    { rel: "stylesheet", href: stylesheetFont },
];

export async function loader({request}: LoaderFunctionArgs) {
    const user = await getUser(request);
    return json({user});
}

export const action = async ({request}) => {

    const formData = await request.formData();
    const {_action, ...values} = Object.fromEntries(formData);

    console.debug("action", {_action, values})

    if (_action == "logout") {
        const session = await sessionStorage.getSession(
            request.headers.get("Cookie")
        );
        return redirect("/", {
            headers: {
                "Set-Cookie": await sessionStorage.destroySession(session),
            },
        });
    }
    return true;
};

export default function App() {
    const {user} = useLoaderData<typeof loader>();

    return (
        <html lang="en">
        <head>
            <meta charSet="utf-8"/>
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
            />
            <Meta/>
            <Links/>
        </head>
        <body>
        <div className="w-full h-full flex">
            <div className="flex flex-col">
                <>
                    {
                        user ? (
                            <>
                                <h1>
                                    <Form method="post">
                                        <button
                                            type="submit"
                                            name="_action"
                                            aria-label="logout"
                                            value="logout"
                                        >logout
                                        </button>
                                    </Form>
                                </h1>
                            </>
                        ) : <></>
                    }
                </>
            </div>
            <Outlet/>
            <ScrollRestoration/>
            <Scripts/>
        </div>
        </body>
        </html>
    );
}