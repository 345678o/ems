"use client";

import { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Copy } from "lucide-react";
import type { DiscountType } from "@/types/database";

import type { Coupon } from "./types";

interface CouponsTabProps {
  coupons: Coupon[];
  newCoupon: {
    code: string;
    discount: number;
    type: "percentage" | "fixed";
    maxUses: number;
  };
  setNewCoupon: Dispatch<SetStateAction<CouponsTabProps["newCoupon"]>>;
  addCoupon: () => Promise<void> | void;
  toggleCoupon: (id: string) => Promise<void> | void;
  removeCoupon: (id: string) => Promise<void> | void;
}

export default function CouponsTab({
  coupons,
  newCoupon,
  setNewCoupon,
  addCoupon,
  toggleCoupon,
  removeCoupon,
}: CouponsTabProps) {
  return (
    <Card className="bg-neutral-900 border-neutral-700">
      <CardHeader>
        <CardTitle className="text-white">Coupon Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border border-neutral-600 rounded-lg p-4">
          <h3 className="text-white font-medium mb-4">Create New Coupon</h3>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <Label className="text-white">Coupon Code</Label>
              <Input
                value={newCoupon.code}
                onChange={(e) =>
                  setNewCoupon({ ...newCoupon, code: e.target.value })
                }
                placeholder="SAVE20"
                className="bg-neutral-800 border-neutral-600 text-white"
              />
            </div>
            <div>
              <Label className="text-white">Discount</Label>
              <Input
                type="number"
                value={newCoupon.discount}
                onChange={(e) =>
                  setNewCoupon({
                    ...newCoupon,
                    discount: Number(e.target.value),
                  })
                }
                className="bg-neutral-800 border-neutral-600 text-white"
              />
            </div>
            <div>
              <Label className="text-white">Type</Label>
              <Select
                value={newCoupon.type}
                onValueChange={(value) =>
                  setNewCoupon({ ...newCoupon, type: value as DiscountType })
                }
              >
                <SelectTrigger className="bg-neutral-800 border-neutral-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white">Max Uses</Label>
              <Input
                type="number"
                value={newCoupon.maxUses}
                onChange={(e) =>
                  setNewCoupon({
                    ...newCoupon,
                    maxUses: Number(e.target.value),
                  })
                }
                className="bg-neutral-800 border-neutral-600 text-white"
              />
            </div>
          </div>
          <Button
            onClick={addCoupon}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Coupon
          </Button>
        </div>

        <div className="space-y-3">
          <h3 className="text-white font-medium">Active Coupons</h3>
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="flex items-center justify-between bg-neutral-800 p-4 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <code className="bg-neutral-700 px-2 py-1 rounded text-white font-mono">
                    {coupon.code}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-neutral-400"
                    onClick={() => navigator.clipboard.writeText(coupon.code)}
                    title="Copy code"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <span className="text-white">
                  {coupon.discount}
                  {coupon.type === "percentage" ? "%" : "$"} off
                </span>
                <span className="text-neutral-400">
                  {coupon.currentUses}/{coupon.maxUses} uses
                </span>
                <Badge variant={coupon.active ? "default" : "secondary"}>
                  {coupon.active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={coupon.active}
                  onCheckedChange={() => toggleCoupon(coupon.id)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCoupon(coupon.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {coupons.length === 0 && (
            <p className="text-neutral-400 text-center py-8">
              No coupons created yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
