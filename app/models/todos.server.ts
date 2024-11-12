import {createClient} from "@supabase/supabase-js";
import invariant from "tiny-invariant";

export type TaskMutation = {
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
    async getAll(userId: string): Promise<TaskRecord[]> {

        const {data, error} = await supabase
            .from('todos')
            .select('*')
            .eq('user_id', userId)
            .order('id', {ascending: true});

        return {data, error};
    },

    async create(values: TaskMutation): Promise<TaskRecord> {

        console.debug("create", values)

        const {data, error} = await supabase
            .from('todos')
            .insert([
                values,
            ])
            .select()
        return {data, error};
    },

    async set(id: string, values: Partial<TaskMutation>): Promise<TaskRecord> {

        console.debug("set", id, values)

        const response = await supabase
            .from('todos')
            .update(values)
            .eq('id', id)
            .select();

        return response;
    },

    async get(id: string): Promise<TaskRecord> {
        const {data, error} = await supabase
            .from('todos')
            .select('*')
            .eq('id', id)
            .single()
        ;
        return {data, error};
    },

    async destroy(id: string): Promise<void> {
        console.debug("destroy", {id})

        const {data, error} = await supabase
            .from('todos')
            .delete()
            .eq('id', id)

        return {data, error};
    },
};