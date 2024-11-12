import {Form, NavLink, Outlet, useActionData, useFetcher, useLoaderData, useNavigation} from "@remix-run/react";
import {ActionFunctionArgs, json, LoaderFunctionArgs, TypedResponse} from "@remix-run/node";
import {TaskMutation, TaskRecord, tasksRepository} from "~/models/todos.server";
import * as React from "react";
import {type FunctionComponent, useState} from "react";
import {getUser, getUserId} from "~/session.server";
import invariant from "tiny-invariant";
import {formString} from "~/utils";

export const loader = async (
    {request,}: LoaderFunctionArgs
): Promise<TypedResponse<{
    tasks: TaskRecord[];
    q: string;
    user: never;
}>> => {
    const url = new URL(request.url);

    const user = await getUser(request);
    invariant(user?.id, "Missing user");

    const {data, error} = await tasksRepository.getAll(user.id);
    if (error) {
        console.error(error);
    }
    const q = url.searchParams.get("q") || "";

    return json(
        {tasks: data, q, user}
    );
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
                w-full h-full p-5
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
                    <Form method="post" className="
                    flex w-full justify-between p-2 border-2 border-black
                    ">

                        <input type="text" name="task" id="taskTitle"
                               placeholder="Enter task title"
                               ref={taskRef}
                               className="
                                   w-3/4 rounded-sm border border-stroke bg-white px-4.5 py-3 text-black
                                   focus:border-primary focus-visible:outline-none
                                   "
                               minLength={4}
                        />

                        <button
                            type="submit"
                            name="_action"
                            aria-label="create new"
                            value="create_new"
                            className="
                                flex items-center gap-2 rounded bg-primary py-2 px-4.5
                                font-medium text-white hover:bg-opacity-90
                            "
                        >
                            {"+ Add task"}
                        </button>
                        <div
                            aria-hidden
                            id="search-spinner"
                            hidden={!searching}
                        />


                    </Form>
                    <nav className="flex w-full justify-center p-2 border-2 border-black">
                        {tasks && tasks.length ? (
                            <ul className=" w-full">
                                {tasks.map((task) => (
                                    <li key={task.id}
                                        className="border-2 border-black w-full flex flex-row justify-between">
                                        {/*<Favorite task={task}/>*/}
                                        <Favorite2 task={task}/>

                                        {/*<CheckboxTwo task={task}/>*/}

                                        <NavLink
                                            className={
                                                ({isActive, isPending}) =>
                                                    "" + (isActive ? "bg-gray-300" : isPending ? "" : "")
                                            }
                                            to={`${task.id}`}
                                        >
                                            <div className="flex cursor-pointer items-center hover:bg-gray-300 ">

                                                <p>{task.task}</p>
                                            </div>
                                        </NavLink>

                                        <Form
                                            className="flex"
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
                                                className=""
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                                     viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                                                     className="size-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round"
                                                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
                                                </svg>

                                            </button>
                                        </Form>

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

const Favorite2: FunctionComponent<{ task: TaskRecord | TaskMutation; }> = ({task}) => {
    const fetcher = useFetcher();
    const [isChecked, setIsChecked] = useState<boolean>(task.is_complete);

    invariant(task.id, "Missing todos id");

    return (
        <fetcher.Form method="post" className="flex">
            <button
                type="button"
                className="flex items-center cursor-pointer select-none"
                onClick={() => {
                    setIsChecked(!isChecked);
                    fetcher.submit({
                        id: task.id.toString(),
                        is_complete: isChecked.toString(),
                        _action: "toggle_is_complete"
                    }, {method: "post"});
                }}
                aria-label={
                    isChecked
                        ? "Mark as incomplete"
                        : "Mark as complete"
                }
            >
                <div className="relative">
                    <input
                        type="checkbox"
                        id={task.id.toString()}
                        className="sr-only"
                        checked={isChecked}
                        onChange={() => {
                        }}
                    />
                    <div
                        className={`mr-4 flex h-5 w-5 items-center justify-center rounded border ${
                            isChecked ? "border-primary bg-gray dark:bg-transparent" : ""
                        }`}
                    >
                        <span className={`opacity-0 ${isChecked ? "!opacity-100" : ""}`}>
                            <svg
                                width="11"
                                height="8"
                                viewBox="0 0 11 8"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M10.0915 0.951972L10.0867 0.946075L10.0813 0.940568C9.90076 0.753564 9.61034 0.753146 9.42927 0.939309L4.16201 6.22962L1.58507 3.63469C1.40401 3.44841 1.11351 3.44879 0.932892 3.63584C0.755703 3.81933 0.755703 4.10875 0.932892 4.29224L0.932878 4.29225L0.934851 4.29424L3.58046 6.95832C3.73676 7.11955 3.94983 7.2 4.1473 7.2C4.36196 7.2 4.55963 7.11773 4.71406 6.9584L10.0468 1.60234C10.2436 1.4199 10.2421 1.1339 10.0915 0.951972ZM4.2327 6.30081L4.2317 6.2998C4.23206 6.30015 4.23237 6.30049 4.23269 6.30082L4.2327 6.30081Z"
                                    fill="#3056D3"
                                    stroke="#3056D3"
                                    strokeWidth="0.4"
                                ></path>
                            </svg>
                        </span>
                    </div>
                </div>
            </button>
        </fetcher.Form>
    );
};