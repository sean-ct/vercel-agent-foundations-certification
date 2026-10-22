"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, ShoppingCart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/format";
import type { ProductDetailsToolInvocation } from "@/lib/agent";
import type { Product } from "@/lib/types";

interface AgentProductCardProps {
  invocation: ProductDetailsToolInvocation;
  onAsk?: (text: string) => void;
}

export function AgentProductCard({ invocation, onAsk }: AgentProductCardProps) {
  // Hooks must run before any early return below.
  const { addToCart, openCart } = useCart();
  const [added, setAdded] = useState(false);

  if (
    invocation.state === "input-streaming" ||
    invocation.state === "input-available"
  ) {
    const id = invocation.input?.productId;
    return (
      <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        Looking up{id ? ` "${id}"` : ""}…
      </div>
    );
  }

  if (invocation.state !== "output-available") return null;

  const output = invocation.output;

  if (!output) return null;

  if ("error" in output) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {output.error as string}
      </div>
    );
  }

  const image = output.images[0];
  const outOfStock = output.inStock === false;

  const handleAddToCart = () => {
    // The cart expects a full Product; our tool output has everything but createdAt.
    const product: Product = { ...output, createdAt: "" };
    addToCart(product, 1);
    setAdded(true);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {image && (
        <div className="relative aspect-4/3 bg-secondary">
          <Image
            src={image}
            alt={output.name}
            fill
            sizes="(min-width: 768px) 480px, 100vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold leading-tight">
              {output.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {formatPrice(output.price, output.currency)}
            </p>
          </div>
          {output.inStock !== null && (
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                !output.inStock
                  ? "bg-destructive/10 text-destructive"
                  : output.lowStock
                    ? "bg-amber-500/10 text-amber-600"
                    : "bg-emerald-500/10 text-emerald-600"
              }`}
            >
              {!output.inStock
                ? "Out of stock"
                : output.lowStock
                  ? `Only ${output.stock} left`
                  : "In stock"}
            </span>
          )}
        </div>
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {output.description}
        </p>
        {output.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {output.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {added ? (
            <Button size="sm" variant="secondary" onClick={openCart}>
              <Check />
              Added · View cart
            </Button>
          ) : (
            <Button size="sm" onClick={handleAddToCart} disabled={outOfStock}>
              <ShoppingCart />
              {outOfStock ? "Out of stock" : "Add to cart"}
            </Button>
          )}
          <Button size="sm" variant="outline" asChild>
            <Link href={`/products/${output.slug}`}>
              Details
              <ArrowRight />
            </Link>
          </Button>
          {onAsk && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onAsk(`Show me products similar to ${output.name}`)}
            >
              <Sparkles />
              More like this
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}