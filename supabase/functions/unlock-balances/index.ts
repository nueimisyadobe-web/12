import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find all active memberships that have passed their end_date and are not yet unlocked
    const { data: expiredMemberships, error: fetchError } = await supabase
      .from("memberships")
      .select("id, user_id, locked_amount, end_date")
      .eq("status", "active")
      .lt("end_date", new Date().toISOString())
      .eq("is_unlocked", false);

    if (fetchError) {
      throw new Error(`Failed to fetch memberships: ${fetchError.message}`);
    }

    if (!expiredMemberships || expiredMemberships.length === 0) {
      return new Response(
        JSON.stringify({ message: "No expired memberships to unlock", unlocked: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let unlockedCount = 0;

    for (const membership of expiredMemberships) {
      // Mark membership as expired and unlocked
      const { error: updateMemError } = await supabase
        .from("memberships")
        .update({
          status: "expired",
          is_unlocked: true,
        })
        .eq("id", membership.id);

      if (updateMemError) {
        console.error(`Failed to update membership ${membership.id}: ${updateMemError.message}`);
        continue;
      }

      // Move locked balance to available balance
      const { data: wallet, error: walletError } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", membership.user_id)
        .maybeSingle();

      if (walletError || !wallet) {
        console.error(`Failed to fetch wallet for user ${membership.user_id}`);
        continue;
      }

      const { error: updateWalletError } = await supabase
        .from("wallets")
        .update({
          locked_balance: Math.max(0, Number(wallet.locked_balance) - Number(membership.locked_amount)),
          available_balance: Number(wallet.available_balance) + Number(membership.locked_amount),
        })
        .eq("id", wallet.id);

      if (updateWalletError) {
        console.error(`Failed to update wallet for user ${membership.user_id}: ${updateWalletError.message}`);
        continue;
      }

      // Record unlock transaction
      await supabase.from("transactions").insert({
        user_id: membership.user_id,
        type: "unlock",
        amount: membership.locked_amount,
        status: "completed",
        reference_id: membership.id,
        reference_type: "game_session",
        description: `Membership lock period ended - ${formatCurrency(membership.locked_amount)} unlocked`,
      });

      unlockedCount++;
    }

    return new Response(
      JSON.stringify({
        message: `Successfully unlocked ${unlockedCount} membership(s)`,
        unlocked: unlockedCount,
        total: expiredMemberships.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in unlock-balances function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function formatCurrency(amount: number): string {
  return "$" + Number(amount).toFixed(2);
}

function createClient(url: string, key: string) {
  return {
    from(table: string) {
      const baseUrl = `${url}/rest/v1/${table}`;
      const headers: Record<string, string> = {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      };

      let query = "";
      const filters: Record<string, any> = {};

      const builder: any = {
        select(cols: string) {
          return this;
        },
        eq(col: string, val: any) {
          query += (query.includes("?") ? "&" : "?") + `${col}=eq.${val}`;
          return this;
        },
        lt(col: string, val: any) {
          query += (query.includes("?") ? "&" : "?") + `${col}=lt.${val}`;
          return this;
        },
        order(col: string, opts: any) {
          query += (query.includes("?") ? "&" : "?") + `order=${col}.${opts.ascending ? "asc" : "desc"}`;
          return this;
        },
        limit(n: number) {
          query += (query.includes("?") ? "&" : "?") + `limit=${n}`;
          return this;
        },
        maybeSingle() {
          query += (query.includes("?") ? "&" : "?") + `limit=1`;
          return this._execute("GET");
        },
        update(data: any) {
          filters._updateData = data;
          return {
            eq(col: string, val: any) {
              query += (query.includes("?") ? "&" : "?") + `${col}=eq.${val}`;
              return this._execute("PATCH");
            },
            _execute: () => this._execute("PATCH"),
          };
        },
        insert(data: any) {
          filters._insertData = data;
          return {
            select() {
              return { single: () => this._execute("POST") };
            },
            _execute: () => this._execute("POST"),
          };
        },
        _execute(method: string) {
          const url = `${baseUrl}${query}`;
          const body = method === "PATCH" ? JSON.stringify(filters._updateData) :
                       method === "POST" ? JSON.stringify(filters._insertData) :
                       undefined;

          return fetch(url, { method, headers, body })
            .then(async (res) => {
              const data = await res.json();
              if (!res.ok) {
                return { data: null, error: { message: data.message || data.msg || "Unknown error" } };
              }
              return { data: Array.isArray(data) ? data[0] || data : data, error: null };
            })
            .catch((err) => ({ data: null, error: { message: err.message } }));
        },
      };

      return builder;
    },
  };
}
