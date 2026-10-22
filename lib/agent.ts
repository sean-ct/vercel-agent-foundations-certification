/**
 * This is where your agent will live.
 *
 * During the workshop you'll define a `ToolLoopAgent` here, give it a model
 * and instructions, and later add tools (web search, sandbox, etc.). The
 * route handler in `app/api/chat/route.ts` and the `useChat` call in
 * `components/agent-chat.tsx` will both import from this file.
 *
 * Workshop docs: https://agent-foundations-certification.vercel.app/docs/chat-agent
 */
import {
  ToolLoopAgent,
  type InferAgentUIMessage,
  type UIToolInvocation,
} from "ai";
import { searchProducts, getAllCategories, returnOrder, getProductDetails } from "@/lib/tools";

export const shoppingAgent = new ToolLoopAgent({
  model: "anthropic/claude-sonnet-5",
  instructions: `You are a friendly shopping assistant for Ship It Shop. 
  Respond like a samurai warrior whose highest possible honor is assisting you with shopping. 
  When the user asks about products, availability, or recommendations, use the searchProducts tool to look up real catalog data before answering.
  When asked about a type or category of product use the getAllCategories tool for getting valid categories before using searchProducts.
  When the user wants to return an order, use the returnOrder tool. Ask for the order ID and reason if they haven't provided them. Example order IDs are 11111, 22222, and 33333.
  When the user asks about a specific item — for details, images, or whether it's in stock — use the getProductDetails tool with the product's id or slug, rather than relying on the summary fields from searchProducts.`,
  tools: { searchProducts, getAllCategories, returnOrder, getProductDetails },
});

export type ShoppingAgentUIMessage = InferAgentUIMessage<typeof shoppingAgent>;
export type SearchProductsToolInvocation = UIToolInvocation<typeof searchProducts>;
export type ProductDetailsToolInvocation = UIToolInvocation<typeof getProductDetails>;