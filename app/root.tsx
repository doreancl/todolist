import type {LinksFunction, LoaderFunctionArgs} from "@remix-run/node";
import {json, MetaFunction, redirect} from "@remix-run/node";
import {
    Form,
    Link,
    Links,
    LiveReload,
    Meta,
    NavLink,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLoaderData,
    useNavigation,
    useSubmit
} from "@remix-run/react";
import appStylesHref from "./app.css?url";
import {createEmptyContact, getContacts} from "./data";
import {useEffect} from "react";
import {getUser, sessionStorage} from "./session.server";

import "./tailwind.css";
import {useOptionalUser} from "~/utils";

export const meta: MetaFunction = () => {
    return [{title: "Doreancl TODO LIST"}];
};

export const links: LinksFunction = () => [
    {rel: "stylesheet", href: appStylesHref},
];

export const loader = async ({
                                 request,
                             }: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    const contacts = await getContacts(q);

    const user = await getUser(request);

    return json({contacts, q, user});
};

export const action = async ({request}) => {

    const formData = await request.formData();
    const {_action, ...values} = Object.fromEntries(formData);

    console.log("action", {_action, values})

    if (_action == "create_new") {
        const contact = await createEmptyContact();
        return redirect(`/contacts/${contact.id}/edit`);
    }

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
    const {contacts, q} = useLoaderData<typeof loader>();
    const navigation = useNavigation();
    const submit = useSubmit();
    const searching =
        navigation.location &&
        new URLSearchParams(navigation.location.search).has(
            "q"
        );
    const user = useOptionalUser();

    useEffect(() => {
        const searchField = document.getElementById("q");
        if (searchField instanceof HTMLInputElement) {
            searchField.value = q || "";
        }
    }, [q]);

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
        <div id="sidebar">
            <h1>
                <Link to={`/`}>
                    Remix Contacts
                </Link>
            </h1>
            {
                user ? (
                    <h1>

                        <Form method="post">
                            <button
                                type="submit"
                                name="_action"
                                aria-label="logout"
                                value="logout"
                            >logout</button>
                        </Form>

                    </h1>
                ) : <div></div>
            }
            <div>
                <Form id="search-form" role="search"
                      onChange={(event) => {
                          const isFirstSearch = q === null;
                          submit(event.currentTarget, {
                              replace: !isFirstSearch,
                          });
                      }}

                >
                    <input
                        aria-label="Search contacts"
                        id="q"
                        name="q"
                        placeholder="Search"
                        type="search"
                        defaultValue={q || ""}
                        className={searching ? "loading" : ""}
                    />
                    <div
                        aria-hidden
                        id="search-spinner"
                        hidden={!searching}
                    />
                </Form>
                <Form method="post">
                    <button
                        type="submit"
                        name="_action"
                        aria-label="create new"
                        value="create_new"
                    >New</button>
                </Form>
            </div>
            <nav>
                {contacts.length ? (
                    <ul>
                        {contacts.map((contact) => (
                            <li key={contact.id}>

                                <NavLink
                                    className={({isActive, isPending}) =>
                                        isActive
                                            ? "active"
                                            : isPending
                                                ? "pending"
                                                : ""
                                    }
                                    to={`contacts/${contact.id}`}
                                >
                                        {contact.first || contact.last ? (
                                            <>
                                                {contact.first} {contact.last}
                                            </>
                                        ) : (
                                            <i>No Name</i>
                                        )}{" "}
                                        {contact.favorite ? (
                                            <span>★</span>
                                        ) : null}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>
                        <i>No contacts</i>
                    </p>
                )}
            </nav>
        </div>
        <div id="detail" className={
            navigation.state === "loading" && !searching ? "loading" : "ass"
        }>
            <Outlet/>
        </div>
        <ScrollRestoration/>
        <Scripts/>
        </body>
        </html>
    );
}