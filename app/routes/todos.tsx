import {Form, NavLink, Outlet, useActionData, useFetcher, useLoaderData, useNavigation} from "@remix-run/react";
import {ActionFunctionArgs, json, LoaderFunctionArgs} from "@remix-run/node";
import {TaskMutation, TaskRecord, tasksRepository} from "~/models/todos.server";
import * as React from "react";
import {type FunctionComponent} from "react";
import {getUser, getUserId} from "~/session.server";
import invariant from "tiny-invariant";
import {formString} from "~/utils";

export const loader = async ({
                                 request,
                             }: LoaderFunctionArgs) => {
    const url = new URL(request.url);

    const {data, error} = await tasksRepository.getAll();
    if (error) {
        console.error(error);
    }
    const q = url.searchParams.get("q");
    const user = await getUser(request);
    invariant(user?.id, "Missing user");
    return json({tasks: data, q, user});
};

export const action = async ({request}: ActionFunctionArgs) => {
    const userId = await getUserId(request);

    const formData = await request.formData();
    const {_action, ...values} = formString(formData);

    values.user_id = userId;

    console.debug("action", {_action, values}, Object.fromEntries(formData))

    if (_action == "create_new") {
        const todolist: TaskMutation = {
            is_complete: false, user_id: userId,
            task: values.task
        };

        const {data, error} = await tasksRepository.create(todolist);
        console.debug({data, error})
    }

    if (_action === "toggle_is_complete") {
        const {id, is_complete} = values;
        const isCompleteBool = is_complete === 'true';
        const {data, error} = await tasksRepository.set(id, {
            is_complete: !isCompleteBool
        });
        console.debug({data, error});
    }

    if (_action === "destroy") {
        const {id} = values;
        const {data, error} = await tasksRepository.destroy(id);
        console.debug({data, error});
    }

    return {success: true};
};

export default function Todos() {
    const {tasks, q, user} = useLoaderData<typeof loader>();
    const navigation = useNavigation();
    const actionData = useActionData();
    const taskRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (actionData?.success) {
            if (taskRef?.current) {
                (taskRef.current as HTMLInputElement).value = "";
            }
        }
    }, [actionData]);

    React.useEffect(() => {
        console.debug({user}, {tasks})
    }, [tasks, user]);

    React.useEffect(() => {
        const searchField = document.getElementById("q");
        if (searchField instanceof HTMLInputElement) {
            searchField.value = q || "";
        }
    }, [q]);

    const searching =
        navigation.location &&
        new URLSearchParams(navigation.location.search).has("q");

    return (
        <>
            <div className="
                flex flex-row
                w-full h-full p-5 bg-red-100
            ">
                <div className="
                    flex flex-col
                    h-full
                    border-2 border-green-900
                ">
                    <div className="
                    h-36 flex
                    items-center justify-center
                    border-2 border-black
                ">
                        <h1>{user.email}</h1>
                    </div>
                    <div className="
                    flex
                    items-center justify-center
                    pl-1 border-2 border-black
                 ">
                        <h1>My Tasks</h1>
                    </div>
                    <Form method="post" className="flex w-full justify-center p-2 border-2 border-black">
                        <label htmlFor="task" className="sr-only">Task</label>
                        <input
                            id="task"
                            aria-label="Create a new TODO..."
                            name="task"
                            placeholder="task"
                            type="text"
                            minLength={4}
                            className=""
                            ref={taskRef}
                        />

                        <div
                            aria-hidden
                            id="search-spinner"
                            hidden={!searching}
                        />
                        <button
                            type="submit"
                            name="_action"
                            aria-label="create new"
                            value="create_new"
                        >New
                        </button>
                    </Form>
                    <nav className="flex w-full justify-center p-2 border-2 border-black">
                        {tasks && tasks.length ? (
                            <ul className=" w-full">
                                {tasks.map((task) => (
                                    <li key={task.id} className="border-2 border-black w-auto">


                                        <div className="
                                                flex flex-row justify-between
                                            ">
                                            <Favorite task={task}/>

                                            <NavLink
                                                className={
                                                    ({isActive, isPending}) =>
                                                        isActive
                                                            ? "active"
                                                            : isPending
                                                                ? "pending"
                                                                : "ASS"
                                                }
                                                to={`${task.id}`}
                                            >
                                                <span>{task.task}</span>
                                            </NavLink>

                                            <Form
                                                method="post"
                                                onSubmit={(event) => {
                                                    const response = confirm(
                                                        "Please confirm you want to delete this record."
                                                    );
                                                    if (!response) {
                                                        event.preventDefault();
                                                    }
                                                }}
                                            >
                                                <input
                                                    type="hidden"
                                                    name="id"
                                                    defaultValue={task.id}
                                                />
                                                <button
                                                    type="submit"
                                                    name="_action"
                                                    value="destroy"
                                                >Delete
                                                </button>
                                            </Form>

                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>
                                <i>No TODOs</i>
                            </p>
                        )}
                    </nav>
                </div>
                <aside className="
                    w-52
                    border-2 border-blue-900
                ">
                    <div>Outlet</div>
                    <Outlet/>
                </aside>
            </div>
        </>
    );
}

const Favorite: FunctionComponent<{ task: TaskRecord; }> = ({task}) => {

    const fetcher = useFetcher();

    const is_complete = task.is_complete;

    return (
        <fetcher.Form method="post" className="w-1/4">
            <input
                type="hidden"
                name="id"
                defaultValue={task.id}
            />
            <input
                type="hidden"
                name="is_complete"
                defaultValue={task.is_complete.toString()}
            />
            <button
                className="w-full"
                aria-label={
                    is_complete
                        ? "Remove from favorites"
                        : "Add to favorites"
                }
                name="_action"
                value="toggle_is_complete"
            >
                {is_complete ? "★" : "☆"}
            </button>
        </fetcher.Form>
    );
};