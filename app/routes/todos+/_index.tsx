import {Form, Outlet, useFetcher, useLoaderData, useNavigation, useSubmit} from "@remix-run/react";
import {json, LoaderFunctionArgs} from "@remix-run/node";
import {TaskRecord, tasksRepository} from "~/models/todos.server";
import {type FunctionComponent, useEffect} from "react";
import {getUser, getUserId} from "~/session.server";
import invariant from "tiny-invariant";

export const loader = async ({
                                 request,
                             }: LoaderFunctionArgs) => {
    const url = new URL(request.url);

    const {data, error} = await tasksRepository.getAll();
    const q = url.searchParams.get("q");
    const user = await getUser(request);
    invariant(user?.id, "Missing user");
    return json({tasks: data, q, user});
};

export const action = async ({request}) => {
    const userId = await getUserId(request);

    const formData = await request.formData();
    const {_action, ...values} = Object.fromEntries(formData);

    values.user_id = userId;

    console.debug("action", {_action, values})

    if (_action == "create_new") {
        const {data, error} = await tasksRepository.create(values);
        console.debug({data, error})
    }

    if (_action == "toggle_is_compasdasdlete") {
        const {id} = values;
        const {data, error} = await tasksRepository.set(id, values);
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

    return true;
};

export default function _index() {
    const {tasks, q, user} = useLoaderData<typeof loader>();
    const submit = useSubmit();
    const navigation = useNavigation();

    useEffect(() => {
        console.debug({user}, {tasks})
    }, [tasks, user]);

    useEffect(() => {
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
            <p>index 1</p>
            <div className="w-full h-full p-5 bg-red-100">
                <div id="sidebar" className="border-2 border-red-300">
                    <div>
                        <Form id="search-form" method="post">
                            <input
                                aria-label="Create a new TODO..."
                                name="task"
                                placeholder="task"
                                type="text"
                                minLength={4}
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
                    </div>
                    <nav>
                        {tasks && tasks.length ? (
                            <ul>
                                {tasks.map((task) => (
                                    <li key={task.id}>
                                        <div>
                                            {task.task}
                                            <Favorite task={task}/>
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

                <div id="detail" className="border-2 border-red-300">
                    <div>Outlet</div>
                    <Outlet/>
                </div>
            </div>
        </>
    );
}

const Favorite: FunctionComponent<{
    task: TaskRecord;
}> = ({task}) => {

    const fetcher = useFetcher();

    const is_complete = task.is_complete;

    return (
        <fetcher.Form method="post">
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