import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { ROLE } from '../_shared/auth.ts'

const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

export async function notifyRole(roleId, title, body) {
    await notifyRoleGroup(roleId, title, body);
    if (roleId !== ROLE.ADMIN) {
        await notifyRoleGroup(ROLE.ADMIN, title, body);
    }
}

async function notifyRoleGroup(roleId, title, body) {
    const { data: accounts, error: fetchError } = await supabase
    .from("account")
    .select("id")
    .eq("role_id", roleId);

    if (fetchError) throw fetchError;

    const notifications = accounts.map(account => ({
        recipient: account.id,
        title,
        body,
    }));

    const { error: insertError } = await supabase
    .from("notification")
    .insert(notifications);

    if (insertError) throw insertError;
}

export async function notifyAccount(accountId, title, body) {
    const { error } = await supabase
    .from("notification")
    .insert({ recipient: accountId, title, body });

    if (error) throw error;
}
