import {Form, NavLink, Outlet, useActionData, useLoaderData, useNavigation} from "@remix-run/react";
import {ActionFunctionArgs, json, LoaderFunctionArgs, TypedResponse} from "@remix-run/node";
import {TaskMutation, TaskRecord, tasksRepository} from "~/models/todos.server";
import * as React from "react";
import {getUser, getUserId} from "~/session.server";
import invariant from "tiny-invariant";
import {formString} from "~/utils";
import {IsComplete} from "~/routes/todos+/is_complete";
import {UserRecord} from "~/models/user.server";

export const loader = async (
    {request,}: LoaderFunctionArgs
): Promise<TypedResponse<{
    tasks: TaskRecord[];
    q: string;
    user: UserRecord;
}>> => {
    const url = new URL(request.url);

    const user = await getUser(request);
    invariant(user?.id, "Missing user");

    const {data, error} = await tasksRepository.getAll({user_id: user.id});
    if (error || !data) {
        console.error("Error fetching task:", error);
        throw new Response("Task not found", {status: 404});
    }

    const q = url.searchParams.get("q") || "";

    return json(
        {tasks: data, q, user}
    );
};

type TodosActionType = { success: boolean }
export const action = async (
    {request}: ActionFunctionArgs
): Promise<TodosActionType> => {
    const userId = await getUserId(request);

    const formData = await request.formData();
    const {_action, ...values} = formString(formData);

    values.user_id = userId;

    console.debug("action", {_action, values}, Object.fromEntries(formData))

    if (_action == "create_new") {
        const todolist: TaskMutation = {
            completed_at: null, deleted_at: null,
            is_complete: false, user_id: userId,
            task: values.task
        };

        const {data, error} = await tasksRepository.create(todolist);
        console.debug({data, error})
    }
    if (_action === "toggle_is_complete") {
        const {id} = values;
        const todoId = Number(id);
        const getTaskResponse = await tasksRepository.get({user_id: userId, id: todoId});
        if (getTaskResponse.error || !getTaskResponse.task) {
            return {success: false};
        }
        const {data, error} = await tasksRepository.set({user_id: userId, id: todoId}, {
            completed_at: getTaskResponse.task.completed_at ? null : new Date().toISOString(),
        });
        if(error || !error) {
            return {success: false};
        }
        console.debug({data});
    }
    if (_action === "destroy") {
        const {id} = values;
        const todoId = Number(id);
        const {data, error} = await tasksRepository.destroy({user_id: userId, id: todoId});
        console.debug({data, error});
    }
    return {success: true};
};

export default function Todos() {
    const {tasks, q, user} = useLoaderData<typeof loader>();
    const navigation = useNavigation();
    const actionData = useActionData<TodosActionType>();
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
            <div className="flex flex-row  h-full p-5 w-full">
                <div className="flex flex-col h-full">
                    <div className="h-36 flex items-center justify-center">
                        <h1>{user.email}</h1>
                    </div>
                    <div className="flex items-center justify-center pl-1">
                        {/*<h1>My Tasks</h1>*/}
                    </div>
                    <Form method="post" className="flex  justify-between p-2">
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
                    <nav className="flex  justify-center p-2">
                        {tasks && tasks.length ? (
                            <ul className=" ">
                                {tasks.map((task) => (
                                    <li key={task.id}
                                        className=" flex flex-row justify-between">
                                        <IsComplete task={task}/>

                                        <NavLink
                                            className={
                                                ({isActive, isPending}) =>
                                                    "" + (isActive ? "bg-gray-300" : isPending ? "" : "")
                                            }
                                            to={`${task.id}`}
                                        >
                                            <h3 className="
                                            overflow-hidden truncate flex cursor-pointer items-center
                                            font-medium
                                            hover:bg-red hover:text-white
                                            ">
                                                {task.task}
                                            </h3>
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
                <aside className="flex w-100 flex-col">
                    <div>Outlet</div>
                    <Outlet/>
                </aside>
            </div>
        </>
    );
}
