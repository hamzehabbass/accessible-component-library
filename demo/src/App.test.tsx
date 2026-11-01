import { axe } from "jest-axe";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("Namaa demo app", () => {
  it("searches the team table and shows an empty state", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole("searchbox", { name: "Search people" }), "Amina");
    expect(screen.getByRole("row", { name: /Amina Hassan/ })).toBeInTheDocument();
    expect(screen.queryByRole("row", { name: /Omar Khalil/ })).not.toBeInTheDocument();

    await user.clear(screen.getByRole("searchbox", { name: "Search people" }));
    await user.type(screen.getByRole("searchbox", { name: "Search people" }), "nobody");
    expect(screen.getByText("No teammates match your search.")).toBeInTheDocument();
  });

  it("has no automated accessibility violations on the dashboard", async () => {
    const { container } = render(<App />);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it("validates and adds a teammate through the invitation dialog", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getAllByRole("button", { name: "Invite a teammate" })[0]);
    const dialog = screen.getByRole("dialog", { name: "Invite someone new" });
    await user.click(within(dialog).getByRole("button", { name: "Send invitation" }));
    expect(within(dialog).getAllByRole("alert")).toHaveLength(2);

    await user.type(within(dialog).getByRole("textbox", { name: "Full name" }), "Maya Demo");
    await user.type(within(dialog).getByPlaceholderText("amina@example.com"), "maya@example.com");
    await user.selectOptions(within(dialog).getByRole("combobox", { name: "Role" }), "Designer");
    await user.click(within(dialog).getByRole("button", { name: "Send invitation" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("row", { name: /Maya Demo/ })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Invitation sent.");
    expect(screen.getByText("6 members")).toBeInTheDocument();
  });

  it("switches language, direction, theme, and account settings", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "العربية" }));
    expect(screen.getByRole("heading", { name: "صباح الخير، حمزة" })).toBeInTheDocument();
    expect(document.querySelector(".demo-app")).toHaveAttribute("lang", "ar");
    expect(document.querySelector(".acl-root")).toHaveAttribute("dir", "rtl");

    await user.click(screen.getByRole("button", { name: "داكن" }));
    expect(document.querySelector(".acl-root")).toHaveAttribute("data-theme", "dark");

    await user.click(screen.getByRole("button", { name: "الإعدادات" }));
    await user.click(screen.getByRole("tab", { name: "التفضيلات" }));
    const switchControl = screen.getByRole("switch", { name: "إشعارات البريد الإلكتروني" });
    expect(switchControl).toHaveAttribute("aria-checked", "true");
    await user.click(switchControl);
    expect(switchControl).toHaveAttribute("aria-checked", "false");

    fireEvent.change(screen.getByLabelText("موعد اجتماع الفريق"), {
      target: { value: "2026-03-14" },
    });
    await user.click(screen.getByRole("button", { name: "حفظ التفضيلات" }));
    expect(screen.getByRole("status")).toHaveTextContent("تم حفظ تفضيلاتك.");
  });
});
