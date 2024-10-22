import type {LinksFunction, LoaderFunctionArgs} from "@remix-run/node";
import {json, redirect} from "@remix-run/node";
import {
    Form,
    Link,
    Links,
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
import {createEmptyContact, getContacts} from "./api/data";
import {useEffect, useState} from "react";
import * as process from "node:process";
import {createClient} from "@supabase/supabase-js";
import Navbar from "~/components/Navbar";
import {navbar} from "~/utils/config";
import {createBrowserClient} from "@supabase/auth-helpers-remix";

export const meta = () => {
    return [
        {title: "Mi Sitio Web Genial"}
    ];
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

    const env = {
        SUPABASE_URL: process.env.SUPABASE_URL!,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
    }

    const user = null;

    const supabase = createClient(
        env.SUPABASE_URL!,
        env.SUPABASE_ANON_KEY!,
    )
    const {data, error} = await supabase.auth.getSession()

    console.log(data, error)

    return json({user, contacts, q, env});
};

export const action = async () => {
    const contact = await createEmptyContact();
    return redirect(`/contacts/${contact.id}/edit`);
};

export default function App() {
    const {user, contacts, q, env} = useLoaderData<typeof loader>();
    const [supabase] = useState(() => {
        return createBrowserClient(
            env.SUPABASE_URL!,
            env.SUPABASE_ANON_KEY!,
        )
    });
    const navigation = useNavigation();
    const submit = useSubmit();
    const searching =
        navigation.location &&
        new URLSearchParams(navigation.location.search).has(
            "q"
        );

    useEffect(() => {
        const searchField = document.getElementById("q");
        if (searchField instanceof HTMLInputElement) {
            searchField.value = q || "";
        }
    }, [q]);

    const signUp = () => {
        supabase.auth.signUp({
            email: "email@email.email",
            password: "sup3rs3cur3",
        })
    }

    const signIn = () => {
        supabase.auth.signInWithPassword({
            email: "email@email.email",
            password: "sup3rs3cur3",
        })
    }

    const signOut = () => {
        supabase.auth.signOut()
    }

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
        <Navbar
            links={navbar.links}
            logoUrl={navbar.navbarLogo.url}
            logoText={navbar.navbarLogo.text}
            user={user}
        />
        <div id="sidebar">
            <h1>
                <Link to={`/`}>
                    Remix Contacts
                </Link>
            </h1>
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
                    <button type="submit">New</button>
                </Form>

                <button onClick={signUp}>Sign Up</button>
                <button onClick={signIn}>Sign In</button>
                <button onClick={signOut}>Sign Out</button>
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