import { getResultForUser } from "@/db/results";
import { getCurrentSession } from "@/lib/auth/current";
import { z } from "zod";

export async function GET(_request: Request, ctx: RouteContext<"/api/results/[id]">) {
    const { user } = await getCurrentSession();

    if (!user) {
        return Response.json({error: "unauthorized"}, { status: 401 });
    }

    const { id } = await ctx.params;
    const parsed = z.uuid().safeParse(id);

    if (!parsed.success) {
        return Response.json({error: "result_not_found"}, {status: 404});
    }

    const userResult = await getResultForUser(parsed.data, user.id);

    if (!userResult) {
        return Response.json({error: "result_not_found"}, { status: 404});
    }

    return Response.json(userResult);
}