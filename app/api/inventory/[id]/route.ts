import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/db";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Standard Next.js 15+ async params
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Verify ownership first
        const { data: inventory, error: invError } = await supabaseAdmin
            .from("inventories")
            .select("id")
            .eq("id", id)
            .eq("user_id", session.user.id)
            .single();

        if (invError || !inventory) {
            return NextResponse.json({ error: "Inventory not found or access denied" }, { status: 404 });
        }

        const { data, error } = await supabaseAdmin
            .from("inventory_items")
            .select("*")
            .eq("inventory_id", id)
            .order("added_at", { ascending: false });

        if (error) throw error;

        return NextResponse.json({ items: data });
    } catch (error: any) {
        console.error("Inventory items fetch error:", error);
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

        const { error } = await supabaseAdmin
            .from("inventories")
            .delete()
            .eq("id", id)
            .eq("user_id", session.user.id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Inventory delete error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
