import { useState } from "react";
import { axe } from "jest-axe";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Accordion,
  Button,
  Checkbox,
  DataTable,
  DatePicker,
  DropdownMenu,
  Drawer,
  FormField,
  Input,
  Modal,
  Pagination,
  Radio,
  Select,
  Switch,
  Tabs,
  ThemeProvider,
  Toast,
  Tooltip,
} from "./components";

describe("accessible component library", () => {
  it("renders button variants and preserves native button behavior", () => {
    render(<Button variant="secondary">Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveClass("acl-button--secondary");
  });

  it("associates form controls with labels, hints, and validation errors", () => {
    render(
      <FormField label="Email" description="Use a work address." error="Enter a valid email." required>
        <Input type="email" />
      </FormField>,
    );
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.getAttribute("aria-describedby")).toContain("description");
    expect(input.getAttribute("aria-describedby")).toContain("error");
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a valid email.");
  });

  it("renders labelled native select, checkbox, and radio controls", () => {
    render(
      <>
        <FormField label="Country">
          <Select defaultValue="jo">
            <option value="jo">Jordan</option>
          </Select>
        </FormField>
        <Checkbox defaultChecked>Remember me</Checkbox>
        <Radio name="plan" value="basic">
          Basic plan
        </Radio>
      </>,
    );
    expect(screen.getByRole("combobox", { name: "Country" })).toHaveValue("jo");
    expect(screen.getByRole("checkbox", { name: "Remember me" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Basic plan" })).toBeInTheDocument();
  });

  it("toggles the switch and exposes its checked state", async () => {
    const user = userEvent.setup();
    function Example() {
      const [checked, setChecked] = useState(false);
      return <Switch label="Notifications" checked={checked} onCheckedChange={setChecked} />;
    }
    render(<Example />);
    const toggle = screen.getByRole("switch", { name: "Notifications" });
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  it("traps modal focus, closes with Escape, and restores focus", async () => {
    const user = userEvent.setup();
    function Example() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Open dialog</Button>
          <Modal open={open} onClose={() => setOpen(false)} title="Preferences">
            <Button>Apply</Button>
          </Modal>
        </>
      );
    }
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Open dialog" });
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Preferences" });
    const closeButton = screen.getByRole("button", { name: "Close dialog" });
    expect(dialog).toContainElement(closeButton);
    expect(closeButton).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Apply" })).toHaveFocus();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it("uses dialog semantics for the drawer and closes from its backdrop", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Drawer open onClose={onClose} title="Navigation">
        <p>Links</p>
      </Drawer>,
    );
    expect(screen.getByRole("dialog", { name: "Navigation" })).toHaveAttribute("aria-modal", "true");
    await user.click(screen.getByRole("dialog").parentElement!);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("supports roving keyboard focus and selection in tabs", async () => {
    const user = userEvent.setup();
    render(
      <Tabs
        items={[
          { id: "profile", label: "Profile", content: "Profile panel" },
          { id: "security", label: "Security", content: "Security panel" },
        ]}
      />,
    );
    const profile = screen.getByRole("tab", { name: "Profile" });
    profile.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Security" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "Security" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Security panel");
  });

  it("expands accordion sections and exposes the controlled region", async () => {
    const user = userEvent.setup();
    render(
      <Accordion items={[{ id: "faq", title: "Shipping", content: "Three business days." }]} />,
    );
    await user.click(screen.getByRole("button", { name: "Shipping" }));
    expect(screen.getByRole("button", { name: "Shipping" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region", { name: "Shipping" })).toHaveTextContent("Three business days.");
  });

  it("opens a menu with keyboard access and returns focus on Escape", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu
        label="Actions"
        items={[{ label: "Edit", onSelect: vi.fn() }, { label: "Delete", onSelect: vi.fn() }]}
      />,
    );
    const trigger = screen.getByRole("button", { name: "Actions" });
    await user.click(trigger);
    expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("connects tooltip descriptions to the trigger", () => {
    render(
      <Tooltip content="Save changes">
        <Button>Save</Button>
      </Tooltip>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(button.getAttribute("aria-describedby")).toBeTruthy();
    expect(screen.getByRole("tooltip")).toHaveTextContent("Save changes");
  });

  it("announces and dismisses a toast", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<Toast onDismiss={onDismiss}>Saved successfully.</Toast>);
    expect(screen.getByRole("status")).toHaveTextContent("Saved successfully.");
    await user.click(screen.getByRole("button", { name: "Dismiss notification" }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("changes pagination and announces the current page", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination page={2} pageCount={3} onPageChange={onPageChange} />);
    expect(screen.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("sorts table rows and exposes sort direction", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        caption="People"
        columns={[{ key: "name", header: "Name", sortable: true }]}
        rows={[
          { id: 1, name: "Zara" },
          { id: 2, name: "Amina" },
        ]}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Name" }));
    expect(screen.getByRole("columnheader", { name: "Name" })).toHaveAttribute("aria-sort", "ascending");
    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Amina");
  });

  it("updates the date picker with a local calendar date", () => {
    const onChange = vi.fn();
    render(<DatePicker label="Start date" value={null} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Start date"), { target: { value: "2026-03-14" } });
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 2, 14));
  });

  it("supports RTL and theme settings on the root provider", () => {
    render(
      <ThemeProvider dir="rtl" theme="dark">
        <Button>حفظ</Button>
      </ThemeProvider>,
    );
    expect(screen.getByText("حفظ").closest(".acl-root")).toHaveAttribute("dir", "rtl");
    expect(screen.getByText("حفظ").closest(".acl-root")).toHaveAttribute("data-theme", "dark");
  });

  it("has no axe violations in a labelled form", async () => {
    const { container } = render(
      <FormField label="Full name" description="Enter your legal name.">
        <Input autoComplete="name" />
      </FormField>,
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it("has no axe violations in the open modal", async () => {
    const { container } = render(
      <Modal open onClose={() => {}} title="Account">
        <p>Account details.</p>
      </Modal>,
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
