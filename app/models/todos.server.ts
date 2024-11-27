import {createClient} from "@supabase/supabase-js";
import invariant from "tiny-invariant";

export type TaskMutation = {
    user_id: string;
    task: string;
    is_complete: boolean;
    deleted_at: string | null;
    completed_at: string | null;
    order: number;
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
    async getAll(
        {user_id}: Pick<TaskMutation, 'user_id'>
    ): Promise<{
        data: TaskRecord[] | null;
        error: Error | null;
    }> {

        const {data, error} = await supabase
            .from('todos')
            .select('*')
            .eq('user_id', user_id)
            .is('deleted_at', null)
            .order('order', {ascending: true})
        ;

        if (error) {
            return {data: null, error};
        }

        return {data: data as TaskRecord[], error};
    },

    async create(
        values: TaskMutation
    ): Promise<{
        data: TaskRecord | null;
        error: Error | null;
    }> {

        console.debug("create", values)

        const {data, error} = await supabase
            .from('todos')
            .insert([
                values,
            ])
            .select()
            .single();

        return {data: data as TaskRecord, error};
    },

    async set(
        {user_id, id}: Pick<TaskRecord, 'user_id' | 'id'>,
        values: Partial<TaskMutation>
    ): Promise<{
        data: TaskRecord | null;
        error: Error | null;
    }> {

        console.debug("set", id, values)

        const {data, error} = await supabase
            .from('todos')
            .update(values)
            .eq('id', id)
            .eq('user_id', user_id)
            .select()
            .single();

        return {data: data as TaskRecord, error};
    },

    async get(
        {user_id, id}: Pick<TaskRecord, 'user_id' | 'id'>
    ): Promise<{
        task: TaskRecord | null;
        error: Error | null;
    }> {
        const {data, error} = await supabase
            .from('todos')
            .select('*')
            .eq('id', id)
            .eq('user_id', user_id)
            .is('deleted_at', null)
            .single()
        ;
        return {task: data as TaskRecord, error};
    },

    async destroy(
        {user_id, id}: Pick<TaskRecord, 'user_id' | 'id'>
    ): Promise<{
        data: TaskRecord | null; error: Error | null
    }> {

        console.debug("destroy", {id});

        return this.set(
            {id, user_id},
            {deleted_at: new Date().toISOString(),}
        )
    },
};