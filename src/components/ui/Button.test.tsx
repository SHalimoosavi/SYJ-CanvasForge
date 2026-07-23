import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("renders its label", () => {
    render(<Button>Save file</Button>);
    expect(screen.getByRole("button", { name: "Save file" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Click me" }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled while isLoading", () => {
    render(<Button isLoading>Exporting</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("does not call onClick when disabled", () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Disabled" }));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
