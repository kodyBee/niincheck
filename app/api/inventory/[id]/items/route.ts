import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/db";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const { niin, data } = await req.json();

        if (!niin) {
            return NextResponse.json({ error: "NIIN required" }, { status: 400 });
        }

        // Check ownership
        const { data: inventory } = await supabaseAdmin
            .from("inventories")
            .select("id")
            .eq("id", id)
            .eq("user_id", session.user.id)
            .single();

        if (!inventory) {
            return NextResponse.json({ error: "Inventory not found" }, { status: 404 });
        }

        const { error } = await supabaseAdmin
            .from("inventory_items")
            .insert({
                inventory_id: id,
                niin: niin,
                data: data || null, // Snapshot the data
            });

        if (error) {
            if (error.code === '23505') { // Unique violation
                return NextResponse.json({ error: "Item already in inventory" }, { status: 409 });
            }
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Inventory item add error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const niin = searchParams.get("niin");

        if (!niin) {
            return NextResponse.json({ error: "NIIN required" }, { status: 400 });
        }

        // Check ownership via join logic or two steps. Two steps is safer/easier with simple queries.
        const { data: inventory } = await supabaseAdmin
            .from("inventories")
            .select("id")
            .eq("id", id)
            .eq("user_id", session.user.id)
            .single();

        if (!inventory) {
            return NextResponse.json({ error: "Inventory not found" }, { status: 404 });
        }

        const { error } = await supabaseAdmin
            .from("inventory_items")
            .delete()
            .eq("inventory_id", id)
            .eq("niin", niin);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Inventory item delete error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
