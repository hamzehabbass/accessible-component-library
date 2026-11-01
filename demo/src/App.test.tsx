import { axe } from "jest-axe";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

describe("Namaa demo app", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    window.localStorage.clear();
  });

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
    const user = userEvent.setup();
    const { container } = render(<App />);
    expect((await axe(container)).violations).toEqual([]);

    await user.click(screen.getByRole("button", { name: "العربية" }));
    await user.click(screen.getByRole("button", { name: "داكن" }));
    expect((await axe(container)).violations).toEqual([]);
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

  it("edits and removes teammates with a confirmation step", async () => {
    const user = userEvent.setup();
    render(<App />);

    const originalRow = screen.getByRole("row", { name: /Amina Hassan/ });
    await user.click(within(originalRow).getByRole("button", { name: "More actions: Amina Hassan" }));
    await user.click(screen.getByRole("menuitem", { name: "Edit" }));

    const editDialog = screen.getByRole("dialog", { name: "Edit" });
    await user.clear(within(editDialog).getByRole("textbox", { name: "Full name" }));
    await user.type(within(editDialog).getByRole("textbox", { name: "Full name" }), "Amina Updated");
    await user.selectOptions(within(editDialog).getByRole("combobox", { name: "Role" }), "Developer");
    await user.selectOptions(within(editDialog).getByRole("combobox", { name: "Status" }), "Invited");
    await user.click(within(editDialog).getByRole("button", { name: "Save changes" }));

    const updatedRow = screen.getByRole("row", { name: /Amina Updated/ });
    expect(updatedRow).toHaveTextContent("Developer");
    expect(updatedRow).toHaveTextContent("Invited");
    expect(screen.getByRole("status")).toHaveTextContent("Teammate details updated.");

    await user.click(within(updatedRow).getByRole("button", { name: "More actions: Amina Updated" }));
    await user.click(screen.getByRole("menuitem", { name: "Remove" }));
    const confirmation = screen.getByRole("dialog", { name: "Remove teammate?" });
    expect(confirmation).toHaveTextContent("Amina Updated");
    await user.click(within(confirmation).getByRole("button", { name: "Remove teammate" }));

    expect(screen.queryByRole("row", { name: /Amina Updated/ })).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Teammate removed.");
  });

  it("remembers teammates, language, and theme after reopening the workspace", async () => {
    const user = userEvent.setup();
    const firstRender = render(<App />);

    await user.click(screen.getAllByRole("button", { name: "Invite a teammate" })[0]);
    const dialog = screen.getByRole("dialog", { name: "Invite someone new" });
    await user.type(within(dialog).getByRole("textbox", { name: "Full name" }), "Maya Saved");
    await user.type(within(dialog).getByPlaceholderText("amina@example.com"), "maya-saved@example.com");
    await user.selectOptions(within(dialog).getByRole("combobox", { name: "Role" }), "Designer");
    await user.click(within(dialog).getByRole("button", { name: "Send invitation" }));

    await user.click(screen.getByRole("button", { name: "العربية" }));
    await user.click(screen.getByRole("button", { name: "داكن" }));
    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem("namaa-demo-workspace-v1") ?? "{}");
      expect(saved.members).toHaveLength(6);
      expect(saved.direction).toBe("rtl");
      expect(saved.theme).toBe("dark");
    });

    firstRender.unmount();
    render(<App />);

    expect(screen.getByRole("heading", { name: "صباح الخير، حمزة" })).toBeInTheDocument();
    expect(document.querySelector(".acl-root")).toHaveAttribute("dir", "rtl");
    expect(document.querySelector(".acl-root")).toHaveAttribute("data-theme", "dark");
    await user.click(screen.getByRole("button", { name: "Page 2" }));
    expect(screen.getByRole("row", { name: /Maya Saved/ })).toBeInTheDocument();
  });

  it("downloads a CSV export of the team", async () => {
    const user = userEvent.setup();
    const createObjectURL = vi.fn((blob: Blob) => `blob:namaa-team-${blob.size}`);
    const revokeObjectURL = vi.fn((url: string) => expect(url).toContain("blob:namaa-team"));
    const TestURL = class extends URL {};
    Object.assign(TestURL, { createObjectURL, revokeObjectURL });
    vi.stubGlobal("URL", TestURL);

    let downloadName = "";
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      downloadName = this.download;
    });

    render(<App />);
    await user.click(screen.getByRole("button", { name: /^More actions$/ }));
    await user.click(screen.getByRole("menuitem", { name: "Download team list" }));

    expect(createObjectURL).toHaveBeenCalledOnce();
    const blob = createObjectURL.mock.calls[0][0];
    expect(blob).toBeInstanceOf(Blob);
    expect(downloadName).toBe("namaa-team.csv");
    const csv = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsText(blob);
    });
    expect(csv).toContain('"Name","Work email","Role","Status"');
    expect(csv).toContain('"Amina Hassan","amina@example.com","Designer","Active"');
    await waitFor(() => expect(revokeObjectURL).toHaveBeenCalledOnce());
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
