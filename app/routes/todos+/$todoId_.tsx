import {ActionFunctionArgs, json, LoaderFunctionArgs, redirect, TypedResponse} from "@remix-run/node";
import {Form, Link, useLoaderData} from "@remix-run/react";
import invariant from "tiny-invariant";
import {TaskRecord, tasksRepository} from "~/models/todos.server";
import {getUserId} from "~/session.server";
import {formString} from "~/utils";
import * as React from "react";
import {IsComplete} from "~/routes/todos+/is_complete";

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
            is_complete: isCompleteBool
        });
        console.debug("toggle_is_complete", {data, error});
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
    const [taskValue, setTaskValue] = React.useState(task.task);

    React.useEffect(() => {
        setTaskValue(task.task);
    }, [task]);

    return (
        <div>
            <Link
                className=""
                to={`/todos`}>
                Close
            </Link>

            <div className="
            flex flex-row
            justify-between
            ">
                <IsComplete task={task}/>

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
                        className="
                            flex items-center gap-2 rounded bg-primary py-2 px-4.5
                            font-medium text-white hover:bg-opacity-90
                        ">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                             viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                             className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
                        </svg>
                        Delete
                    </button>
                </Form>
            </div>
            <div className="flex flex-row">
                <Form method="post" className="flex flex-col w-full justify-center p-2">
                    <div className="mb-5">

                        <div>
                            <label
                                htmlFor="task"
                                className="mb-3 block text-sm font-medium text-black">
                            </label>
                            <textarea
                                id="task"
                                rows={3}
                                name="task"
                                placeholder="Enter task description"
                                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter"
                                value={taskValue}
                                onChange={(e) => setTaskValue(e.target.value)}
                            ></textarea>
                        </div>
                    </div>

                    <input
                        type="hidden"
                        name="id"
                        defaultValue={task.id}
                    />
                    <button
                        className="
                            flex items-center gap-2 rounded bg-primary py-2 px-4.5
                                font-medium text-white hover:bg-opacity-90
                        "
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