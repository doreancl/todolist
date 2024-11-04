import type {LinksFunction, LoaderFunctionArgs} from "@remix-run/node";
import {json, MetaFunction, redirect} from "@remix-run/node";
import {Form, Link, Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData} from "@remix-run/react";
import {getUser, sessionStorage} from "./session.server";
import appStylesHref from "./app.css?url";
import "./tailwind.css";

export const meta: MetaFunction = () => {
    return [{title: "Doreancl TODO LIST"}];
};

export const links: LinksFunction = () => [
    {rel: "stylesheet", href: appStylesHref},
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
        <p>ROOT</p>
        <div className="w-full h-full p-5 bg-yellow-100">
            <div id="sidebar">
                <>
                    {
                        user ? (
                            <>
                                <Link to={`/todos`}>
                                    Todos
                                </Link>
                                <Link to={`/things`}>
                                    Things
                                </Link>
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