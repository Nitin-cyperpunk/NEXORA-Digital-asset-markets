import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button",()=>{it("renders its label",()=>{render(<Button>Continue</Button>);expect(screen.getByRole("button",{name:"Continue"})).toBeInTheDocument()});it("supports disabled state",()=>{render(<Button disabled>Continue</Button>);expect(screen.getByRole("button")).toBeDisabled()})});
