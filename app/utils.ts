import {useMemo} from "react";
import {useMatches} from "@remix-run/react";
import type {UserMutation} from "./models/user.server";

export const CONTENT_TYPES = {
    TODO_CARD: "application/remix-card-todo",
};

export function useMatchesData(id: string): any {
    const matchingRoutes = useMatches();
    const route = useMemo(
        () => matchingRoutes.find((route) => route.id === id),
        [matchingRoutes, id]
    );

    return route?.data;
}

export function isUser(user: UserMutation) {
    return user && typeof user === "object";
}

export function useOptionalUser() {
    const data = useMatchesData("root");
    if (!data || !isUser(data.user)) {
        return undefined;
    }
    return data.user;
}

export function validateEmail(email: unknown): email is string {
    return typeof email === "string" && email.length > 3 && email.includes("@");
}

export function formString(formData: FormData) {
    return Object.fromEntries(
        Array.from(formData.entries()).map(([key, value]) => [key, String(value)])
    ) as Record<string, string>;
}