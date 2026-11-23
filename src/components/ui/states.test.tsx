import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";

describe("loading and feedback states",()=>{it("renders the empty state",()=>{render(<EmptyState title="No orders"/>);expect(screen.getByText("No orders")).toBeInTheDocument()});it("exposes errors to assistive technology",()=>{render(<ErrorState title="Offline"/>);expect(screen.getByRole("alert")).toHaveTextContent("Offline")});it("renders a loading skeleton",()=>{const {container}=render(<Skeleton/>);expect(container.firstChild).toHaveAttribute("aria-hidden","true")})});
