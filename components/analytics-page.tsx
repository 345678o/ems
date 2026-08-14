"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase/browserClient";

interface Event {
  id: string;
  name: string;
  start_datetime: string;
  end_datetime: string;
  event_type: string;
  status: string;
  venue: string;
  city: string;
  country: string;
  additional_details: string;
  created_at: string;
  updated_at: string;
}

interface AnalyticsPageProps {
  event: Event;
}

type DbTicket = {
  id: string;
  name: string;
  ticket_class: "general" | "vip" | "premium";
  price: number;
  inclusions: string[] | null;
  available_quantity: number;
  sold_quantity: number;
};

type DbCoupon = {
  id: string;
  code: string;
  discount_amount: number;
  discount_type: "percentage" | "fixed";
  max_uses: number;
  current_uses: number;
  is_active: boolean;
  created_at: string;
};

export function AnalyticsPage({ event }: AnalyticsPageProps) {
  const [tickets, setTickets] = useState<DbTicket[]>([]);
  const [coupons, setCoupons] = useState<DbCoupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!event?.id) return;
      setLoading(true);
      try {
        const [{ data: tix, error: tErr }, { data: cps, error: cErr }] =
          await Promise.all([
            supabase
              .from("event_tickets")
              .select(
                "id,name,ticket_class,price,inclusions,available_quantity,sold_quantity"
              )
              .eq("event_id", event.id),
            supabase
              .from("event_coupons")
              .select(
                "id,code,discount_amount,discount_type,max_uses,current_uses,is_active,created_at"
              )
              .eq("event_id", event.id)
              .order("created_at", { ascending: false }),
          ]);

        if (tErr) console.error("Error loading tickets:", tErr);
        if (cErr) console.error("Error loading coupons:", cErr);

        setTickets((tix as DbTicket[]) || []);
        setCoupons((cps as DbCoupon[]) || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [event?.id]);

  const totalRegistrations = useMemo(
    () => tickets.reduce((sum, t) => sum + (t.sold_quantity || 0), 0),
    [tickets]
  );

  const totalSale = useMemo(
    () =>
      tickets.reduce(
        (sum, t) => sum + (t.price || 0) * (t.sold_quantity || 0),
        0
      ),
    [tickets]
  );

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(isFinite(n) ? n : 0);

  // Use ticket revenue per ticket as series points (no timeseries available from schema)
  const salesData = useMemo(
    () =>
      tickets.map((t) => ({
        name: t.name,
        value: Math.round((t.price || 0) * (t.sold_quantity || 0)),
      })),
    [tickets]
  );

  const ticketsStatus = useMemo(
    () =>
      tickets.map((t) => {
        const sold = t.sold_quantity || 0;
        const available = t.available_quantity || 0;
        const capacity = sold + available;
        const percentage =
          capacity > 0 ? Math.round((sold / capacity) * 100) : 0;
        return { name: t.name, sold, total: available, percentage };
      }),
    [tickets]
  );

  return (
    <div className="p-6 bg-transparent min-h-screen">
      <div className="mb-6">
        <h1 className="text-white text-lg font-medium mb-4">
          Club - Event Dashboard - Analytics
        </h1>
      </div>

      {/* Event Transaction Section */}
      <Card className="bg-neutral-900 border-neutral-700 mb-6">
        <CardHeader>
          <CardTitle className="text-white text-lg">
            Event Transaction
          </CardTitle>
          <p className="text-neutral-400 text-sm">
            Here is the trend of tickets sold and amount collected
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Section */}
            <div className="lg:col-span-1">
              <Card className="bg-white p-4">
                <div className="mb-4">
                  <h3 className="text-sm text-gray-600 mb-1">Total Sales</h3>
                  <p className="text-2xl font-semibold">
                    {formatCurrency(totalSale)}
                  </p>
                </div>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData}>
                      <XAxis dataKey="name" hide />
                      <YAxis hide />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Metrics Grid */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              <Card className="bg-white p-4">
                <h3 className="text-sm text-gray-600 mb-1">
                  Today&apos;s Registration
                </h3>
                <p className="text-2xl font-semibold">0</p>
              </Card>
              <Card className="bg-white p-4">
                <h3 className="text-sm text-gray-600 mb-1">
                  Total Registrations
                </h3>
                <p className="text-2xl font-semibold">{totalRegistrations}</p>
              </Card>
              <Card className="bg-white p-4">
                <h3 className="text-sm text-gray-600 mb-1">
                  Today&apos;s Sale
                </h3>
                <p className="text-2xl font-semibold">{formatCurrency(0)}</p>
              </Card>
              <Card className="bg-white p-4">
                <h3 className="text-sm text-gray-600 mb-1">Total Sale</h3>
                <p className="text-2xl font-semibold">
                  {formatCurrency(totalSale)}
                </p>
              </Card>
              <Card className="bg-white p-4">
                <h3 className="text-sm text-gray-600 mb-1">
                  Today&apos;s Refunds
                </h3>
                <p className="text-2xl font-semibold">{formatCurrency(0)}</p>
              </Card>
              <Card className="bg-white p-4">
                <h3 className="text-sm text-gray-600 mb-1">Total Refunds</h3>
                <p className="text-2xl font-semibold">{formatCurrency(0)}</p>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Recent Transactions</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="bg-purple-600 text-white border-purple-600 hover:bg-purple-700"
            >
              View all
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Table Header */}
              <div className="grid grid-cols-5 gap-4 text-sm text-neutral-400 pb-2 border-b border-neutral-700">
                <span>Coupon</span>
                <span>Discount</span>
                <span>Created at</span>
                <span>Uses</span>
                <span>Status</span>
              </div>

              {/* Table Rows */}
              {coupons.map((c) => (
                <div
                  key={c.id}
                  className="grid grid-cols-5 gap-4 text-sm text-white py-2"
                >
                  <span className="font-mono">{c.code}</span>
                  <span className="text-neutral-400">
                    {c.discount_type === "percentage"
                      ? `${c.discount_amount}%`
                      : formatCurrency(c.discount_amount)}
                  </span>
                  <span className="text-neutral-400">
                    {new Date(c.created_at).toLocaleString()}
                  </span>
                  <span>
                    {c.current_uses}/{c.max_uses}
                  </span>
                  <Badge
                    className={
                      c.is_active
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                    }
                  >
                    {c.is_active ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                </div>
              ))}
              {!loading && coupons.length === 0 && (
                <div className="text-neutral-500 text-sm py-2">
                  No coupons yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tickets Status */}
        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">Tickets Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ticketsStatus.map((ticket, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white text-sm">
                      {ticket.name}({ticket.sold}/{ticket.total})
                    </span>
                    <span className="text-purple-400 text-sm font-medium">
                      {ticket.percentage}%
                    </span>
                  </div>
                  <Progress
                    value={ticket.percentage}
                    className="h-2 bg-neutral-700"
                  />
                </div>
              ))}
              {!loading && ticketsStatus.length === 0 && (
                <div className="text-neutral-500 text-sm">
                  No tickets created yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
