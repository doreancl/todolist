create table
    public.profiles (
                        id uuid not null,
                        created_at timestamp with time zone not null default current_timestamp,
                        email character varying not null,
                        constraint profiles_pkey primary key (id),
                        constraint profiles_id_fkey foreign key (id) references auth.users (id)
) tablespace pg_default;