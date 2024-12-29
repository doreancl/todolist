import {Link} from "@remix-run/react";
import {useOptionalUser} from "~/utils";
import {getUser} from "~/session.server";
import {redirect} from "@remix-run/node";

export const loader = async ({request}) => {
    const user = await getUser(request);
    if (user) {
        return redirect("/todos");
    }
    return {success: true};
};

export default function Index() {
    const user = useOptionalUser();
    return (
        <main className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center">
            <div className="relative sm:pb-16 sm:pt-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
                        <div className="absolute inset-0">
                            <div className="absolute inset-0 bg-[color:rgba(139,92,246,0.5)] mix-blend-multiply"/>
                        </div>
                        <div className="lg:pb-18 relative px-4 pt-16 pb-8 sm:px-6 sm:pt-24 sm:pb-14 lg:px-8 lg:pt-32">
                            <h1 className="text-center text-6xl font-extrabold tracking-tight sm:text-8xl lg:text-9xl">
                <span className="block uppercase text-violet-500 drop-shadow-md">
                </span>
                            </h1>
                            <p className="mx-auto mt-6 max-w-lg text-center text-xl text-white sm:max-w-3xl">
                            </p>
                            <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
                                {user ? (
                                    <Link
                                        to="/todos"
                                        className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-violet-700 shadow-xs hover:bg-violet-50 sm:px-8"
                                    >
                                        View Todos for {user.email}
                                    </Link>
                                ) : (
                                    <div
                                        className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
                                        <Link
                                            to="/join"
                                            className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-violet-700 shadow-xs hover:bg-violet-50 sm:px-8"
                                        >
                                            Sign up
                                        </Link>
                                        <Link
                                            to="/login"
                                            className="flex items-center justify-center rounded-md bg-violet-500 px-4 py-3 font-medium text-white hover:bg-violet-600  "
                                        >
                                            Log In
                                        </Link>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl py-2 px-4 sm:px-6 lg:px-8">
                    <div className="mt-6 flex flex-wrap justify-center gap-8">

                    </div>
                </div>
            </div>
        </main>
    );
}
