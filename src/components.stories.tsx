import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
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
  Toast,
  Tooltip,
} from "./components";

const meta = {
  title: "Components/Accessible UI",
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          "Accessible, themeable React components. Use the Direction and Theme toolbar controls to preview Arabic RTL and dark mode.",
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ButtonStory: Story = {
  name: "Button",
  render: () => (
    <div className="acl-stack">
      <Button>Save changes</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="danger">Delete</Button>
      <Button disabled>Unavailable</Button>
    </div>
  ),
};

export const InputStory: Story = {
  name: "Input",
  render: () => (
    <FormField label="Email address" description="We will never share your email.">
      <Input type="email" placeholder="name@example.com" />
    </FormField>
  ),
};

export const SelectStory: Story = {
  name: "Select",
  render: () => (
    <FormField label="Choose a role">
      <Select defaultValue="">
        <option value="" disabled>
          Select a role
        </option>
        <option>Designer</option>
        <option>Developer</option>
      </Select>
    </FormField>
  ),
};

export const CheckboxStory: Story = {
  name: "Checkbox",
  render: () => <Checkbox defaultChecked>Subscribe to updates</Checkbox>,
};

export const RadioStory: Story = {
  name: "Radio",
  render: () => (
    <fieldset className="acl-choice-group">
      <legend>Choose a plan</legend>
      <Radio name="plan" value="starter">
        Starter
      </Radio>
      <Radio name="plan" value="team">
        Team
      </Radio>
    </fieldset>
  ),
};

export const SwitchStory: Story = {
  name: "Switch",
  render: function SwitchExample() {
    const [checked, setChecked] = useState(false);
    return (
      <div className="acl-stack">
        <Switch checked={checked} onCheckedChange={setChecked} label="Enable notifications" />
        <span>Notifications {checked ? "on" : "off"}</span>
      </div>
    );
  },
};

export const ModalStory: Story = {
  name: "Modal",
  render: function ModalExample() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open modal</Button>
        <Modal open={open} onClose={() => setOpen(false)} title="Confirm changes">
          <p>Changes will be saved for your account.</p>
          <Button onClick={() => setOpen(false)}>Continue</Button>
        </Modal>
      </>
    );
  },
};

export const DrawerStory: Story = {
  name: "Drawer",
  render: function DrawerExample() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open drawer</Button>
        <Drawer open={open} onClose={() => setOpen(false)} title="Navigation" placement="end">
          <p>Drawer content and controls.</p>
        </Drawer>
      </>
    );
  },
};

export const TabsStory: Story = {
  name: "Tabs",
  render: () => (
    <Tabs
      label="Account settings"
      items={[
        { id: "profile", label: "Profile", content: <p>Profile settings</p> },
        { id: "security", label: "Security", content: <p>Security settings</p> },
        { id: "billing", label: "Billing", content: <p>Billing settings</p> },
      ]}
    />
  ),
};

export const AccordionStory: Story = {
  name: "Accordion",
  render: () => (
    <Accordion
      items={[
        { id: "one", title: "What is this library?", content: "Accessible React components." },
        { id: "two", title: "Does it support RTL?", content: "Yes, including logical CSS properties." },
      ]}
    />
  ),
};

export const DropdownMenuStory: Story = {
  name: "Dropdown menu",
  render: () => (
    <DropdownMenu
      label="Actions"
      items={[
        { label: "Edit", onSelect: () => {} },
        { label: "Duplicate", onSelect: () => {} },
        { label: "Archive", onSelect: () => {} },
      ]}
    />
  ),
};

export const TooltipStory: Story = {
  name: "Tooltip",
  render: () => (
    <Tooltip content="Save your work">
      <Button variant="secondary">Save</Button>
    </Tooltip>
  ),
};

export const ToastStory: Story = {
  name: "Toast",
  render: () => <Toast onDismiss={() => {}}>Your changes have been saved.</Toast>,
};

export const PaginationStory: Story = {
  name: "Pagination",
  render: function PaginationExample() {
    const [page, setPage] = useState(2);
    return <Pagination page={page} pageCount={5} onPageChange={setPage} />;
  },
};

export const DataTableStory: Story = {
  name: "Data table",
  render: () => (
    <DataTable
      caption="Team members"
      columns={[
        { key: "name", header: "Name", sortable: true },
        { key: "role", header: "Role", sortable: true },
        { key: "active", header: "Active" },
      ]}
      rows={[
        { id: 1, name: "Amina", role: "Designer", active: "Yes" },
        { id: 2, name: "Omar", role: "Engineer", active: "Yes" },
      ]}
    />
  ),
};

export const DatePickerStory: Story = {
  name: "Date picker",
  render: function DatePickerExample() {
    const [date, setDate] = useState<Date | null>(null);
    return <DatePicker label="Start date" value={date} onChange={setDate} />;
  },
};

export const FormFieldStory: Story = {
  name: "Form field with validation",
  render: () => (
    <FormField label="Work email" description="Use your organization email." error="Enter a valid email address." required>
      <Input type="email" placeholder="you@company.com" />
    </FormField>
  ),
};

