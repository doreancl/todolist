import {ActionFunctionArgs, json, LoaderFunctionArgs, redirect, TypedResponse} from "@remix-run/node";
import {Form, Link, useFetcher, useLoaderData} from "@remix-run/react";
import invariant from "tiny-invariant";
import {TaskRecord, tasksRepository} from "~/models/todos.server";
import {getUserId} from "~/session.server";
import {formString} from "~/utils";
import type {FunctionComponent} from "react";

export const loader = async (
    {params,}: LoaderFunctionArgs
): Promise<TypedResponse<{ task: TaskRecord }>> => {
    invariant(params.todoId, "Missing task id");

    const {data, error} = await tasksRepository.get(params.todoId);
    if (error) {
        console.error(error);
        throw new Response("Not Found", {status: 404});
    }

    return json({task: data});
};

export const action = async (
    {request}: ActionFunctionArgs
) => {
    const userId = await getUserId(request);

    const formData = await request.formData();
    const {_action, ...values} = formString(formData);

    values.user_id = userId;

    console.debug("action", {_action, values}, Object.fromEntries(formData))

    if (_action === "update") {
        const {id, task} = values;
        const {data, error} = await tasksRepository.set(id, {
            task: task
        });
        console.debug({data, error});
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

        return redirect("/todos");
    }

    return true;
};

export default function EditTodo() {
    const {task} = useLoaderData<typeof loader>();

    return (
        <div>
            <Link
                className=""
                to={`/todos`}>
                X
            </Link>

            <div className="
            flex flex-row
            justify-between
            ">
                <Favorite task={task}/>


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
            <div className="
            flex flex-row
            ">

                <Form method="post" className="
            flex
            flex-col
            w-full justify-center p-2 border-2 border-black
            ">
                    <label htmlFor="task" className="sr-only">Task</label>
                    <input
                        id="task"
                        aria-label="Task Description"
                        name="task"
                        placeholder="task"
                        type="text"
                        minLength={4}
                        defaultValue={task.task}
                        className=""
                    />

                    <input
                        type="hidden"
                        name="id"
                        defaultValue={task.id}
                    />
                    <button
                        className="mt-5"
                        type="submit"
                        name="_action"
                        aria-label="update"
                        value="update"
                    >Save
                    </button>
                </Form>
            </div>
        </div>
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
