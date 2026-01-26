import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data, error } = await supabaseAdmin
            .from("inventories")
            .select("*, items:inventory_items(count)")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return NextResponse.json({ inventories: data });
    } catch (error: any) {
        console.error("Inventory fetch error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name } = await req.json();
        if (!name?.trim()) {
            return NextResponse.json({ error: "Name required" }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from("inventories")
            .insert({
                user_id: session.user.id,
                name: name.trim(),
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ inventory: data });
    } catch (error: any) {
        console.error("Inventory create error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
