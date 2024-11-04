import {createClient} from "@supabase/supabase-js";
import invariant from "tiny-invariant";

type TaskMutation = {
    id?: number;
    user_id: string;
    task: string;
    is_complete: boolean;
};

export type TaskRecord = TaskMutation & {
    id: number;
    insertedAt: string;
};

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

invariant(
    supabaseUrl,
    "SUPABASE_URL must be set in your environment variables."
);
invariant(
    supabaseAnonKey,
    "SUPABASE_ANON_KEY must be set in your environment variables."
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const tasksRepository = {
    async getAll() {

        const {data, error} = await supabase
            .from('todos')
            .select('*')
            .order('id', {ascending: true});

        return {data, error};
    },

    async create(values: TaskMutation) {

        console.log("create", values)

        const {data, error} = await supabase
            .from('todos')
            .insert([
                values,
            ])
            .select()
        return {data, error};
    },

    async set(id: string, values: Partial<TaskMutation>) {

        console.log("set", id, values)

        const response = await supabase
            .from('todos')
            .update(values)
            .eq('id', id)
            .select();

        return response;
    },

    async get(id: string): Promise<TaskRecord | null> {
        throw new Error("Method 'get' is not implemented.");
    },

    async destroy(id: string): Promise<{ success: boolean }> {
        throw new Error("Method 'destroy' is not implemented.");
    },
};